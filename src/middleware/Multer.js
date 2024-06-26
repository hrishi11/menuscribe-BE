import multer from 'multer'
import path from 'path'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname,'..','..','uploads')); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    }
  });
  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  };
  export const multerUploads = multer({ storage: storage, fileFilter:fileFilter,   limits: { fileSize: 1024 * 1024 * 50 } // 5 MB limit
});