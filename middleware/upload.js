// middleware/upload.js
// Handles image uploads to AWS S3 using multer-s3

const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
require("dotenv").config();

// ─── S3 Client ─────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// ─── File Filter (images only) ─────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed (jpeg, jpg, png, webp, gif)"),
      false,
    );
  }
};

// ─── Multer Storage (S3) ───────────────────────────────────
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET,
  acl: "public-read",

  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },

  key: function (req, file, cb) {
    const url = req.originalUrl;

    let folder = "misc";

    if (url.includes("/poojas")) folder = "poojas";
    else if (url.includes("/idols")) folder = "idols";
    else if (url.includes("/blogs")) folder = "blogs";
    else if (url.includes("/pujaris")) folder = "pujaris";

    const ext = path.extname(file.originalname).toLowerCase();

    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-]/g, "")
      .toLowerCase()
      .slice(0, 40);

    const fileName = `${folder}/${base}-${Date.now()}${ext}`;

    cb(null, fileName);
  },
});

// ─── Multer Instance ───────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ─── Helper: Get S3 Image URL ──────────────────────────────
const getImageUrl = (req) => {
  if (!req.file) return null;
  return req.file.location;
};

// ─── Delete old image from S3 ──────────────────────────────
const deleteOldImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    if (!imageUrl.includes("amazonaws.com")) return;

    const key = imageUrl.split(".amazonaws.com/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    });

    await s3.send(command);

    console.log(`🗑️ Deleted old image from S3: ${key}`);
  } catch (err) {
    console.error("Could not delete old image:", err.message);
  }
};

module.exports = { upload, getImageUrl, deleteOldImage };
