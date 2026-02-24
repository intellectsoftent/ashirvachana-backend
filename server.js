const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("./models");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure uploads directory exists ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*", // Allow all origins (for development). In production, specify your frontend URL(s) here.
    credentials: true,
  }),
);

// ─── IMPORTANT: Serve /uploads as static files so image URLs work ─────────────
// e.g. http://localhost:5000/uploads/poojas/homam-1712345678.jpg
app.use("/uploads", express.static(uploadsDir));

// JSON + URL-encoded parsers (for non-multipart requests)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/poojas", require("./routes/poojas"));
app.use("/api/idols", require("./routes/idols"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/locations", require("./routes/locations"));
app.use("/api/pujaris", require("./routes/pujaris"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ashirvachana API is running",
    timestamp: new Date(),
    uploads_url: `${req.protocol}://${req.get("host")}/uploads`,
  });
});

// ─── Multer error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB.",
    });
  }
  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected via Sequelize");
    app.listen(PORT, () => {
      console.log(`🚀 Ashirvachana API running on http://localhost:${PORT}`);
      console.log(`🖼️  Images served at http://localhost:${PORT}/uploads/`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();
