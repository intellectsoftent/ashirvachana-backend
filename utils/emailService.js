const nodemailer = require("nodemailer");
require("dotenv").config();

// ─── Shared SMTP Transporter ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ SMTP transporter ready — emails will work");
  }
});

// ─── Send Booking Notification to Admin ──────────────────────────────────────
/**
 * @param {Object} order      - The saved order object (from DB)
 * @param {Array}  orderItems - Array of order_items for this order
 * @param {Object} buyer      - User object { name, email, phone, address, city }
 */
const sendBookingNotificationToAdmin = async (order, orderItems, buyer) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn(
      "⚠️  ADMIN_EMAIL not set in .env — skipping admin notification",
    );
    return;
  }

  // Build items rows for the email table
  const itemRows = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6;">
          ${item.item_type === "pooja" ? "🪔" : "🕉️"}
          <strong>${item.item_name}</strong>
          <br/><span style="font-size:12px;color:#6b7280;">Type: ${item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align:center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align:right;">₹${Number(item.unit_price).toLocaleString("en-IN")}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align:right; font-weight:600;">₹${Number(item.total_price).toLocaleString("en-IN")}</td>
      </tr>`,
    )
    .join("");

  // Pooja-specific details (only if order_type is pooja or mixed)
  const poojaDetails = order.pooja_date
    ? `
      <tr>
        <td style="padding:8px 0; color:#6b7280; width:160px;">Pooja Date</td>
        <td style="padding:8px 0; font-weight:600; color:#374151;">${new Date(order.pooja_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#6b7280;">Pooja Time</td>
        <td style="padding:8px 0; font-weight:600; color:#374151;">${order.pooja_time || "—"}</td>
      </tr>`
    : "";

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
    <div style="max-width:620px;margin:32px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#92400e,#b45309);padding:28px 32px;">
        <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.5px;">🛕 Ashirvachana</h1>
        <p style="margin:6px 0 0;color:#fde68a;font-size:14px;">New Booking Received</p>
      </div>

      <!-- Order Summary Banner -->
      <div style="background:#fef3c7;padding:16px 32px;border-bottom:1px solid #fde68a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;font-size:13px;color:#92400e;">ORDER NUMBER</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#78350f;">${order.order_number}</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;font-size:13px;color:#92400e;">ORDER TYPE</p>
              <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#78350f;text-transform:capitalize;">${order.order_type}</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0;font-size:13px;color:#92400e;">TOTAL AMOUNT</p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#16a34a;">₹${Number(order.total_amount).toLocaleString("en-IN")}</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:28px 32px;">

        <!-- Buyer Details -->
        <h2 style="margin:0 0 16px;font-size:16px;color:#374151;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">👤 Buyer Details</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:8px 0; color:#6b7280; width:160px;">Name</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${buyer.name || order.customer_name || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Email</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${buyer.email || order.customer_email || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Phone</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${buyer.phone || order.customer_phone || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280; vertical-align:top;">Delivery Address</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${[order.address, order.city, order.state, order.pincode].filter(Boolean).join(", ") || "—"}</td>
          </tr>
          ${poojaDetails}
        </table>

        <!-- Order Items -->
        <h2 style="margin:0 0 16px;font-size:16px;color:#374151;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">🛒 Items Ordered</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;">Item</th>
              <th style="padding:10px 12px;text-align:center;font-size:13px;color:#6b7280;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;">Unit Price</th>
              <th style="padding:10px 12px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- Payment Summary -->
        <h2 style="margin:0 0 16px;font-size:16px;color:#374151;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">💰 Payment Summary</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:6px 0; color:#6b7280;">Subtotal</td>
            <td style="padding:6px 0; text-align:right; color:#374151;">₹${Number(order.subtotal || 0).toLocaleString("en-IN")}</td>
          </tr>
          ${Number(order.tax_amount) > 0 ? `<tr><td style="padding:6px 0; color:#6b7280;">Tax</td><td style="padding:6px 0; text-align:right; color:#374151;">₹${Number(order.tax_amount).toLocaleString("en-IN")}</td></tr>` : ""}
          ${Number(order.shipping_amount) > 0 ? `<tr><td style="padding:6px 0; color:#6b7280;">Shipping</td><td style="padding:6px 0; text-align:right; color:#374151;">₹${Number(order.shipping_amount).toLocaleString("en-IN")}</td></tr>` : ""}
          ${Number(order.discount_amount) > 0 ? `<tr><td style="padding:6px 0; color:#6b7280;">Discount</td><td style="padding:6px 0; text-align:right; color:#16a34a;">-₹${Number(order.discount_amount).toLocaleString("en-IN")}</td></tr>` : ""}
          <tr style="border-top:2px solid #e5e7eb;">
            <td style="padding:10px 0 6px; font-weight:700; color:#111827; font-size:16px;">Total Amount</td>
            <td style="padding:10px 0 6px; text-align:right; font-weight:700; color:#16a34a; font-size:18px;">₹${Number(order.total_amount).toLocaleString("en-IN")}</td>
          </tr>
          ${
            Number(order.advance_amount) > 0
              ? `
          <tr>
            <td style="padding:4px 0; color:#6b7280;">Advance Paid</td>
            <td style="padding:4px 0; text-align:right; color:#2563eb;">₹${Number(order.advance_amount).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#6b7280;">Balance Pending</td>
            <td style="padding:4px 0; text-align:right; color:#dc2626; font-weight:600;">₹${Number(order.pending_amount).toLocaleString("en-IN")}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Payment Status</td>
            <td style="padding:8px 0; text-align:right;">
              <span style="background:${order.payment_status === "paid" ? "#dcfce7" : "#fef9c3"};color:${order.payment_status === "paid" ? "#16a34a" : "#92400e"};padding:3px 10px;border-radius:20px;font-size:13px;font-weight:600;text-transform:capitalize;">${order.payment_status}</span>
            </td>
          </tr>
          ${order.razorpay_payment_id ? `<tr><td style="padding:6px 0; color:#6b7280; font-size:13px;">Razorpay Payment ID</td><td style="padding:6px 0; text-align:right; color:#374151; font-size:13px; font-family:monospace;">${order.razorpay_payment_id}</td></tr>` : ""}
          ${order.razorpay_order_id ? `<tr><td style="padding:6px 0; color:#6b7280; font-size:13px;">Razorpay Order ID</td><td style="padding:6px 0; text-align:right; color:#374151; font-size:13px; font-family:monospace;">${order.razorpay_order_id}</td></tr>` : ""}
        </table>

        ${order.notes ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:24px;"><p style="margin:0 0 4px;font-weight:600;color:#374151;font-size:13px;">📝 Customer Notes</p><p style="margin:0;color:#6b7280;font-size:14px;">${order.notes}</p></div>` : ""}

      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated notification from Ashirvachana website. Booked on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.</p>
      </div>

    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Ashirvachana Bookings" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🛕 New Booking: ${order.order_number} — ₹${Number(order.total_amount).toLocaleString("en-IN")} (${order.order_type})`,
    html,
  });

  console.log(
    `📧 Admin booking notification sent to ${adminEmail} for order ${order.order_number}`,
  );
};

// ─── Send Order Confirmation to Customer ─────────────────────────────────────
/**
 * @param {Object} order      - The saved order object (from DB)
 * @param {Array}  orderItems - Array of order_items for this order
 */
const sendOrderConfirmationToCustomer = async (order, orderItems) => {
  const customerEmail = order.customer_email;
  if (!customerEmail) {
    console.warn("⚠️  No customer email on order — skipping customer confirmation");
    return;
  }

  const itemRows = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6;">
          ${item.item_type === "pooja" ? "🪔" : "🕉️"}
          <strong>${item.item_name}</strong>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align:center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align:right;">₹${Number(item.unit_price).toLocaleString(
          "en-IN",
        )}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align:right; font-weight:600;">₹${Number(
          item.total_price,
        ).toLocaleString("en-IN")}</td>
      </tr>`,
    )
    .join("");

  const poojaDetails = order.pooja_date
    ? `
      <tr>
        <td style="padding:6px 0; color:#6b7280; width:140px;">Pooja Date</td>
        <td style="padding:6px 0; font-weight:600; color:#111827;">${new Date(order.pooja_date).toLocaleDateString(
          "en-IN",
          { day: "numeric", month: "long", year: "numeric" },
        )}</td>
      </tr>
      <tr>
        <td style="padding:6px 0; color:#6b7280;">Pooja Time</td>
        <td style="padding:6px 0; font-weight:600; color:#111827;">${order.pooja_time || "—"}</td>
      </tr>`
    : "";

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
    <div style="max-width:620px;margin:32px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 28px;">
        <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.4px;">Ashirvachana</h1>
        <p style="margin:6px 0 0;color:#dcfce7;font-size:14px;">Your booking is confirmed</p>
      </div>

      <div style="padding:24px 28px 8px;">
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">Namaste ${order.customer_name || ""},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#4b5563;">
          Thank you for choosing <strong>Ashirvachana</strong>. Your booking has been received successfully.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
          <tr>
            <td style="padding:4px 0; color:#6b7280; width:140px;">Order Number</td>
            <td style="padding:4px 0; font-weight:600; color:#111827;">${order.order_number}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; color:#6b7280;">Order Type</td>
            <td style="padding:4px 0; font-weight:600; color:#111827; text-transform:capitalize;">${order.order_type}</td>
          </tr>
          ${poojaDetails}
        </table>

        <h2 style="margin:16px 0 10px;font-size:15px;color:#374151;">Items</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:18px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 10px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;">Item</th>
              <th style="padding:8px 10px;text-align:center;font-size:13px;color:#6b7280;font-weight:600;">Qty</th>
              <th style="padding:8px 10px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;">Unit</th>
              <th style="padding:8px 10px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <h2 style="margin:16px 0 10px;font-size:15px;color:#374151;">Payment Summary</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="padding:4px 0; color:#6b7280;">Total Amount</td>
            <td style="padding:4px 0; text-align:right; color:#111827; font-weight:600;">₹${Number(
              order.total_amount,
            ).toLocaleString("en-IN")}</td>
          </tr>
          ${
            Number(order.advance_amount) > 0
              ? `
          <tr>
            <td style="padding:4px 0; color:#6b7280;">Paid Now</td>
            <td style="padding:4px 0; text-align:right; color:#15803d; font-weight:600;">₹${Number(
              order.advance_amount,
            ).toLocaleString("en-IN")}</td>
          </tr>`
              : ""
          }
          ${
            Number(order.pending_amount) > 0
              ? `
          <tr>
            <td style="padding:4px 0; color:#6b7280;">Pending Amount</td>
            <td style="padding:4px 0; text-align:right; color:#b45309; font-weight:600;">₹${Number(
              order.pending_amount,
            ).toLocaleString("en-IN")}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:6px 0; color:#6b7280;">Payment Status</td>
            <td style="padding:6px 0; text-align:right;">
              <span style="background:${
                order.payment_status === "paid" ? "#dcfce7" : order.payment_status === "partial" ? "#fef9c3" : "#fee2e2"
              };color:${
                order.payment_status === "paid"
                  ? "#16a34a"
                  : order.payment_status === "partial"
                  ? "#92400e"
                  : "#b91c1c"
              };padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize;">
                ${order.payment_status}
              </span>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 6px;font-size:13px;color:#4b5563;">
          Our team will contact you shortly with further details and coordination.
        </p>
        <p style="margin:0 0 18px;font-size:13px;color:#4b5563;">
          For any queries, you can reply to this email.
        </p>
      </div>

      <div style="background:#f9fafb;padding:14px 28px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          This is an automated confirmation from Ashirvachana. Booked on ${new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })} IST.
        </p>
      </div>

    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Ashirvachana" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Your Ashirvachana booking ${order.order_number}`,
    html,
  });

  console.log(
    `📧 Customer booking confirmation sent to ${customerEmail} for order ${order.order_number}`,
  );
};

module.exports = { transporter, sendBookingNotificationToAdmin, sendOrderConfirmationToCustomer };
