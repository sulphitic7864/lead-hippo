import mysql, { type PoolConnection, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import { env } from '../config/env.js';

const url = new URL(env.DATABASE_URL);
export const pool = mysql.createPool({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  waitForConnections: true,
  connectionLimit: 12,
  timezone: 'Z',
  charset: 'utf8mb4'
});

export async function query<T extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

export async function transaction<T>(fn: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function pingDatabase(): Promise<void> {
  await pool.query('SELECT 1');
}
