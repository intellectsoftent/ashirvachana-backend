const express = require('express');
const router = express.Router();
const { Cart, Pooja, Idol } = require('../models');
const { protect } = require('../middleware/auth');

// All cart routes require user auth
router.use(protect);

// GET /api/cart - Get user's cart with item details
router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.findAll({ where: { user_id: req.user.id } });

    // Enrich with item details
    const enriched = await Promise.all(cartItems.map(async (item) => {
      let details = null;
      if (item.item_type === 'pooja') {
        details = await Pooja.findByPk(item.item_id, { attributes: ['id', 'title', 'image_url', 'price', 'category'] });
      } else {
        details = await Idol.findByPk(item.item_id, { attributes: ['id', 'name', 'image_url', 'price', 'in_stock'] });
      }
      return { ...item.toJSON(), details };
    }));

    const subtotal = enriched.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    res.json({ success: true, data: enriched, subtotal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { item_type, item_id, quantity } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message: 'item_type and item_id are required' });
    }

    // Get current price
    let unit_price;
    if (item_type === 'pooja') {
      const pooja = await Pooja.findByPk(item_id);
      if (!pooja) return res.status(404).json({ success: false, message: 'Pooja not found' });
      unit_price = pooja.price;
    } else if (item_type === 'idol') {
      const idol = await Idol.findByPk(item_id);
      if (!idol) return res.status(404).json({ success: false, message: 'Idol not found' });
      if (!idol.in_stock) return res.status(400).json({ success: false, message: 'Idol is out of stock' });
      unit_price = idol.price;
    } else {
      return res.status(400).json({ success: false, message: 'item_type must be pooja or idol' });
    }

    // Check if already in cart
    const existing = await Cart.findOne({ where: { user_id: req.user.id, item_type, item_id } });

    if (existing) {
      await existing.update({ quantity: existing.quantity + (quantity || 1), unit_price });
      return res.json({ success: true, message: 'Cart updated', data: existing });
    }

    const cartItem = await Cart.create({
      user_id: req.user.id,
      item_type,
      item_id,
      quantity: quantity || 1,
      unit_price
    });

    res.status(201).json({ success: true, message: 'Added to cart', data: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cart/:id - Update quantity
router.put('/:id', async (req, res) => {
  try {
    const cartItem = await Cart.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!cartItem) return res.status(404).json({ success: false, message: 'Cart item not found' });

    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    await cartItem.update({ quantity });
    res.json({ success: true, message: 'Cart updated', data: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', async (req, res) => {
  try {
    const cartItem = await Cart.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!cartItem) return res.status(404).json({ success: false, message: 'Cart item not found' });
    await cartItem.destroy();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/clear/all
router.delete('/clear/all', async (req, res) => {
  try {
    await Cart.destroy({ where: { user_id: req.user.id } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
