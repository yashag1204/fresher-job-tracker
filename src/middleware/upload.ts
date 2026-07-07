import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Dynamically guarantee upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Set disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Enforce resume format filters (PDF, DOC, DOCX) and size limits
export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /pdf|doc|docx/;
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extensionCheck = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimeCheck = allowedMimeTypes.includes(file.mimetype);

    if (extensionCheck && mimeCheck) {
      cb(null, true);
    } else {
      cb(new Error("Only resume formats (.pdf, .doc, .docx) are supported."));
    }
  },
});
