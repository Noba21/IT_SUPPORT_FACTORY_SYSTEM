import multer from 'multer';
import path from 'path';
import { resolveUploadRoot } from '../config/uploadPath.js';

const uploadDir = resolveUploadRoot();
const maxSize = 5 * 1024 * 1024; // 5MB
const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = path.join(uploadDir, 'misc');
    if (req.uploadType === 'profile') dir = path.join(uploadDir, 'profiles');
    if (req.uploadType === 'screenshot') dir = path.join(uploadDir, 'screenshots');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Use JPEG, PNG, GIF or WebP.'), false);
  }
  cb(null, true);
};

export const uploadProfile = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter,
}).single('photo');

export const uploadScreenshot = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter,
}).single('screenshot');

export const uploadOutsourcingScreenshot = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter,
}).single('outsourcing_screenshot');

/** Middleware: set upload type so storage picks the right folder */
export function setUploadType(type) {
  return (req, res, next) => {
    req.uploadType = type;
    next();
  };
}
