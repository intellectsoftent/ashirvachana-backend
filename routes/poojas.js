const express = require('express');
const router = express.Router();
const { Pooja, Location, PoojaLocation } = require('../models');
const { adminProtect } = require('../middleware/auth');
const { upload, getImageUrl, deleteOldImage } = require('../middleware/upload');
const { Op } = require('sequelize');

const parseFormArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const parseBool = (value) => {
  if (value === 'true' || value === true || value === 1 || value === '1') return true;
  if (value === 'false' || value === false || value === 0 || value === '0') return false;
  return null;
};

// PUBLIC: Get All Poojas
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, location_id, check_location } = req.query;
    const where = { is_active: true };
    if (category) where.category = category;
    if (featured === 'true') where.is_featured = true;
    if (search) where.title = { [Op.like]: `%${search}%` };

    if (location_id) {
      const poojas = await Pooja.findAll({
        where,
        include: [{ model: Location, as: 'locations', where: { id: location_id }, attributes: ['id', 'name'], required: true }],
        order: [['is_featured', 'DESC'], ['createdAt', 'DESC']]
      });
      return res.json({ success: true, location_filtered: true, count: poojas.length, data: poojas });
    }

    if (check_location) {
      const [allPoojas, assignedIds] = await Promise.all([
        Pooja.findAll({ where, order: [['is_featured', 'DESC'], ['createdAt', 'DESC']] }),
        PoojaLocation.findAll({ where: { location_id: check_location }, attributes: ['pooja_id'] })
      ]);
      const assignedSet = new Set(assignedIds.map(r => r.pooja_id));
      const enriched = allPoojas.map(p => ({
        ...p.toJSON(),
        available_at_location: assignedSet.has(p.id),
        availability_message: assignedSet.has(p.id) ? null : 'Not available at your location'
      }));
      return res.json({ success: true, count: enriched.length, data: enriched });
    }

    const poojas = await Pooja.findAll({ where, order: [['is_featured', 'DESC'], ['createdAt', 'DESC']] });
    res.json({ success: true, count: poojas.length, data: poojas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC: Get Single Pooja
router.get('/:id', async (req, res) => {
  try {
    const { location_id } = req.query;
    const pooja = await Pooja.findOne({
      where: { id: req.params.id, is_active: true },
      include: [{ model: Location, as: 'locations', attributes: ['id', 'name'], through: { attributes: [] } }]
    });
    if (!pooja) return res.status(404).json({ success: false, message: 'Pooja not found' });
    const poojaData = pooja.toJSON();
    if (location_id) {
      const entry = await PoojaLocation.findOne({ where: { pooja_id: req.params.id, location_id } });
      poojaData.available_at_location = !!entry;
      poojaData.availability_message = entry ? null : 'This pooja is not available at your location';
    }
    res.json({ success: true, data: poojaData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Get All Poojas
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const poojas = await Pooja.findAll({
      include: [{ model: Location, as: 'locations', attributes: ['id', 'name'], through: { attributes: [] } }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: poojas.length, data: poojas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Create Pooja - accepts multipart/form-data OR application/json
router.post('/admin/create', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const { title, category, price, original_price, duration, description, badge, advance_percent } = req.body;
    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and price are required' });
    }
    const benefits     = parseFormArray(req.body.benefits);
    const includes     = parseFormArray(req.body.includes);
    const location_ids = parseFormArray(req.body.location_ids).map(Number).filter(Boolean);
    const is_featured  = parseBool(req.body.is_featured) ?? false;
    const image_url    = getImageUrl(req) || req.body.image_url || null;

    const pooja = await Pooja.create({
      title, category,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      duration, image_url, description, benefits, includes, is_featured, badge,
      advance_percent: advance_percent ? parseInt(advance_percent) : 30
    });

    if (location_ids.length > 0) {
      const records = location_ids.map(lid => ({ pooja_id: pooja.id, location_id: lid }));
      await PoojaLocation.bulkCreate(records, { ignoreDuplicates: true });
    }
    res.status(201).json({ success: true, message: 'Pooja created successfully', data: pooja });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Update Pooja - accepts multipart/form-data OR application/json
router.put('/admin/:id', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const pooja = await Pooja.findByPk(req.params.id);
    if (!pooja) return res.status(404).json({ success: false, message: 'Pooja not found' });

    const updateData = {};
    if (req.body.title !== undefined)           updateData.title = req.body.title;
    if (req.body.category !== undefined)        updateData.category = req.body.category;
    if (req.body.price !== undefined)           updateData.price = parseFloat(req.body.price);
    if (req.body.original_price !== undefined)  updateData.original_price = req.body.original_price ? parseFloat(req.body.original_price) : null;
    if (req.body.duration !== undefined)        updateData.duration = req.body.duration;
    if (req.body.description !== undefined)     updateData.description = req.body.description;
    if (req.body.badge !== undefined)           updateData.badge = req.body.badge;
    if (req.body.advance_percent !== undefined) updateData.advance_percent = parseInt(req.body.advance_percent);
    if (req.body.is_featured !== undefined)     updateData.is_featured = parseBool(req.body.is_featured);
    if (req.body.is_active !== undefined)       updateData.is_active = parseBool(req.body.is_active);
    if (req.body.benefits !== undefined)        updateData.benefits = parseFormArray(req.body.benefits);
    if (req.body.includes !== undefined)        updateData.includes = parseFormArray(req.body.includes);

    if (req.file) {
      deleteOldImage(pooja.image_url);
      updateData.image_url = getImageUrl(req);
    } else if (req.body.image_url !== undefined) {
      updateData.image_url = req.body.image_url || null;
    }

    await pooja.update(updateData);

    if (req.body.location_ids !== undefined) {
      const location_ids = parseFormArray(req.body.location_ids).map(Number).filter(Boolean);
      await PoojaLocation.destroy({ where: { pooja_id: pooja.id } });
      if (location_ids.length > 0) {
        await PoojaLocation.bulkCreate(location_ids.map(lid => ({ pooja_id: pooja.id, location_id: lid })), { ignoreDuplicates: true });
      }
    }

    const updated = await Pooja.findByPk(pooja.id, {
      include: [{ model: Location, as: 'locations', attributes: ['id', 'name'], through: { attributes: [] } }]
    });
    res.json({ success: true, message: 'Pooja updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Delete Pooja
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    const pooja = await Pooja.findByPk(req.params.id);
    if (!pooja) return res.status(404).json({ success: false, message: 'Pooja not found' });
    deleteOldImage(pooja.image_url);
    await PoojaLocation.destroy({ where: { pooja_id: pooja.id } });
    await pooja.destroy();
    res.json({ success: true, message: 'Pooja deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
