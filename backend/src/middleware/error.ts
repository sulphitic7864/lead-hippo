import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";

export const notFound: RequestHandler = (req, _res, next) =>
  next(
    new HttpError(
      404,
      `Route not found: ${req.method} ${req.path}`,
      "NOT_FOUND",
    ),
  );

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError)
    return res
      .status(422)
      .json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.flatten(),
        },
      });
  if (error instanceof multer.MulterError)
    return res
      .status(400)
      .json({ error: { code: "UPLOAD_ERROR", message: error.message } });
  if (error instanceof HttpError)
    return res
      .status(error.status)
      .json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
  console.error(error);
  return res
    .status(500)
    .json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
};
