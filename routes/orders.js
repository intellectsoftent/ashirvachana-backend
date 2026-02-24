const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Order, OrderItem, Cart, Pooja, Idol, User } = require('../models');
const { protect, adminProtect } = require('../middleware/auth');
const { Op } = require('sequelize');
require('dotenv').config();

// Helper to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ASH-${timestamp}-${random}`;
};

// ─── USER ROUTES ───────────────────────────────────────────────────────────────

// POST /api/orders/create-razorpay-order  (Initiate Payment)
router.post('/create-razorpay-order', protect, async (req, res) => {
  try {
    // Razorpay integration (uncomment when you have keys)
    /*
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    */

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    // Simulate Razorpay order creation (replace with actual Razorpay call)
    const razorpayOrder = {
      id: `rzp_order_${Date.now()}`,
      amount: amount * 100, // Razorpay uses paise
      currency,
      receipt: receipt || generateOrderNumber(),
      status: 'created'
    };

    /* ACTUAL RAZORPAY CODE:
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: receipt || generateOrderNumber()
    });
    */

    res.json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/place  (Place order after payment)
router.post('/place', protect, async (req, res) => {
  try {
    const {
      order_type,
      items, // [{item_type, item_id, quantity}]
      pooja_id, pooja_date, pooja_time,
      address, city, state, pincode,
      customer_name, customer_phone, customer_email,
      notes,
      payment_method,
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      is_advance_payment
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Calculate totals
    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      let price, name, image;

      if (item.item_type === 'pooja') {
        const pooja = await Pooja.findByPk(item.item_id);
        if (!pooja) return res.status(404).json({ success: false, message: `Pooja ${item.item_id} not found` });
        price = parseFloat(pooja.price);
        name = pooja.title;
        image = pooja.image_url;
      } else {
        const idol = await Idol.findByPk(item.item_id);
        if (!idol) return res.status(404).json({ success: false, message: `Idol ${item.item_id} not found` });
        if (!idol.in_stock) return res.status(400).json({ success: false, message: `${idol.name} is out of stock` });
        price = parseFloat(idol.price);
        name = idol.name;
        image = idol.image_url;
      }

      subtotal += price * item.quantity;
      enrichedItems.push({ ...item, unit_price: price, item_name: name, item_image: image });
    }

    const tax_amount = order_type === 'idol' ? subtotal * 0.18 : 0;
    const total_amount = subtotal + tax_amount;

    // Advance payment for poojas (30%)
    let advance_amount = 0;
    let pending_amount = 0;
    if (order_type === 'pooja' && is_advance_payment) {
      advance_amount = total_amount * 0.30;
      pending_amount = total_amount - advance_amount;
    }

    // Verify Razorpay signature
    let payment_status = 'unpaid';
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
        .update(body)
        .digest('hex');

      if (expectedSignature === razorpay_signature || process.env.NODE_ENV === 'development') {
        payment_status = is_advance_payment ? 'partial' : 'paid';
      }
    }

    // Create order
    const order = await Order.create({
      order_number: generateOrderNumber(),
      user_id: req.user.id,
      order_type: order_type || 'idol',
      status: payment_status === 'paid' || payment_status === 'partial' ? 'confirmed' : 'pending',
      pooja_id, pooja_date, pooja_time,
      address, city, state, pincode,
      subtotal, tax_amount, total_amount,
      advance_amount, pending_amount,
      payment_status,
      payment_method,
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      customer_name: customer_name || req.user.name,
      customer_phone: customer_phone || req.user.phone,
      customer_email: customer_email || req.user.email,
      notes
    });

    // Create order items
    for (const item of enrichedItems) {
      await OrderItem.create({
        order_id: order.id,
        item_type: item.item_type,
        item_id: item.item_id,
        item_name: item.item_name,
        item_image: item.item_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      });
    }

    // Clear user's cart after order
    await Cart.destroy({ where: { user_id: req.user.id } });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order_id: order.id, order_number: order.order_number, status: order.status, payment_status }
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/my-orders  (User's orders)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }, { model: Pooja, as: 'pooja', attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id  (Order details)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// GET /api/orders/admin/all
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const { status, payment_status, order_type } = req.query;
    const where = {};

    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (order_type) where.order_type = order_type;

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/admin/:id/status  (Update order status)
router.put('/admin/:id/status', adminProtect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const { status, payment_status, priest_name } = req.body;
    await order.update({ status, payment_status, priest_name });

    res.json({ success: true, message: 'Order updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/admin/stats  (Dashboard stats)
router.get('/admin/stats', adminProtect, async (req, res) => {
  try {
    const { sequelize } = require('../models');

    const [totalOrders, pendingBalance, totalPoojas, totalIdols, totalBlogs, totalTestimonials] = await Promise.all([
      Order.count(),
      Order.sum('pending_amount', { where: { payment_status: 'partial' } }),
      require('../models').Pooja.count(),
      require('../models').Idol.count(),
      require('../models').BlogPost.count(),
      require('../models').Testimonial.count()
    ]);

    res.json({
      success: true,
      data: {
        booked_orders: totalOrders,
        pending_balance: pendingBalance || 0,
        total_poojas: totalPoojas,
        total_idols: totalIdols,
        blog_posts: totalBlogs,
        testimonials: totalTestimonials
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
