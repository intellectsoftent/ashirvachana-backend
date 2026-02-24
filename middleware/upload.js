// middleware/upload.js
// Handles image uploads via multipart/form-data using multer
// Saves files to /uploads/{type}/ and constructs public URL

const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ─── Ensure upload folders exist ──────────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(path.join(__dirname, '..', 'uploads', 'poojas'));
ensureDir(path.join(__dirname, '..', 'uploads', 'idols'));
ensureDir(path.join(__dirname, '..', 'uploads', 'blogs'));
ensureDir(path.join(__dirname, '..', 'uploads', 'pujaris'));
ensureDir(path.join(__dirname, '..', 'uploads', 'misc'));

// ─── Storage Engine ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine sub-folder based on route
    const url = req.originalUrl;
    let folder = 'misc';
    if (url.includes('/poojas'))    folder = 'poojas';
    else if (url.includes('/idols')) folder = 'idols';
    else if (url.includes('/blogs')) folder = 'blogs';
    else if (url.includes('/pujaris')) folder = 'pujaris';

    const dest = path.join(__dirname, '..', 'uploads', folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Format: pooja-1712345678901-image.jpg  (timestamp + original name)
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-]/g, '')
      .toLowerCase()
      .slice(0, 40);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// ─── File Filter (images only) ────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'), false);
  }
};

// ─── Multer Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max per file
  }
});

// ─── Helper: Build full public image URL from req.file ────────────────────────
// Call this after multer runs to get the URL to store in DB
const getImageUrl = (req) => {
  if (!req.file) return null;

  // Build base URL from request (works on localhost and production)
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

  // req.file.path is absolute; strip to relative uploads/... path
  const relativePath = req.file.path
    .replace(/\\/g, '/') // normalize Windows backslashes
    .split('uploads/')
    .pop();

  return `${baseUrl}/uploads/${relativePath}`;
};

// ─── Delete old image file ────────────────────────────────────────────────────
const deleteOldImage = (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Only delete locally-stored files (not external URLs like unsplash)
    if (!imageUrl.includes('/uploads/')) return;

    const uploadsIndex = imageUrl.indexOf('/uploads/');
    const relativePath = imageUrl.substring(uploadsIndex + 1); // "uploads/poojas/..."
    const absolutePath = path.join(__dirname, '..', relativePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️  Deleted old image: ${absolutePath}`);
    }
  } catch (err) {
    console.error('Could not delete old image:', err.message);
  }
};

module.exports = { upload, getImageUrl, deleteOldImage };
