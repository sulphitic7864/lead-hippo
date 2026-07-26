import { Router } from "express";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAdmin } from "../middleware/auth.js";
import { photoUpload } from "../middleware/upload.js";
import { leadSchema, leadUpdateSchema } from "../validation/schemas.js";
import {
  addLeadPhotos,
  adjustSpots,
  archiveLead,
  createLead,
  deleteLeadPhoto,
  getAdminLead,
  listAdminLeads,
  markSoldOut,
  publishLead,
  updateLead,
} from "../services/lead.service.js";
import { pool, query } from "../db/pool.js";
import { enqueueJob } from "../services/job.service.js";
import { approveStripeRefund } from "../services/refund.service.js";
import { getStripe } from "../services/stripe.service.js";
import { slugify } from "../utils/normalize.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

function parsePayload(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
adminRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const rows = await query<
      (RowDataPacket & {
        active: number;
        sold_out: number;
        drafts: number;
        sales: number;
        revenue: number;
        contacts: number;
        refunds: number;
      })[]
    >(`SELECT
    (SELECT COUNT(*) FROM leads WHERE status='ACTIVE') active,
    (SELECT COUNT(*) FROM leads WHERE status='SOLD_OUT') sold_out,
    (SELECT COUNT(*) FROM leads WHERE status='DRAFT') drafts,
    (SELECT COUNT(*) FROM purchases WHERE payment_status='PAID') sales,
    (SELECT COALESCE(SUM(amount_cents),0) FROM purchases WHERE payment_status='PAID') revenue,
    (SELECT COUNT(*) FROM contact_messages WHERE status='NEW') contacts,
    (SELECT COUNT(*) FROM refund_claims WHERE status IN ('SUBMITTED','UNDER_REVIEW')) refunds`);
    res.json({ data: rows[0] });
  }),
);

adminRouter.get(
  "/leads",
  asyncHandler(async (_req, res) => res.json({ data: await listAdminLeads() })),
);
adminRouter.get(
  "/leads/:id",
  asyncHandler(async (req, res) =>
    res.json({ data: await getAdminLead(Number(req.params.id)) }),
  ),
);
adminRouter.post(
  "/leads",
  photoUpload.array("photos", 5),
  asyncHandler(async (req, res) => {
    const input = leadSchema.parse(parsePayload(req.body.payload));
    res.status(201).json({
      data: await createLead(input, (req.files as Express.Multer.File[]) || []),
    });
  }),
);
adminRouter.patch(
  "/leads/:id",
  asyncHandler(async (req, res) => {
    const input = leadUpdateSchema.parse(req.body);
    res.json({ data: await updateLead(Number(req.params.id), input) });
  }),
);
adminRouter.post(
  "/leads/:id/photos",
  photoUpload.array("photos", 5),
  asyncHandler(async (req, res) =>
    res.json({
      data: await addLeadPhotos(
        Number(req.params.id),
        (req.files as Express.Multer.File[]) || [],
      ),
    }),
  ),
);
adminRouter.delete(
  "/leads/:id/photos/:photoId",
  asyncHandler(async (req, res) =>
    res.json({
      data: await deleteLeadPhoto(
        Number(req.params.id),
        Number(req.params.photoId),
      ),
    }),
  ),
);
adminRouter.post(
  "/leads/:id/publish",
  asyncHandler(async (req, res) =>
    res.json({ data: await publishLead(Number(req.params.id)) }),
  ),
);
adminRouter.post(
  "/leads/:id/archive",
  asyncHandler(async (req, res) =>
    res.json({ data: await archiveLead(Number(req.params.id)) }),
  ),
);
adminRouter.post(
  "/leads/:id/sold-out",
  asyncHandler(async (req, res) =>
    res.json({ data: await markSoldOut(Number(req.params.id)) }),
  ),
);
adminRouter.post(
  "/leads/:id/spots",
  asyncHandler(async (req, res) => {
    const { spots } = z
      .object({ spots: z.number().int().min(0).max(3) })
      .parse(req.body);
    res.json({ data: await adjustSpots(Number(req.params.id), spots) });
  }),
);

adminRouter.get(
  "/purchases",
  asyncHandler(async (_req, res) => {
    const rows = await query<RowDataPacket[]>(
      `SELECT p.id,p.purchased_at,p.buyer_company,p.buyer_email,p.buyer_phone,p.amount_cents,p.currency,p.payment_status,p.report_status,p.email_status,l.lead_code,l.title,l.city FROM purchases p JOIN leads l ON l.id=p.lead_id ORDER BY p.purchased_at DESC`,
    );
    res.json({ data: rows });
  }),
);
adminRouter.get(
  "/purchases/export.csv",
  asyncHandler(async (_req, res) => {
    const rows = await query<any[]>(
      `SELECT p.purchased_at,l.lead_code,l.title,p.buyer_company,p.buyer_email,p.buyer_phone,p.amount_cents,p.currency,p.payment_status FROM purchases p JOIN leads l ON l.id=p.lead_id ORDER BY p.purchased_at DESC`,
    );
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const keys = [
      "purchased_at",
      "lead_code",
      "title",
      "buyer_company",
      "buyer_email",
      "buyer_phone",
      "amount_cents",
      "currency",
      "payment_status",
    ];
    const csv = [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => escape(r[k])).join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="lead-hippo-purchases.csv"',
    );
    res.send(csv);
  }),
);
adminRouter.post(
  "/purchases/:id/resend",
  asyncHandler(async (req, res) => {
    await enqueueJob("RESEND_REPORT", { purchaseId: Number(req.params.id) });
    res.json({ data: { ok: true } });
  }),
);

adminRouter.get(
  "/contacts",
  asyncHandler(async (_req, res) => {
    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM contact_messages ORDER BY created_at DESC",
    );
    res.json({ data: rows });
  }),
);
adminRouter.patch(
  "/contacts/:id",
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]) })
      .parse(req.body);
    await pool.execute("UPDATE contact_messages SET status=? WHERE id=?", [
      status,
      String(req.params.id),
    ]);
    res.json({ data: { ok: true } });
  }),
);

adminRouter.get(
  "/refunds",
  asyncHandler(async (_req, res) => {
    const rows = await query<RowDataPacket[]>(
      `SELECT r.*,p.buyer_company,p.buyer_email,p.amount_cents,l.lead_code,l.title FROM refund_claims r JOIN purchases p ON p.id=r.purchase_id JOIN leads l ON l.id=p.lead_id ORDER BY r.submitted_at DESC`,
    );
    res.json({ data: rows });
  }),
);
adminRouter.patch(
  "/refunds/:id",
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        status: z.enum([
          "SUBMITTED",
          "UNDER_REVIEW",
          "APPROVED_REPLACEMENT",
          "REJECTED",
          "COMPLETED",
        ]),
        adminNotes: z.string().max(5000).default(""),
        resolution: z.string().max(5000).default(""),
      })
      .parse(req.body);
    await pool.execute(
      "UPDATE refund_claims SET status=?,admin_notes=?,resolution=?,resolved_at=IF(? IN ('REJECTED','COMPLETED'),UTC_TIMESTAMP(),resolved_at) WHERE id=?",
      [
        input.status,
        input.adminNotes,
        input.resolution,
        input.status,
        String(req.params.id),
      ],
    );
    res.json({ data: { ok: true } });
  }),
);
adminRouter.post(
  "/refunds/:id/stripe-refund",
  asyncHandler(async (req, res) => {
    const { notes } = z
      .object({ notes: z.string().max(5000).default("") })
      .parse(req.body);
    res.json({ data: await approveStripeRefund(Number(req.params.id), notes) });
  }),
);

adminRouter.get(
  "/trades",
  asyncHandler(async (_req, res) => {
    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM trade_types ORDER BY sort_order,name",
    );
    res.json({ data: rows });
  }),
);
adminRouter.post(
  "/trades",
  asyncHandler(async (req, res) => {
    const input = z
      .object({ name: z.string().min(2).max(100) })
      .parse(req.body);

    const slug = slugify(input.name);

    try {
      await pool.execute("INSERT INTO trade_types(name,slug) VALUES(?,?)", [
        input.name,
        slug,
      ]);

      res.status(201).json({ data: { ok: true } });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          code: "DUPLICATE_TRADE",
          message: "Trade already exists.",
        });
      }

      throw error;
    }
  }),
);
adminRouter.patch(
  "/trades/:id",
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        name: z.string().min(2).max(100).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().min(0).max(999).optional(),
      })
      .parse(req.body);
    const fields: string[] = [];
    const values: any[] = [];
    if (input.name !== undefined) {
      fields.push("name=?", "slug=?");
      values.push(input.name, slugify(input.name));
    }
    if (input.isActive !== undefined) {
      fields.push("is_active=?");
      values.push(input.isActive);
    }
    if (input.sortOrder !== undefined) {
      fields.push("sort_order=?");
      values.push(input.sortOrder);
    }
    if (fields.length) {
      values.push(String(req.params.id));
      await pool.execute(
        `UPDATE trade_types SET ${fields.join(",")} WHERE id=?`,
        values,
      );
    }
    res.json({ data: { ok: true } });
  }),
);

adminRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM settings ORDER BY setting_key",
    );
    res.json({ data: rows });
  }),
);
adminRouter.patch(
  "/settings/:key",
  asyncHandler(async (req, res) => {
    const { value } = z.object({ value: z.string().max(5000) }).parse(req.body);
    await pool.execute(
      "UPDATE settings SET setting_value=? WHERE setting_key=?",
      [value, String(req.params.key)],
    );
    res.json({ data: { ok: true } });
  }),
);
