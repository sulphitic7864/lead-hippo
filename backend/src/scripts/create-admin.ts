import { z } from 'zod';
import { pool } from '../db/pool.js';
import { hashPassword } from '../utils/crypto.js';
const [emailArg,passwordArg,nameArg]=process.argv.slice(2);
const input=z.object({email:z.string().email(),password:z.string().min(12),name:z.string().min(2)}).parse({email:emailArg,password:passwordArg,name:nameArg||'Administrator'});
const {salt,hash}=hashPassword(input.password);
await pool.execute(`INSERT INTO admin_users(email,password_salt,password_hash,display_name) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE password_salt=VALUES(password_salt),password_hash=VALUES(password_hash),display_name=VALUES(display_name),is_active=1`,[input.email.toLowerCase(),salt,hash,input.name]);
console.log(`Admin ready: ${input.email}`);await pool.end();
