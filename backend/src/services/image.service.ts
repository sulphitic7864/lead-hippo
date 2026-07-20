import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

export interface StoredImage { storagePath: string; publicUrl: string; width: number; height: number; }

export async function storeLeadImage(file: Express.Multer.File): Promise<StoredImage> {
  const detected = await sharp(file.buffer).metadata();
  if (!['jpeg', 'png', 'webp'].includes(detected.format ?? '')) throw new HttpError(400, 'The uploaded file is not a valid image.', 'INVALID_IMAGE');
  await fs.mkdir(env.uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}.webp`;
  const storagePath = path.join(env.uploadDir, filename);
  const output = await sharp(file.buffer)
    .rotate()
    .resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(storagePath);
  return {
    storagePath,
    publicUrl: `${env.PUBLIC_UPLOAD_URL.replace(/\/$/, '')}/${filename}`,
    width: output.width,
    height: output.height
  };
}

export async function deleteStoredFile(storagePath: string | null | undefined) {
  if (!storagePath) return;
  try { await fs.unlink(storagePath); } catch (error: any) { if (error?.code !== 'ENOENT') console.error(error); }
}
