import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { asyncHandler } from "../utils/async-handler.js";
import { query, pool } from "../db/pool.js";
import { randomToken, sha256, verifyPassword } from "../utils/crypto.js";
import { addHours, mysqlDate } from "../utils/dates.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/errors.js";
import { requireAdmin } from "../middleware/auth.js";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_salt: string;
  password_hash: string;
  display_name: string;
  is_active: number;
}
export const adminAuthRouter = Router();
adminAuthRouter.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 8 }),
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        email: z.string().email(),
        password: z.string().min(8).max(200),
      })
      .parse(req.body);
    const rows = await query<UserRow[]>(
      "SELECT * FROM admin_users WHERE email=? LIMIT 1",
      [input.email.toLowerCase()],
    );
    const user = rows[0];
    if (
      !user ||
      !user.is_active ||
      !verifyPassword(input.password, user.password_salt, user.password_hash)
    )
      throw new HttpError(
        401,
        "Invalid email or password.",
        "INVALID_CREDENTIALS",
      );
    const token = randomToken(),
      id = uuid(),
      expires = addHours(new Date(), env.SESSION_HOURS);
    await pool.execute(
      "INSERT INTO admin_sessions(id,admin_user_id,token_hash,ip_address,user_agent,expires_at,last_seen_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP())",
      [
        id,
        user.id,
        sha256(token),
        req.ip || null,
        req.get("user-agent")?.slice(0, 500) || null,
        mysqlDate(expires),
      ],
    );
    await pool.execute(
      "UPDATE admin_users SET last_login_at=UTC_TIMESTAMP() WHERE id=?",
      [user.id],
    );
    res.cookie("lh_admin_session", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      domain: env.COOKIE_DOMAIN || undefined,
      maxAge: env.SESSION_HOURS * 3600000,
      path: "/",
    });
    res.json({
      data: { id: user.id, email: user.email, displayName: user.display_name },
    });
  }),
);
adminAuthRouter.get(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ data: req.admin });
  }),
);
adminAuthRouter.post(
  "/logout",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await pool.execute("DELETE FROM admin_sessions WHERE id=?", [
      req.admin!.sessionId,
    ]);
    res.clearCookie("lh_admin_session", { path: "/" });
    res.json({ data: { ok: true } });
  }),
);
