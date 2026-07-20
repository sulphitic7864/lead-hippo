import type { RowDataPacket } from 'mysql2/promise';
import { pool, query } from '../db/pool.js';
import { generateOpportunityReport } from './report.service.js';
import { sendAdminSale, sendBuyerReport, sendContactNotification } from './email.service.js';
import { HttpError } from '../utils/errors.js';

interface PurchaseRow extends RowDataPacket { id:number;buyer_email:string;buyer_company:string;buyer_phone:string;amount_cents:number;lead_code:string;title:string;city:string;spots_remaining:number;report_path:string|null; }
export async function fulfillPurchase(purchaseId:number,force=false) {
  const rows=await query<PurchaseRow[]>(`SELECT p.*,l.lead_code,l.title,l.city,l.spots_remaining FROM purchases p JOIN leads l ON l.id=p.lead_id WHERE p.id=? LIMIT 1`,[purchaseId]);
  const p=rows[0]; if(!p) throw new HttpError(404,'Purchase not found.');
  let reportPath=p.report_path;
  if(!reportPath||force){
    try { reportPath=await generateOpportunityReport(purchaseId); await pool.execute("UPDATE purchases SET report_path=?,report_status='GENERATED' WHERE id=?",[reportPath,purchaseId]); }
    catch(error){ await pool.execute("UPDATE purchases SET report_status='FAILED' WHERE id=?",[purchaseId]); throw error; }
  }
  try {
    await sendBuyerReport({to:p.buyer_email,title:p.title,city:p.city,leadCode:p.lead_code,reportPath});
    await pool.execute("UPDATE purchases SET email_status='SENT' WHERE id=?",[purchaseId]);
  } catch(error){ await pool.execute("UPDATE purchases SET email_status='FAILED' WHERE id=?",[purchaseId]); throw error; }
  await sendAdminSale({leadCode:p.lead_code,title:p.title,company:p.buyer_company,email:p.buyer_email,phone:p.buyer_phone,amountCents:p.amount_cents,spotsRemaining:p.spots_remaining});
}

interface ContactRow extends RowDataPacket { id:number;name:string;company:string|null;email:string;phone:string;message:string; }
export async function notifyContact(contactId:number){
  const rows=await query<ContactRow[]>('SELECT * FROM contact_messages WHERE id=?',[contactId]);
  if(!rows[0]) throw new HttpError(404,'Contact message not found.');
  await sendContactNotification(rows[0]);
}
