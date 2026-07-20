import type { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool, query, transaction } from '../db/pool.js';
import { env } from '../config/env.js';
import { addDays, mysqlDate } from '../utils/dates.js';
import { HttpError, assert } from '../utils/errors.js';
import { slugify } from '../utils/normalize.js';
import { deleteStoredFile, storeLeadImage, type StoredImage } from './image.service.js';
import type { PublicLead } from '../types/models.js';
import type { z } from 'zod';
import type { leadSchema, leadUpdateSchema } from '../validation/schemas.js';

type LeadInput = z.infer<typeof leadSchema>;
type LeadUpdate = z.infer<typeof leadUpdateSchema>;

interface LeadRow extends RowDataPacket {
  id:number; lead_code:string; title:string; slug:string; trade_type_id:number; trade_name:string; trade_slug:string;
  city:string; region:string; budget_min_cents:number; budget_max_cents:number; timeline:string; description:string;
  hippo_score:number; price_cents:number; currency:string; spots_total:number; spots_remaining:number;
  status:'DRAFT'|'ACTIVE'|'SOLD_OUT'|'ARCHIVED'; is_featured:number; homeowner_name:string; homeowner_phone:string;
  homeowner_email:string|null; preferred_contact:'PHONE'|'TEXT'|'EMAIL'; homeowner_contacted_at:Date;
  consent_confirmed:number; consent_confirmed_at:Date|null; published_at:Date|null; expires_at:Date|null;
  sold_out_at:Date|null; archived_at:Date|null; view_count:number; created_at:Date; updated_at:Date;
}
interface PhotoRow extends RowDataPacket { id:number; lead_id:number; public_url:string; storage_path:string; is_primary:number; sort_order:number; width:number|null; height:number|null; }
interface ReasonRow extends RowDataPacket { lead_id:number; reason:string; }

const selectLead = `SELECT l.*, t.name AS trade_name, t.slug AS trade_slug
  FROM leads l JOIN trade_types t ON t.id=l.trade_type_id`;

function mapPublic(row: LeadRow, photos: PhotoRow[], reasons: string[]): PublicLead {
  return {
    id: row.id, leadCode: row.lead_code, title: row.title, slug: row.slug,
    trade: { id: row.trade_type_id, name: row.trade_name, slug: row.trade_slug },
    city: row.city, region: row.region, budgetMinCents: row.budget_min_cents, budgetMaxCents: row.budget_max_cents,
    timeline: row.timeline, description: row.description, hippoScore: row.hippo_score, priceCents: row.price_cents,
    currency: row.currency, spotsRemaining: row.spots_remaining,
    status: row.status === 'SOLD_OUT' || row.spots_remaining === 0 ? 'SOLD_OUT' : 'ACTIVE',
    isFeatured: Boolean(row.is_featured),
    isNew: Boolean(row.published_at && Date.now() - new Date(row.published_at).getTime() < 48 * 60 * 60 * 1000),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    photos: photos.map(p => ({ id:p.id, url:p.public_url, isPrimary:Boolean(p.is_primary), sortOrder:p.sort_order })),
    scoreReasons: reasons
  };
}

async function hydratePublic(rows: LeadRow[]): Promise<PublicLead[]> {
  if (!rows.length) return [];
  const ids=rows.map(r=>r.id);
  const marks=ids.map(()=>'?').join(',');
  const [photos,reasons]=await Promise.all([
    query<PhotoRow[]>(`SELECT * FROM lead_photos WHERE lead_id IN (${marks}) ORDER BY lead_id,is_primary DESC,sort_order`,ids),
    query<ReasonRow[]>(`SELECT lead_id,reason FROM lead_score_reasons WHERE lead_id IN (${marks}) ORDER BY id`,ids)
  ]);
  return rows.map(row=>mapPublic(row,photos.filter(p=>p.lead_id===row.id),reasons.filter(r=>r.lead_id===row.id).map(r=>r.reason)));
}

export async function listPublicLeads(featuredOnly=false) {
  const rows=await query<LeadRow[]>(`${selectLead} WHERE l.status IN ('ACTIVE','SOLD_OUT') ${featuredOnly?'AND l.is_featured=1':''}
    ORDER BY FIELD(l.status,'ACTIVE','SOLD_OUT'), l.published_at DESC`);
  return hydratePublic(rows);
}

export async function getPublicLead(leadCode:string, incrementView=true) {
  const rows=await query<LeadRow[]>(`${selectLead} WHERE l.lead_code=? AND l.status IN ('ACTIVE','SOLD_OUT') LIMIT 1`,[leadCode]);
  const row=rows[0];
  if(!row) throw new HttpError(404,'Opportunity not found.','LEAD_NOT_FOUND');
  if(incrementView) void pool.execute('UPDATE leads SET view_count=view_count+1 WHERE id=?',[row.id]);
  return (await hydratePublic([row]))[0]!;
}

export async function listAdminLeads() {
  const rows=await query<LeadRow[]>(`${selectLead} ORDER BY l.created_at DESC`);
  if(!rows.length) return [];
  const publicRows=await hydratePublic(rows);
  return rows.map((row,index)=>({
    ...publicRows[index],
    status: row.status,
    spotsTotal: row.spots_total,
    homeownerName: row.homeowner_name,
    homeownerPhone: row.homeowner_phone,
    homeownerEmail: row.homeowner_email,
    preferredContact: row.preferred_contact,
    homeownerContactedAt: new Date(row.homeowner_contacted_at).toISOString(),
    consentConfirmed: Boolean(row.consent_confirmed),
    consentConfirmedAt: row.consent_confirmed_at?new Date(row.consent_confirmed_at).toISOString():null,
    expiresAt: row.expires_at?new Date(row.expires_at).toISOString():null,
    viewCount: row.view_count,
    createdAt:new Date(row.created_at).toISOString(), updatedAt:new Date(row.updated_at).toISOString()
  }));
}

export async function getAdminLead(id:number) {
  const rows=await query<LeadRow[]>(`${selectLead} WHERE l.id=? LIMIT 1`,[id]);
  if(!rows[0]) throw new HttpError(404,'Lead not found.','LEAD_NOT_FOUND');
  const all=await listAdminLeads();
  return all.find((l:any)=>l.id===id)!;
}

async function nextLeadCode(connection:PoolConnection) {
  const year=new Date().getUTCFullYear();
  const [rows]=await connection.query<RowDataPacket[]>('SELECT next_number FROM lead_number_sequences WHERE sequence_year=? FOR UPDATE',[year]);
  let number:number;
  if(rows[0]) { number=Number(rows[0].next_number); await connection.execute('UPDATE lead_number_sequences SET next_number=next_number+1 WHERE sequence_year=?',[year]); }
  else { number=1; await connection.execute('INSERT INTO lead_number_sequences(sequence_year,next_number) VALUES(?,2)',[year]); }
  return `LH-${year}-${String(number).padStart(5,'0')}`;
}

export async function createLead(input:LeadInput, files:Express.Multer.File[]) {
  const stored:StoredImage[]=[];
  try { for(const file of files) stored.push(await storeLeadImage(file)); }
  catch(error){ await Promise.all(stored.map(s=>deleteStoredFile(s.storagePath))); throw error; }
  try {
    return await transaction(async connection=>{
      const leadCode=await nextLeadCode(connection);
      if(input.isFeatured) await ensureFeaturedCapacity(connection,0);
      const slug=`${slugify(input.title)}-${leadCode.toLowerCase()}`;
      const [result]=await connection.execute<ResultSetHeader>(`INSERT INTO leads
        (lead_code,title,slug,trade_type_id,city,region,budget_min_cents,budget_max_cents,timeline,description,hippo_score,price_cents,spots_total,spots_remaining,homeowner_name,homeowner_phone,homeowner_email,preferred_contact,homeowner_contacted_at,consent_confirmed,consent_confirmed_at,is_featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[
          leadCode,input.title,slug,input.tradeTypeId,input.city,input.region,input.budgetMinCents,input.budgetMaxCents,input.timeline,input.description,input.hippoScore,input.priceCents,input.spotsTotal,input.spotsTotal,
          input.homeownerName,input.homeownerPhone,input.homeownerEmail||null,input.preferredContact,mysqlDate(new Date(input.homeownerContactedAt)),input.consentConfirmed,input.consentConfirmed?mysqlDate(new Date(input.consent?.receivedAt||Date.now())):null,input.isFeatured
        ]);
      const leadId=result.insertId;
      for(let i=0;i<stored.length;i++) await connection.execute('INSERT INTO lead_photos(lead_id,storage_path,public_url,sort_order,is_primary,width,height) VALUES(?,?,?,?,?,?,?)',[leadId,stored[i]!.storagePath,stored[i]!.publicUrl,i,i===0,stored[i]!.width,stored[i]!.height]);
      for(const reason of input.scoreReasons) await connection.execute('INSERT INTO lead_score_reasons(lead_id,reason) VALUES(?,?)',[leadId,reason]);
      if(input.consent) await connection.execute('INSERT INTO consent_records(lead_id,consent_method,consent_text,consent_received_at,admin_notes) VALUES(?,?,?,?,?)',[leadId,input.consent.method,input.consent.text||null,mysqlDate(new Date(input.consent.receivedAt)),input.consent.notes||null]);
      return { id:leadId, leadCode };
    });
  } catch(error){ await Promise.all(stored.map(s=>deleteStoredFile(s.storagePath))); throw error; }
}

const updateMap:Record<string,string>={title:'title',tradeTypeId:'trade_type_id',city:'city',region:'region',budgetMinCents:'budget_min_cents',budgetMaxCents:'budget_max_cents',timeline:'timeline',description:'description',hippoScore:'hippo_score',priceCents:'price_cents',spotsTotal:'spots_total',homeownerName:'homeowner_name',homeownerPhone:'homeowner_phone',homeownerEmail:'homeowner_email',preferredContact:'preferred_contact',homeownerContactedAt:'homeowner_contacted_at',consentConfirmed:'consent_confirmed',isFeatured:'is_featured'};

export async function updateLead(id:number,input:LeadUpdate) {
  return transaction(async connection=>{
    const [locked]=await connection.query<LeadRow[]>('SELECT * FROM leads WHERE id=? FOR UPDATE',[id]);
    assert(locked[0],404,'Lead not found.','LEAD_NOT_FOUND');
    if(input.isFeatured && !locked[0].is_featured) await ensureFeaturedCapacity(connection,id);
    const fields:string[]=[]; const values:any[]=[];
    for(const [key,column] of Object.entries(updateMap)) {
      if((input as any)[key]!==undefined) {
        fields.push(`${column}=?`);
        let value=(input as any)[key];
        if(key==='homeownerEmail' && value==='') value=null;
        if(key==='homeownerContactedAt') value=mysqlDate(new Date(value));
        values.push(value);
      }
    }
    if(input.title) { fields.push('slug=?'); values.push(`${slugify(input.title)}-${locked[0].lead_code.toLowerCase()}`); }
    if(input.consentConfirmed) { fields.push('consent_confirmed_at=COALESCE(consent_confirmed_at,UTC_TIMESTAMP())'); }
    if(input.spotsTotal!==undefined && input.spotsTotal<locked[0].spots_remaining) { fields.push('spots_remaining=?'); values.push(input.spotsTotal); }
    if(fields.length) { values.push(id); await connection.execute(`UPDATE leads SET ${fields.join(',')} WHERE id=?`,values); }
    if(input.scoreReasons) {
      await connection.execute('DELETE FROM lead_score_reasons WHERE lead_id=?',[id]);
      for(const reason of input.scoreReasons) await connection.execute('INSERT INTO lead_score_reasons(lead_id,reason) VALUES(?,?)',[id,reason]);
    }
    if(input.consent) await connection.execute('INSERT INTO consent_records(lead_id,consent_method,consent_text,consent_received_at,admin_notes) VALUES(?,?,?,?,?)',[id,input.consent.method,input.consent.text||null,mysqlDate(new Date(input.consent.receivedAt)),input.consent.notes||null]);
    return {ok:true};
  });
}

async function ensureFeaturedCapacity(connection:PoolConnection,currentId:number) {
  const [rows]=await connection.query<RowDataPacket[]>("SELECT id FROM leads WHERE is_featured=1 AND id<>? AND status IN ('DRAFT','ACTIVE') FOR UPDATE",[currentId]);
  if(rows.length>=env.MAX_FEATURED_LEADS) throw new HttpError(409,`Only ${env.MAX_FEATURED_LEADS} opportunities can be featured.`,'FEATURED_LIMIT_REACHED');
}

export async function publishLead(id:number) {
  return transaction(async connection=>{
    const [rows]=await connection.query<LeadRow[]>('SELECT * FROM leads WHERE id=? FOR UPDATE',[id]);
    const lead=rows[0]; assert(lead,404,'Lead not found.','LEAD_NOT_FOUND');
    assert(lead.consent_confirmed,422,'Consent must be confirmed before publishing.','CONSENT_REQUIRED');
    const [photos]=await connection.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM lead_photos WHERE lead_id=?',[id]);
    assert(Number(photos[0]?.total||0)>0,422,'At least one project photo is required before publishing.','PHOTO_REQUIRED');
    if(lead.is_featured) await ensureFeaturedCapacity(connection,id);
    const now=new Date();
    await connection.execute("UPDATE leads SET status='ACTIVE',published_at=COALESCE(published_at,?),expires_at=?,archived_at=NULL WHERE id=?",[mysqlDate(now),mysqlDate(addDays(now,env.LEAD_EXPIRY_DAYS)),id]);
    return {ok:true};
  });
}

export async function archiveLead(id:number) { await pool.execute("UPDATE leads SET status='ARCHIVED',is_featured=0,archived_at=UTC_TIMESTAMP() WHERE id=?",[id]); return {ok:true}; }
export async function markSoldOut(id:number) { await pool.execute("UPDATE leads SET status='SOLD_OUT',spots_remaining=0,is_featured=0,sold_out_at=UTC_TIMESTAMP() WHERE id=?",[id]); return {ok:true}; }

export async function adjustSpots(id:number,spots:number) {
  assert(Number.isInteger(spots)&&spots>=0&&spots<=env.MAX_SPOTS_PER_LEAD,422,'Spots must be between 0 and 3.');
  await pool.execute(`UPDATE leads SET spots_remaining=?,status=CASE WHEN ?=0 THEN 'SOLD_OUT' WHEN status='SOLD_OUT' THEN 'ACTIVE' ELSE status END,sold_out_at=CASE WHEN ?=0 THEN UTC_TIMESTAMP() ELSE NULL END WHERE id=?`,[spots,spots,spots,id]);
  return {ok:true};
}

export async function addLeadPhotos(id:number,files:Express.Multer.File[]) {
  const [countRows]=await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM lead_photos WHERE lead_id=?',[id]);
  const existing=Number(countRows[0]?.total||0);
  assert(existing+files.length<=5,422,'A lead can have at most five photos.','PHOTO_LIMIT');
  const stored:StoredImage[]=[];
  try { for(const file of files) stored.push(await storeLeadImage(file)); }
  catch(error){ await Promise.all(stored.map(s=>deleteStoredFile(s.storagePath))); throw error; }
  await transaction(async connection=>{
    for(let i=0;i<stored.length;i++) await connection.execute('INSERT INTO lead_photos(lead_id,storage_path,public_url,sort_order,is_primary,width,height) VALUES(?,?,?,?,?,?,?)',[id,stored[i]!.storagePath,stored[i]!.publicUrl,existing+i,existing===0&&i===0,stored[i]!.width,stored[i]!.height]);
  });
  return {ok:true};
}

export async function deleteLeadPhoto(id:number,photoId:number) {
  const rows=await query<PhotoRow[]>('SELECT * FROM lead_photos WHERE id=? AND lead_id=?',[photoId,id]);
  const photo=rows[0]; if(!photo) throw new HttpError(404,'Photo not found.');
  await pool.execute('DELETE FROM lead_photos WHERE id=?',[photoId]);
  await deleteStoredFile(photo.storage_path);
  const remaining=await query<PhotoRow[]>('SELECT * FROM lead_photos WHERE lead_id=? ORDER BY sort_order',[id]);
  if(remaining.length&&!remaining.some(p=>p.is_primary)) await pool.execute('UPDATE lead_photos SET is_primary=1 WHERE id=?',[remaining[0]!.id]);
  return {ok:true};
}
