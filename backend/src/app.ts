import express from "express";
import path from "node:path";
import fs from "node:fs";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { publicRouter } from "./routes/public.js";
import { adminAuthRouter } from "./routes/admin-auth.js";
import { adminRouter } from "./routes/admin.js";
import { asyncHandler } from "./utils/async-handler.js";
import { processStripeWebhook } from "./services/checkout.service.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { pingDatabase } from "./db/pool.js";

export const app = express();

app.set("trust proxy", env.TRUST_PROXY);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((value) => value.trim()),
    credentials: true,
  }),
);

app.use(cookieParser());

/*
 * Stripe webhook must be registered before express.json().
 * Stripe requires the original raw request body.
 */
app.post(
  "/api/stripe/webhook",
  express.raw({
    type: "application/json",
    limit: "2mb",
  }),
  asyncHandler(async (req, res) => {
    const signature = req.get("stripe-signature");

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        error: "Stripe webhook body was not received as a raw buffer.",
      });
    }

    console.log("Stripe webhook received:", {
      hasSignature: Boolean(signature),
      bodyLength: req.body.length,
    });

    const result = await processStripeWebhook(
      req.body,
      signature,
    );

    return res.status(200).json(result);
  }),
);

/*
 * Normal body parsers must remain after the Stripe webhook route.
 */
app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  }),
);

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 240,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

fs.mkdirSync(env.uploadDir, {
  recursive: true,
});

app.use(
  "/uploads",
  express.static(env.uploadDir, {
    maxAge: "7d",
    immutable: true,
  }),
);

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    await pingDatabase();

    return res.json({
      status: "ok",
      time: new Date().toISOString(),
    });
  }),
);

app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin", adminRouter);
app.use("/api", publicRouter);

app.use(notFound);
app.use(errorHandler);