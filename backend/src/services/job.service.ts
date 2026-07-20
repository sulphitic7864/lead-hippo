import os from 'node:os';
import type { RowDataPacket } from 'mysql2/promise';
import { pool, query, transaction } from '../db/pool.js';
import { mysqlDate } from '../utils/dates.js';

export type JobType='FULFILL_PURCHASE'|'CONTACT_NOTIFICATION'|'RESEND_REPORT';
export async function enqueueJob(jobType:JobType,payload:Record<string,unknown>,availableAt=new Date()) {
  const [result]=await pool.execute('INSERT INTO jobs(job_type,payload,available_at) VALUES(?,?,?)',[jobType,JSON.stringify(payload),mysqlDate(availableAt)]);
  return result;
}
interface JobRow extends RowDataPacket { id:number;job_type:JobType;payload:string|object;attempts:number;max_attempts:number; }
export async function claimJob() {
  return transaction(async connection=>{
    const [rows]=await connection.query<JobRow[]>("SELECT * FROM jobs WHERE status='PENDING' AND available_at<=UTC_TIMESTAMP() ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED");
    const job=rows[0]; if(!job) return null;
    await connection.execute("UPDATE jobs SET status='PROCESSING',locked_at=UTC_TIMESTAMP(),locked_by=?,attempts=attempts+1 WHERE id=?",[os.hostname(),job.id]);
    return {...job,payload:typeof job.payload==='string'?JSON.parse(job.payload):job.payload};
  });
}
export async function completeJob(id:number){await pool.execute("UPDATE jobs SET status='COMPLETED',completed_at=UTC_TIMESTAMP(),locked_at=NULL,locked_by=NULL WHERE id=?",[id]);}
export async function failJob(job:JobRow,error:unknown){
  const message=error instanceof Error?error.stack||error.message:String(error);
  const next=Math.min(60,2**Math.max(1,job.attempts));
  await pool.execute(`UPDATE jobs SET status=IF(attempts>=max_attempts,'FAILED','PENDING'),available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? MINUTE),locked_at=NULL,locked_by=NULL,last_error=? WHERE id=?`,[next,message.slice(0,10000),job.id]);
}
