import path from 'path';

import multer from 'multer';

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'videos'));
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${unique}${ext}`);
  },
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = /\.(mp4|mov|avi|mkv|webm)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Formato de video nao suportado. Use MP4, MOV, AVI, MKV ou WebM.'));
    }
  },
});
