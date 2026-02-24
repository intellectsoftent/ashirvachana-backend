const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { adminProtect } = require('../middleware/auth');

// GET /api/testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { is_active: true },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// GET /api/testimonials/admin/all
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/testimonials/admin/create
router.post('/admin/create', adminProtect, async (req, res) => {
  try {
    const { name, location, language, title, review_text, rating } = req.body;

    if (!name || !title || !review_text) {
      return res.status(400).json({ success: false, message: 'Name, title and review text are required' });
    }

    const testimonial = await Testimonial.create({ name, location, language, title, review_text, rating: rating || 5 });
    res.status(201).json({ success: true, message: 'Testimonial added', data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/testimonials/admin/:id
router.put('/admin/:id', adminProtect, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    await testimonial.update(req.body);
    res.json({ success: true, message: 'Testimonial updated', data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/testimonials/admin/:id
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    await testimonial.destroy();
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
