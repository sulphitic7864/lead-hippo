import { v4 as uuid } from "uuid";
import type {
  PoolConnection,
  RowDataPacket,
  ResultSetHeader,
} from "mysql2/promise";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { pool, query, transaction } from "../db/pool.js";
import { addMinutes, mysqlDate } from "../utils/dates.js";
import { HttpError, assert } from "../utils/errors.js";
import { normalizeEmail, normalizePhone } from "../utils/normalize.js";
import { getStripe } from "./stripe.service.js";
import { enqueueJob } from "./job.service.js";
import { sha256 } from "../utils/crypto.js";

interface CheckoutInput {
  leadCodes: string[];
  companyName: string;
  email: string;
  phone: string;
  marketingConsent: boolean;
  acceptedTerms: true;
  liabilityAccepted: true;
}
interface LeadRow extends RowDataPacket {
  id: number;
  lead_code: string;
  title: string;
  city: string;
  region: string;
  price_cents: number;
  currency: string;
  spots_remaining: number;
  status: string;
  expires_at: Date | null;
}
interface CheckoutRow extends RowDataPacket {
  id: string;
  status: string;
  buyer_company: string;
  buyer_email: string;
  buyer_phone: string;
}
interface ItemRow extends RowDataPacket {
  id: number;
  lead_id: number;
  unit_price_cents: number;
  reservation_released: number;
  title: string;
  lead_code: string;
  spots_remaining: number;
}

async function releaseCheckoutWithConnection(
  connection: PoolConnection,
  checkoutId: string,
  status: "EXPIRED" | "CANCELLED" | "FAILED",
) {
  const [sessions] = await connection.query<CheckoutRow[]>(
    "SELECT * FROM checkout_sessions WHERE id=? FOR UPDATE",
    [checkoutId],
  );
  const session = sessions[0];
  if (!session || !["CREATING", "PENDING"].includes(session.status))
    return false;
  const [items] = await connection.query<ItemRow[]>(
    "SELECT ci.*,l.spots_total FROM checkout_items ci JOIN leads l ON l.id=ci.lead_id WHERE ci.checkout_session_id=? FOR UPDATE",
    [checkoutId],
  );
  for (const item of items) {
    if (!item.reservation_released) {
      await connection.execute(
        "UPDATE leads SET spots_remaining=LEAST(spots_total,spots_remaining+1),status=CASE WHEN status='SOLD_OUT' THEN 'ACTIVE' ELSE status END,sold_out_at=NULL WHERE id=?",
        [item.lead_id],
      );
      await connection.execute(
        "UPDATE checkout_items SET reservation_released=1 WHERE id=?",
        [item.id],
      );
    }
  }
  await connection.execute("UPDATE checkout_sessions SET status=? WHERE id=?", [
    status,
    checkoutId,
  ]);
  return true;
}

export async function releaseCheckout(
  checkoutId: string,
  status: "EXPIRED" | "CANCELLED" | "FAILED" = "EXPIRED",
) {
  return transaction((c) =>
    releaseCheckoutWithConnection(c, checkoutId, status),
  );
}

export async function createCheckout(input: CheckoutInput) {
  const normalizedEmail = normalizeEmail(input.email),
    normalizedPhone = normalizePhone(input.phone);
  assert(
    normalizedPhone.length >= 7,
    422,
    "Please provide a valid phone number.",
    "INVALID_PHONE",
  );
  const checkoutId = uuid(),
    expiresAt = addMinutes(new Date(), env.CHECKOUT_RESERVATION_MINUTES);
  const leads = await transaction(async (connection) => {
    const marks = input.leadCodes.map(() => "?").join(",");
    const [rows] = await connection.query<LeadRow[]>(
      `SELECT id,lead_code,title,city,region,price_cents,currency,spots_remaining,status,expires_at FROM leads WHERE lead_code IN (${marks}) ORDER BY id FOR UPDATE`,
      input.leadCodes,
    );
    assert(
      rows.length === input.leadCodes.length,
      404,
      "One or more opportunities no longer exist.",
      "LEAD_NOT_FOUND",
    );
    for (const lead of rows) {
      assert(
        lead.status === "ACTIVE" && lead.spots_remaining > 0,
        409,
        `${lead.title} is sold out.`,
        "LEAD_SOLD_OUT",
      );
      assert(
        !lead.expires_at || new Date(lead.expires_at) > new Date(),
        409,
        `${lead.title} is no longer available.`,
        "LEAD_EXPIRED",
      );
      const [duplicates] = await connection.query<RowDataPacket[]>(
        `SELECT 1 FROM purchases p WHERE p.lead_id=? AND (LOWER(p.buyer_email)=? OR REPLACE(REPLACE(REPLACE(p.buyer_phone,' ',''),'-',''),'(', '') LIKE ?) LIMIT 1`,
        [lead.id, normalizedEmail, `%${normalizedPhone}`],
      );
      assert(
        !duplicates[0],
        409,
        `Your company has already purchased ${lead.title}.`,
        "DUPLICATE_PURCHASE",
      );
      const [pending] = await connection.query<RowDataPacket[]>(
        `SELECT 1 FROM checkout_items ci JOIN checkout_sessions cs ON cs.id=ci.checkout_session_id WHERE ci.lead_id=? AND cs.status IN ('CREATING','PENDING') AND cs.expires_at>UTC_TIMESTAMP() AND (cs.buyer_email_normalized=? OR cs.buyer_phone_normalized=?) LIMIT 1`,
        [lead.id, normalizedEmail, normalizedPhone],
      );
      assert(
        !pending[0],
        409,
        `${lead.title} is already in an active checkout for this buyer.`,
        "DUPLICATE_RESERVATION",
      );
    }
    const subtotal = rows.reduce((sum, l) => sum + l.price_cents, 0);
    await connection.execute(
      `INSERT INTO checkout_sessions(id,buyer_company,buyer_email,buyer_email_normalized,buyer_phone,buyer_phone_normalized,subtotal_cents,currency,status,marketing_consent,liability_accepted,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        checkoutId,
        input.companyName,
        input.email,
        normalizedEmail,
        input.phone,
        normalizedPhone,
        subtotal,
        "CAD",
        "CREATING",
        input.marketingConsent,
        input.liabilityAccepted,
        mysqlDate(expiresAt),
      ],
    );
    for (const lead of rows) {
      const [updated] = await connection.execute<ResultSetHeader>(
        "UPDATE leads SET spots_remaining=spots_remaining-1 WHERE id=? AND status='ACTIVE' AND spots_remaining>0",
        [lead.id],
      );
      assert(
        updated.affectedRows === 1,
        409,
        `${lead.title} has just sold out.`,
        "LEAD_SOLD_OUT",
      );
      await connection.execute(
        "INSERT INTO checkout_items(checkout_session_id,lead_id,unit_price_cents) VALUES(?,?,?)",
        [checkoutId, lead.id, lead.price_cents],
      );
    }
    if (input.marketingConsent)
      await connection.execute(
        `INSERT INTO marketing_consents(email,email_normalized,consented,source,consented_at) VALUES(?,?,1,'checkout',UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE email=VALUES(email),consented=1,source='checkout',consented_at=UTC_TIMESTAMP(),withdrawn_at=NULL`,
        [input.email, normalizedEmail],
      );
    return rows;
  });
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.email,
      line_items: leads.map((lead) => ({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: lead.price_cents,
          product_data: {
            name: `${lead.title} — ${lead.city}, ${lead.region}`,
            description: `Lead Hippo Opportunity ${lead.lead_code}`,
          },
        },
        ...(env.STRIPE_TAX_RATE_ID
          ? { tax_rates: [env.STRIPE_TAX_RATE_ID] }
          : {}),
      })),
      metadata: {
        internal_checkout_id: checkoutId,
        buyer_company: input.companyName,
        buyer_phone: input.phone,
      },
      payment_intent_data: { metadata: { internal_checkout_id: checkoutId } },
      success_url: `${env.WEB_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.WEB_URL}/cancel?checkout_id=${checkoutId}`,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      phone_number_collection: { enabled: false },
      billing_address_collection: "auto",
      allow_promotion_codes: false,
    });
    await pool.execute(
      "UPDATE checkout_sessions SET stripe_checkout_session_id=?,status='PENDING' WHERE id=?",
      [session.id, checkoutId],
    );
    return {
      checkoutUrl: session.url,
      checkoutId,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    await releaseCheckout(checkoutId, "FAILED");
    throw error;
  }
}

export async function processStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
) {
  const stripe = getStripe();
  if (!signature)
    throw new HttpError(
      400,
      "Missing Stripe signature.",
      "STRIPE_SIGNATURE_MISSING",
    );
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw new HttpError(
      400,
      "Invalid Stripe webhook signature.",
      "STRIPE_SIGNATURE_INVALID",
    );
  }
  try {
    await pool.execute(
      "INSERT INTO stripe_events(stripe_event_id,event_type,payload_hash,status) VALUES(?,?,?,'PROCESSING')",
      [event.id, event.type, sha256(rawBody)],
    );
  } catch (error: any) {
    if (error?.code !== "ER_DUP_ENTRY") throw error;
    const existing = await query<(RowDataPacket & { status: string })[]>(
      "SELECT status FROM stripe_events WHERE stripe_event_id=?",
      [event.id],
    );
    if (existing[0]?.status === "PROCESSED") return { duplicate: true };
    await pool.execute(
      "UPDATE stripe_events SET status='PROCESSING',last_error=NULL WHERE stripe_event_id=?",
      [event.id],
    );
  }
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    )
      await completeCheckout(event.data.object as Stripe.Checkout.Session);
    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const id = session.metadata?.internal_checkout_id;
      if (id)
        await releaseCheckout(
          id,
          event.type.endsWith("failed") ? "FAILED" : "EXPIRED",
        );
    }
    await pool.execute(
      "UPDATE stripe_events SET status='PROCESSED',processed_at=UTC_TIMESTAMP() WHERE stripe_event_id=?",
      [event.id],
    );
    return { received: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    await pool.execute(
      "UPDATE stripe_events SET status='FAILED',last_error=? WHERE stripe_event_id=?",
      [message.slice(0, 10000), event.id],
    );
    throw error;
  }
}

async function completeCheckout(stripeSession: Stripe.Checkout.Session) {
  const checkoutId = stripeSession.metadata?.internal_checkout_id;
  if (!checkoutId)
    throw new HttpError(
      422,
      "Stripe session is missing internal checkout metadata.",
    );
  const purchaseIds = await transaction(async (connection) => {
    const [sessions] = await connection.query<CheckoutRow[]>(
      "SELECT * FROM checkout_sessions WHERE id=? FOR UPDATE",
      [checkoutId],
    );
    const session = sessions[0];
    assert(session, 404, "Checkout session not found.");
    if (session.status === "PAID") return [];
    assert(
      ["PENDING", "CREATING"].includes(session.status),
      409,
      "Checkout is no longer payable.",
    );
    const [items] = await connection.query<ItemRow[]>(
      `SELECT ci.*,l.title,l.lead_code,l.spots_remaining FROM checkout_items ci JOIN leads l ON l.id=ci.lead_id WHERE ci.checkout_session_id=? FOR UPDATE`,
      [checkoutId],
    );
    const ids: number[] = [];
    for (const item of items) {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO purchases(checkout_session_id,checkout_item_id,lead_id,stripe_payment_intent_id,buyer_company,buyer_email,buyer_phone,amount_cents,currency,purchased_at) VALUES(?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP())`,
        [
          checkoutId,
          item.id,
          item.lead_id,
          typeof stripeSession.payment_intent === "string"
            ? stripeSession.payment_intent
            : null,
          session.buyer_company,
          session.buyer_email,
          session.buyer_phone,
          item.unit_price_cents,
          "CAD",
        ],
      );
      ids.push(result.insertId);
      if (item.spots_remaining === 0)
        await connection.execute(
          "UPDATE leads SET status='SOLD_OUT',is_featured=0,sold_out_at=UTC_TIMESTAMP() WHERE id=?",
          [item.lead_id],
        );
    }
    await connection.execute(
      "UPDATE checkout_sessions SET status='PAID',paid_at=UTC_TIMESTAMP() WHERE id=?",
      [checkoutId],
    );
    return ids;
  });
  for (const purchaseId of purchaseIds)
    await enqueueJob("FULFILL_PURCHASE", { purchaseId });
}

export async function expirePendingCheckouts() {
  const rows = await query<(RowDataPacket & { id: string })[]>(
    "SELECT id FROM checkout_sessions WHERE status IN ('CREATING','PENDING') AND expires_at<UTC_TIMESTAMP() LIMIT 100",
  );
  for (const row of rows) await releaseCheckout(row.id, "EXPIRED");
  return rows.length;
}
