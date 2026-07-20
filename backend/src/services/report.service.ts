import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { HttpError } from '../utils/errors.js';

interface ReportRow extends RowDataPacket {
  purchase_id:number; lead_code:string; title:string; trade_name:string; city:string; region:string;
  budget_min_cents:number; budget_max_cents:number; timeline:string; description:string; hippo_score:number;
  homeowner_name:string; homeowner_phone:string; homeowner_email:string|null; preferred_contact:string; homeowner_contacted_at:Date;
}
interface PhotoRow extends RowDataPacket { storage_path:string; }
interface ReasonRow extends RowDataPacket { reason:string; }

export async function generateOpportunityReport(purchaseId:number) {
  const rows=await query<ReportRow[]>(`SELECT p.id AS purchase_id,l.lead_code,l.title,t.name AS trade_name,l.city,l.region,l.budget_min_cents,l.budget_max_cents,l.timeline,l.description,l.hippo_score,l.homeowner_name,l.homeowner_phone,l.homeowner_email,l.preferred_contact,l.homeowner_contacted_at
    FROM purchases p JOIN leads l ON l.id=p.lead_id JOIN trade_types t ON t.id=l.trade_type_id WHERE p.id=? LIMIT 1`,[purchaseId]);
  const data=rows[0]; if(!data) throw new HttpError(404,'Purchase not found.');
  const [photos,reasons]=await Promise.all([
    query<PhotoRow[]>('SELECT storage_path FROM lead_photos WHERE lead_id=(SELECT lead_id FROM purchases WHERE id=?) ORDER BY is_primary DESC,sort_order LIMIT 2',[purchaseId]),
    query<ReasonRow[]>('SELECT reason FROM lead_score_reasons WHERE lead_id=(SELECT lead_id FROM purchases WHERE id=?) ORDER BY id',[purchaseId])
  ]);
  await fsp.mkdir(env.reportDir,{recursive:true});
  const filename=`${data.lead_code}-purchase-${purchaseId}.pdf`;
  const outputPath=path.join(env.reportDir,filename);
  await new Promise<void>((resolve,reject)=>{
    const doc=new PDFDocument({size:'LETTER',margin:38,info:{Title:`${data.lead_code} Opportunity Report`,Author:'Lead Hippo'}});
    const stream=fs.createWriteStream(outputPath); doc.pipe(stream); stream.on('finish',resolve); stream.on('error',reject);
    const navy='#0D1B2A',blue='#2563EB',purple='#7C3AED',muted='#52627A',line='#DDE5EF';
    const logo=path.resolve(process.cwd(),'assets/logo.png');
    if(fs.existsSync(logo)) doc.image(logo,38,28,{fit:[150,62]});
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(20).text('OPPORTUNITY REPORT',250,40,{align:'right',width:324});
    doc.fillColor(blue).fontSize(11).text(data.lead_code,250,67,{align:'right',width:324});
    doc.moveTo(38,102).lineTo(574,102).strokeColor(line).stroke();

    doc.roundedRect(38,118,536,104,12).fill('#F4F7FB');
    doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text('HOMEOWNER INFORMATION',54,134);
    doc.font('Helvetica').fontSize(10.5).fillColor(muted);
    const email=data.homeowner_email||'Not provided';
    doc.text(`Name: ${data.homeowner_name}`,54,158).text(`Phone: ${data.homeowner_phone}`,54,177).text(`Email: ${email}`,54,196);
    doc.text(`Location: ${data.city}, ${data.region}`,318,158).text(`Preferred contact: ${data.preferred_contact.toLowerCase()}`,318,177).text(`Contacted: ${new Date(data.homeowner_contacted_at).toLocaleDateString('en-CA')}`,318,196);

    doc.fillColor(navy).font('Helvetica-Bold').fontSize(13).text('PROJECT DETAILS',38,242);
    doc.font('Helvetica').fontSize(10.5).fillColor(muted);
    doc.text(`Type: ${data.trade_name}`,38,265).text(`Budget: $${(data.budget_min_cents/100).toLocaleString()} – $${(data.budget_max_cents/100).toLocaleString()}`,220,265).text(`Timeline: ${data.timeline}`,420,265);
    doc.roundedRect(38,288,396,128,10).strokeColor(line).stroke();
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(12).text(data.title,52,302,{width:368});
    doc.fillColor(muted).font('Helvetica').fontSize(9.4).text(data.description,52,326,{width:368,height:76,ellipsis:true,lineGap:2});
    doc.roundedRect(450,288,124,128,10).fill(purple);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text('HIPPOSCORE',450,310,{align:'center',width:124});
    doc.fontSize(42).text(String(data.hippo_score),450,333,{align:'center',width:124});
    doc.fontSize(8).font('Helvetica').text('Verified project readiness',458,384,{align:'center',width:108});

    doc.fillColor(navy).font('Helvetica-Bold').fontSize(13).text('WHY THIS SCORED HIGH',38,436);
    doc.font('Helvetica').fontSize(9.2).fillColor(muted);
    const displayReasons=reasons.slice(0,6);
    displayReasons.forEach((r,i)=>{ const x=i%2===0?42:310,y=460+Math.floor(i/2)*21; doc.fillColor(blue).circle(x,y+4,3).fill(); doc.fillColor(muted).text(r.reason,x+10,y,{width:245}); });

    const photoY=530, photoW=258, photoH=120;
    photos.forEach((p,i)=>{ if(fs.existsSync(p.storage_path)){ try{doc.image(p.storage_path,38+i*(photoW+20),photoY,{fit:[photoW,photoH],align:'center',valign:'center'});}catch{} } });
    if(!photos.length){ doc.roundedRect(38,photoY,536,photoH,10).fill('#EEF3F8'); doc.fillColor(muted).fontSize(10).text('No project photos were supplied.',38,photoY+52,{align:'center',width:536}); }
    doc.fillColor('#718096').fontSize(8).text('By purchasing this opportunity, you agree to our Terms of Service. No street address is collected or included.',38,705,{align:'center',width:536});
    doc.end();
  });
  return outputPath;
}
