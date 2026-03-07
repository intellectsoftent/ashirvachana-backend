const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Order, OrderItem, Cart, Pooja, Idol, User } = require("../models");
const { protect, adminProtect, optionalAuth } = require("../middleware/auth");
const Razorpay = require("razorpay");
const { Op } = require("sequelize");
require("dotenv").config();
const { sendBookingNotificationToAdmin } = require("../utils/emailService");

// Helper to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ASH-${timestamp}-${random}`;
};

// ─── USER ROUTES ───────────────────────────────────────────────────────────────

// POST /api/orders/create-razorpay-order  (Initiate Payment)
// Uses optionalAuth: works for both logged-in users and guests (pooja checkout)
router.post("/create-razorpay-order", optionalAuth, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Amount is required" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env",
      });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || generateOrderNumber(),
    });

    res.json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/place  (Place order after payment)
// Uses optionalAuth: guests can place pooja orders; idol orders require login
router.post("/place", optionalAuth, async (req, res) => {
  try {
    const {
      order_type,
      items, // [{item_type, item_id, quantity}]
      pooja_id,
      pooja_date,
      pooja_time,
      address,
      city,
      state,
      pincode,
      customer_name,
      customer_phone,
      customer_email,
      notes,
      payment_method,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order items are required" });
    }

    // Idol orders require login
    const hasIdol = items.some((i) => (i.item_type || "").toLowerCase() === "idol");
    if (hasIdol && !req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login to book idols",
      });
    }

    // Guest orders (pooja only) require customer details
    if (!req.user) {
      if (!customer_name || !customer_phone || !customer_email) {
        return res.status(400).json({
          success: false,
          message: "Name, phone and email are required for guest checkout",
        });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      let price, name, image;

      if (item.item_type === "pooja") {
        const pooja = await Pooja.findByPk(item.item_id);
        if (!pooja)
          return res.status(404).json({
            success: false,
            message: `Pooja ${item.item_id} not found`,
          });
        price = parseFloat(pooja.price);
        name = pooja.title;
        image = pooja.image_url;
      } else {
        const idol = await Idol.findByPk(item.item_id);
        if (!idol)
          return res.status(404).json({
            success: false,
            message: `Idol ${item.item_id} not found`,
          });
        if (!idol.in_stock)
          return res
            .status(400)
            .json({ success: false, message: `${idol.name} is out of stock` });
        price = parseFloat(idol.price);
        name = idol.name;
        image = idol.image_url;
      }

      subtotal += price * item.quantity;
      enrichedItems.push({
        ...item,
        unit_price: price,
        item_name: name,
        item_image: image,
      });
    }

    const tax_amount = order_type === "idol" ? subtotal * 0.18 : 0;
    const total_amount = subtotal + tax_amount;

    // Verify Razorpay signature — payment required for booking confirmation
    let payment_status = "unpaid";
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret || "")
        .update(body)
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        payment_status = "paid";
      }
    }

    // Booking not confirmed without successful payment
    if (payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Booking cannot be confirmed without payment.",
      });
    }

    // Create order
    const order = await Order.create({
      order_number: generateOrderNumber(),
      user_id: req.user ? req.user.id : null,
      order_type: order_type || "idol",
      status: payment_status === "paid" ? "confirmed" : "pending",
      pooja_id,
      pooja_date,
      pooja_time,
      address,
      city,
      state,
      pincode,
      subtotal,
      tax_amount,
      total_amount,
      advance_amount: 0,
      pending_amount: 0,
      payment_status,
      payment_method,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer_name: customer_name || (req.user && req.user.name) || "",
      customer_phone: customer_phone || (req.user && req.user.phone) || "",
      customer_email: customer_email || (req.user && req.user.email) || "",
      notes,
    });

    // Create order items and collect the saved rows
    const savedOrderItems = [];
    for (const item of enrichedItems) {
      const orderItem = await OrderItem.create({
        order_id: order.id,
        item_type: item.item_type,
        item_id: item.item_id,
        item_name: item.item_name,
        item_image: item.item_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      });
      savedOrderItems.push(orderItem);
    }

    // Clear user's cart after order (only for logged-in users)
    if (req.user) {
      await Cart.destroy({ where: { user_id: req.user.id } });
    }

    // Send response immediately so the user is not kept waiting
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status,
      },
    });

    // Send admin email notification for all bookings (fire-and-forget)
    const buyer = req.user
      ? { name: req.user.name, email: req.user.email, phone: req.user.phone }
      : { name: order.customer_name, email: order.customer_email, phone: order.customer_phone };
    sendBookingNotificationToAdmin(order, savedOrderItems, buyer).catch(
      (err) => console.error("⚠️  Admin booking email failed:", err.message),
    );
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/my-orders  (User's orders)
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: OrderItem, as: "items" },
        { model: Pooja, as: "pooja", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id  (Order details)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// GET /api/orders/admin/all
router.get("/admin/all", adminProtect, async (req, res) => {
  try {
    const { status, payment_status, order_type } = req.query;
    const where = {};

    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (order_type) where.order_type = order_type;

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
          required: false, // include guest orders (user_id null)
        },
        { model: OrderItem, as: "items" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/admin/:id/status  (Update order status)
router.put("/admin/:id/status", adminProtect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const { status, payment_status, priest_name } = req.body;
    await order.update({ status, payment_status, priest_name });

    res.json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/admin/stats  (Dashboard stats)
router.get("/admin/stats", adminProtect, async (req, res) => {
  try {
    const { sequelize } = require("../models");

    const [
      totalOrders,
      pendingBalance,
      totalPoojas,
      totalIdols,
      totalBlogs,
      totalTestimonials,
    ] = await Promise.all([
      Order.count(),
      Order.sum("pending_amount", { where: { payment_status: "partial" } }),
      require("../models").Pooja.count(),
      require("../models").Idol.count(),
      require("../models").BlogPost.count(),
      require("../models").Testimonial.count(),
    ]);

    res.json({
      success: true,
      data: {
        booked_orders: totalOrders,
        pending_balance: pendingBalance || 0,
        total_poojas: totalPoojas,
        total_idols: totalIdols,
        blog_posts: totalBlogs,
        testimonials: totalTestimonials,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
