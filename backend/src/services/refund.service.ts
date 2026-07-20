import type { RowDataPacket } from 'mysql2/promise';
import { pool, query, transaction } from '../db/pool.js';
import { getStripe } from './stripe.service.js';
import { HttpError, assert } from '../utils/errors.js';

interface ClaimRow extends RowDataPacket { id:number;purchase_id:number;status:string;stripe_payment_intent_id:string|null;amount_cents:number;lead_id:number; }
export async function approveStripeRefund(claimId:number,notes:string) {
  const rows=await query<ClaimRow[]>(`SELECT r.*,p.stripe_payment_intent_id,p.amount_cents,p.lead_id FROM refund_claims r JOIN purchases p ON p.id=r.purchase_id WHERE r.id=?`,[claimId]);
  const claim=rows[0]; if(!claim) throw new HttpError(404,'Refund claim not found.');
  assert(claim.stripe_payment_intent_id,422,'This purchase has no Stripe payment intent.');
  const refund=await getStripe().refunds.create({payment_intent:claim.stripe_payment_intent_id,reason:'requested_by_customer',metadata:{refund_claim_id:String(claimId)}});
  await transaction(async c=>{
    await c.execute("UPDATE refund_claims SET status='COMPLETED',admin_notes=?,resolution='Full Stripe refund',stripe_refund_id=?,resolved_at=UTC_TIMESTAMP() WHERE id=?",[notes,refund.id,claimId]);
    await c.execute("UPDATE purchases SET payment_status='REFUNDED',refunded_at=UTC_TIMESTAMP() WHERE id=?",[claim.purchase_id]);
    await c.execute("UPDATE leads SET spots_remaining=LEAST(spots_total,spots_remaining+1),status=CASE WHEN status='SOLD_OUT' THEN 'ACTIVE' ELSE status END,sold_out_at=NULL WHERE id=?",[claim.lead_id]);
  });
  return {ok:true,refundId:refund.id};
}
