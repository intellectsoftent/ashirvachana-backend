const express = require('express');
const router = express.Router();
const { Idol, Location, IdolLocation } = require('../models');
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

// PUBLIC: Get All Idols
router.get('/', async (req, res) => {
  try {
    const { deity, in_stock, search, location_id, check_location } = req.query;
    const where = {};
    if (deity) where.deity = deity;
    if (in_stock === 'true') where.in_stock = true;
    if (search) where.name = { [Op.like]: `%${search}%` };

    if (location_id) {
      const idols = await Idol.findAll({
        where,
        include: [{ model: Location, as: 'locations', where: { id: location_id }, attributes: ['id', 'name'], required: true }],
        order: [['is_featured', 'DESC'], ['createdAt', 'DESC']]
      });
      return res.json({ success: true, location_filtered: true, count: idols.length, data: idols });
    }

    if (check_location) {
      const [allIdols, assignedIds] = await Promise.all([
        Idol.findAll({ where, order: [['is_featured', 'DESC'], ['createdAt', 'DESC']] }),
        IdolLocation.findAll({ where: { location_id: check_location }, attributes: ['idol_id'] })
      ]);
      const assignedSet = new Set(assignedIds.map(r => r.idol_id));
      const enriched = allIdols.map(i => ({
        ...i.toJSON(),
        available_at_location: assignedSet.has(i.id),
        availability_message: assignedSet.has(i.id) ? null : 'Not available at your location'
      }));
      return res.json({ success: true, count: enriched.length, data: enriched });
    }

    const idols = await Idol.findAll({ where, order: [['is_featured', 'DESC'], ['createdAt', 'DESC']] });
    res.json({ success: true, count: idols.length, data: idols });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC: Get Single Idol
router.get('/:id', async (req, res) => {
  try {
    const { location_id } = req.query;
    const idol = await Idol.findByPk(req.params.id, {
      include: [{ model: Location, as: 'locations', attributes: ['id', 'name'], through: { attributes: [] } }]
    });
    if (!idol) return res.status(404).json({ success: false, message: 'Idol not found' });
    const idolData = idol.toJSON();
    if (location_id) {
      const entry = await IdolLocation.findOne({ where: { idol_id: req.params.id, location_id } });
      idolData.available_at_location = !!entry;
      idolData.availability_message = entry ? null : 'This idol is not available at your location';
    }
    res.json({ success: true, data: idolData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Get All Idols
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const idols = await Idol.findAll({
      include: [{ model: Location, as: 'locations', attributes: ['id', 'name'], through: { attributes: [] } }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: idols.length, data: idols });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Create Idol - accepts multipart/form-data OR application/json
router.post('/admin/create', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const { name, deity, price, original_price, material, height, weight, description, stock_quantity } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    const features     = parseFormArray(req.body.features);
    const location_ids = parseFormArray(req.body.location_ids).map(Number).filter(Boolean);
    const in_stock     = parseBool(req.body.in_stock) ?? true;
    const is_featured  = parseBool(req.body.is_featured) ?? false;
    const image_url    = getImageUrl(req) || req.body.image_url || null;

    const idol = await Idol.create({
      name, deity,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      material, height, weight, image_url, description, features, in_stock,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 100,
      is_featured
    });

    if (location_ids.length > 0) {
      await IdolLocation.bulkCreate(location_ids.map(lid => ({ idol_id: idol.id, location_id: lid })), { ignoreDuplicates: true });
    }
    res.status(201).json({ success: true, message: 'Idol created successfully', data: idol });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Update Idol - accepts multipart/form-data OR application/json
router.put('/admin/:id', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const idol = await Idol.findByPk(req.params.id);
    if (!idol) return res.status(404).json({ success: false, message: 'Idol not found' });

    const updateData = {};
    if (req.body.name !== undefined)           updateData.name = req.body.name;
    if (req.body.deity !== undefined)          updateData.deity = req.body.deity;
    if (req.body.price !== undefined)          updateData.price = parseFloat(req.body.price);
    if (req.body.original_price !== undefined) updateData.original_price = req.body.original_price ? parseFloat(req.body.original_price) : null;
    if (req.body.material !== undefined)       updateData.material = req.body.material;
    if (req.body.height !== undefined)         updateData.height = req.body.height;
    if (req.body.weight !== undefined)         updateData.weight = req.body.weight;
    if (req.body.description !== undefined)    updateData.description = req.body.description;
    if (req.body.in_stock !== undefined)       updateData.in_stock = parseBool(req.body.in_stock);
    if (req.body.is_featured !== undefined)    updateData.is_featured = parseBool(req.body.is_featured);
    if (req.body.stock_quantity !== undefined) updateData.stock_quantity = parseInt(req.body.stock_quantity);
    if (req.body.features !== undefined)       updateData.features = parseFormArray(req.body.features);

    if (req.file) {
      deleteOldImage(idol.image_url);
      updateData.image_url = getImageUrl(req);
    } else if (req.body.image_url !== undefined) {
      updateData.image_url = req.body.image_url || null;
    }

    await idol.update(updateData);

    if (req.body.location_ids !== undefined) {
      const location_ids = parseFormArray(req.body.location_ids).map(Number).filter(Boolean);
      await IdolLocation.destroy({ where: { idol_id: idol.id } });
      if (location_ids.length > 0) {
        await IdolLocation.bulkCreate(location_ids.map(lid => ({ idol_id: idol.id, location_id: lid })), { ignoreDuplicates: true });
      }
    }

    const updated = await Idol.findByPk(idol.id, {
      include: [{ model: Location, as: 'locations', attributes: ['id', 'name'], through: { attributes: [] } }]
    });
    res.json({ success: true, message: 'Idol updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Delete Idol
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    const idol = await Idol.findByPk(req.params.id);
    if (!idol) return res.status(404).json({ success: false, message: 'Idol not found' });
    deleteOldImage(idol.image_url);
    await IdolLocation.destroy({ where: { idol_id: idol.id } });
    await idol.destroy();
    res.json({ success: true, message: 'Idol deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
