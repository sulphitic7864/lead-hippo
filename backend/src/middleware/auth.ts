import type { RequestHandler } from "express";
import type { RowDataPacket } from "mysql2";
import { query, execute } from "../db/pool.js";
import { sha256 } from "../utils/crypto.js";
import { HttpError } from "../utils/errors.js";
import { mysqlDate, addHours } from "../utils/dates.js";
import { env } from "../config/env.js";

interface SessionRow extends RowDataPacket {
  session_id: string;
  user_id: number;
  email: string;
  display_name: string;
  expires_at: Date;
}

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.lh_admin_session as string | undefined;
    if (!token)
      throw new HttpError(401, "Admin login required.", "AUTH_REQUIRED");
    const rows = await query<SessionRow[]>(
      `SELECT s.id AS session_id, u.id AS user_id, u.email, u.display_name, s.expires_at
      FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_user_id
      WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP() AND u.is_active=1 LIMIT 1`,
      [sha256(token)],
    );
    const session = rows[0];
    if (!session)
      throw new HttpError(401, "Session expired.", "SESSION_EXPIRED");
    req.admin = {
      id: session.user_id,
      email: session.email,
      displayName: session.display_name,
      sessionId: session.session_id,
    };
    await execute(
      "UPDATE admin_sessions SET last_seen_at=?, expires_at=? WHERE id=?",
      [
        mysqlDate(),
        mysqlDate(addHours(new Date(), env.SESSION_HOURS)),
        session.session_id,
      ],
    );
    next();
  } catch (error) {
    next(error);
  }
};
