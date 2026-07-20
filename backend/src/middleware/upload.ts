import multer from 'multer';
import { HttpError } from '../utils/errors.js';

export const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return callback(new HttpError(400, 'Only JPEG, PNG and WebP images are allowed.', 'INVALID_IMAGE_TYPE'));
    callback(null, true);
  }
});
