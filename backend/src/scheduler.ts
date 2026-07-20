import { pool } from './db/pool.js';
import { expirePendingCheckouts } from './services/checkout.service.js';
export function startScheduler(){
  const run=async()=>{
    try{
      await expirePendingCheckouts();
      await pool.execute("UPDATE leads SET status='ARCHIVED',is_featured=0,archived_at=UTC_TIMESTAMP() WHERE status='ACTIVE' AND expires_at IS NOT NULL AND expires_at<UTC_TIMESTAMP()");
      await pool.execute('DELETE FROM admin_sessions WHERE expires_at<UTC_TIMESTAMP()');
      await pool.execute("UPDATE jobs SET status='PENDING',locked_at=NULL,locked_by=NULL,available_at=UTC_TIMESTAMP(),last_error=CONCAT(COALESCE(last_error,''),'\nRecovered after worker timeout') WHERE status='PROCESSING' AND locked_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 15 MINUTE)");
    }catch(error){console.error('Scheduler error',error);}
  };
  void run(); const timer=setInterval(run,60_000); timer.unref();
}
