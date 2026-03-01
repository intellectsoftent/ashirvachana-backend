const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { Admin } = require("../models");
const { adminProtect } = require("../middleware/auth");
require("dotenv").config();

// ─── Nodemailer SMTP Transporter ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // prevents self-signed cert errors in dev
  },
});

// Verify SMTP on startup — shows real error in console so you know exactly what's wrong
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
    console.error(
      "   Fix: Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env",
    );
  } else {
    console.log("✅ SMTP transporter ready — emails will work");
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateAdminToken = (admin) => {
  return jwt.sign(
    { role: "admin", id: admin.id, username: admin.username },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "24h" },
  );
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Ashirvachana Admin" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Admin Password Reset OTP - Ashirvachana",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #92400e; margin-bottom: 4px;">Ashirvachana Admin</h2>
        <p style="color: #6b7280; margin-top: 0;">Password Reset Request</p>
        <hr style="border-color: #f3f4f6;" />
        <p style="color: #374151;">Use the OTP below to reset your admin password. It is valid for <strong>10 minutes</strong>.</p>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #92400e;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email. Your password will not change.</p>
        <hr style="border-color: #f3f4f6;" />
        <p style="color: #9ca3af; font-size: 12px;">Ashirvachana Admin Panel - Do not share this OTP with anyone</p>
      </div>
    `,
  });
};

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username and password are required",
        });
    }
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
    const token = generateAdminToken(admin);
    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/admin/verify ────────────────────────────────────────────────────
router.get("/verify", adminProtect, (req, res) => {
  res.json({ success: true, message: "Admin token valid", admin: req.admin });
});

// ─── POST /api/admin/forgot-password — Step 1: Send OTP ──────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: "If this email is registered, an OTP has been sent.",
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await admin.update({ otp, otp_expires_at: expiresAt });

    try {
      await sendOTPEmail(email, otp);
      console.log(`📧 OTP sent to ${email}: ${otp}`);
    } catch (smtpError) {
      // Rollback OTP so admin can retry cleanly
      await admin.update({ otp: null, otp_expires_at: null });
      console.error("❌ SMTP error details:", smtpError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email.",
        // Show real error only in dev — remove smtp_error in production
        ...(process.env.NODE_ENV !== "production" && {
          smtp_error: smtpError.message,
        }),
      });
    }

    res.json({
      success: true,
      message: "OTP sent to registered email. Valid for 10 minutes.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", detail: error.message });
  }
});

// ─── POST /api/admin/verify-otp — Step 2: Verify OTP ────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !admin.otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    if (admin.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }
    if (new Date() > new Date(admin.otp_expires_at)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
    }
    const resetToken = jwt.sign(
      { adminId: admin.id, purpose: "password_reset" },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "5m" },
    );
    res.json({
      success: true,
      message: "OTP verified successfully",
      reset_token: resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── POST /api/admin/reset-password — Step 3: Set New Password ───────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reset token and new password are required",
        });
    }
    if (new_password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters",
        });
    }
    let decoded;
    try {
      decoded = jwt.verify(reset_token, process.env.ADMIN_JWT_SECRET);
    } catch {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reset token is invalid or expired. Please start over.",
        });
    }
    if (decoded.purpose !== "password_reset") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reset token" });
    }
    const admin = await Admin.findByPk(decoded.adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    const hashed = await bcrypt.hash(new_password, 12);
    await admin.update({ password: hashed, otp: null, otp_expires_at: null });
    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
