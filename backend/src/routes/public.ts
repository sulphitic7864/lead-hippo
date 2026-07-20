import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { asyncHandler } from '../utils/async-handler.js';
import { contactSchema, checkoutSchema, refundClaimSchema } from '../validation/schemas.js';
import { getPublicLead, listPublicLeads } from '../services/lead.service.js';
import { createCheckout, releaseCheckout } from '../services/checkout.service.js';
import { pool, query } from '../db/pool.js';
import { enqueueJob } from '../services/job.service.js';
import { HttpError, assert } from '../utils/errors.js';

export const publicRouter=Router();
const formLimit=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-7',legacyHeaders:false});

publicRouter.get('/leads',asyncHandler(async(req,res)=>{res.json({data:await listPublicLeads(req.query.featured==='true')});}));
publicRouter.get('/leads/featured',asyncHandler(async(_req,res)=>{res.json({data:await listPublicLeads(true)});}));
publicRouter.get('/leads/:leadCode',asyncHandler(async(req,res)=>{res.json({data:await getPublicLead(String(req.params.leadCode))});}));
publicRouter.get('/trades',asyncHandler(async(_req,res)=>{const rows=await query<(RowDataPacket&{id:number;name:string;slug:string})[]>('SELECT id,name,slug FROM trade_types WHERE is_active=1 ORDER BY sort_order,name');res.json({data:rows});}));
publicRouter.get('/settings/public',asyncHandler(async(_req,res)=>{const rows=await query<(RowDataPacket&{setting_key:string;setting_value:string})[]>('SELECT setting_key,setting_value FROM settings WHERE is_public=1');res.json({data:Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value]))});}));

publicRouter.post('/checkout',formLimit,asyncHandler(async(req,res)=>{const input=checkoutSchema.parse(req.body);res.status(201).json({data:await createCheckout(input)});}));
publicRouter.post('/checkout/:checkoutId/cancel',asyncHandler(async(req,res)=>{await releaseCheckout(String(req.params.checkoutId),'CANCELLED');res.json({data:{ok:true}});}));

publicRouter.post('/contact',formLimit,asyncHandler(async(req,res)=>{
  const input=contactSchema.parse(req.body);
  const [result]=await pool.execute<ResultSetHeader>('INSERT INTO contact_messages(name,company,email,phone,message) VALUES(?,?,?,?,?)',[input.name,input.company||null,input.email,input.phone,input.message]);
  await enqueueJob('CONTACT_NOTIFICATION',{contactId:result.insertId});
  res.status(201).json({data:{ok:true,message:'Thank you. Your message has been sent.'}});
}));

publicRouter.post('/refund-claims',formLimit,asyncHandler(async(req,res)=>{
  const input=refundClaimSchema.parse(req.body);
  const rows=await query<(RowDataPacket&{id:number;purchased_at:Date;buyer_email:string})[]>('SELECT id,purchased_at,buyer_email FROM purchases WHERE id=?',[input.purchaseId]);
  const purchase=rows[0]; if(!purchase) throw new HttpError(404,'Purchase not found.');
  assert(purchase.buyer_email.toLowerCase()===input.email.toLowerCase(),403,'The email does not match this purchase.');
  assert(Date.now()-new Date(purchase.purchased_at).getTime()<=7*86400000,422,'The seven-day claim window has passed.','CLAIM_WINDOW_EXPIRED');
  await pool.execute('INSERT INTO refund_claims(purchase_id,reason,contractor_message,contact_attempt_log,submitted_at) VALUES(?,?,?,?,UTC_TIMESTAMP())',[input.purchaseId,input.reason,input.contractorMessage,input.contactAttemptLog||null]);
  res.status(201).json({data:{ok:true,message:'Your claim has been submitted for review.'}});
}));
