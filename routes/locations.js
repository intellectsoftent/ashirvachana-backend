const express = require('express');
const router = express.Router();
const { Location, Pooja, Idol, PoojaLocation, IdolLocation } = require('../models');
const { adminProtect } = require('../middleware/auth');
const { Op } = require('sequelize');

// ─── PUBLIC ROUTES ─────────────────────────────────────────────────────────────

// GET /api/locations - All active locations (for dropdowns on frontend)
router.get('/', async (req, res) => {
  try {
    const locations = await Location.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/locations/:id/poojas - Get poojas available at a specific location
router.get('/:id/poojas', async (req, res) => {
  try {
    const location = await Location.findOne({
      where: { id: req.params.id, is_active: true }
    });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const poojas = await Pooja.findAll({
      include: [{
        model: Location,
        as: 'locations',
        where: { id: req.params.id },
        attributes: []
      }],
      where: { is_active: true }
    });

    res.json({ success: true, location: location.name, count: poojas.length, data: poojas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/locations/:id/idols - Get idols available at a specific location
router.get('/:id/idols', async (req, res) => {
  try {
    const location = await Location.findOne({
      where: { id: req.params.id, is_active: true }
    });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const idols = await Idol.findAll({
      include: [{
        model: Location,
        as: 'locations',
        where: { id: req.params.id },
        attributes: []
      }]
    });

    res.json({ success: true, location: location.name, count: idols.length, data: idols });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/locations/check/pooja/:poojaId?locationId=X
// Check if a specific pooja is available at given location
router.get('/check/pooja/:poojaId', async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId) {
      return res.status(400).json({ success: false, message: 'locationId query param required' });
    }

    const entry = await PoojaLocation.findOne({
      where: { pooja_id: req.params.poojaId, location_id: locationId }
    });

    const pooja = await Pooja.findByPk(req.params.poojaId, {
      attributes: ['id', 'title', 'image_url', 'price']
    });
    if (!pooja) return res.status(404).json({ success: false, message: 'Pooja not found' });

    res.json({
      success: true,
      available: !!entry,
      message: entry ? 'Available at your location' : 'Not available at your location',
      data: pooja
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/locations/check/idol/:idolId?locationId=X
router.get('/check/idol/:idolId', async (req, res) => {
  try {
    const { locationId } = req.query;
    if (!locationId) {
      return res.status(400).json({ success: false, message: 'locationId query param required' });
    }

    const entry = await IdolLocation.findOne({
      where: { idol_id: req.params.idolId, location_id: locationId }
    });

    const idol = await Idol.findByPk(req.params.idolId, {
      attributes: ['id', 'name', 'image_url', 'price']
    });
    if (!idol) return res.status(404).json({ success: false, message: 'Idol not found' });

    res.json({
      success: true,
      available: !!entry,
      message: entry ? 'Available at your location' : 'Not available at your location',
      data: idol
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// GET /api/locations/admin/all
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const locations = await Location.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/locations/admin/create
router.post('/admin/create', adminProtect, async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Location name is required' });

    const existing = await Location.findOne({ where: { name: { [Op.like]: name } } });
    if (existing) return res.status(409).json({ success: false, message: 'Location already exists' });

    const location = await Location.create({ name: name.trim(), state });
    res.status(201).json({ success: true, message: 'Location added', data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/locations/admin/:id
router.put('/admin/:id', adminProtect, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    await location.update(req.body);
    res.json({ success: true, message: 'Location updated', data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/locations/admin/:id
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    await location.destroy();
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Assign/Remove Poojas from a Location ──────────────────────────────────────

// POST /api/locations/admin/:id/assign-pooja
// Body: { pooja_id: 1 }  OR  { pooja_ids: [1,2,3] }
router.post('/admin/:id/assign-pooja', adminProtect, async (req, res) => {
  try {
    const { pooja_id, pooja_ids } = req.body;
    const ids = pooja_ids || (pooja_id ? [pooja_id] : []);
    if (!ids.length) return res.status(400).json({ success: false, message: 'pooja_id or pooja_ids required' });

    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    const records = ids.map(pid => ({ pooja_id: pid, location_id: parseInt(req.params.id) }));
    await PoojaLocation.bulkCreate(records, { ignoreDuplicates: true });

    res.json({ success: true, message: `${ids.length} pooja(s) assigned to ${location.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/locations/admin/:id/remove-pooja/:poojaId
router.delete('/admin/:id/remove-pooja/:poojaId', adminProtect, async (req, res) => {
  try {
    await PoojaLocation.destroy({
      where: { location_id: req.params.id, pooja_id: req.params.poojaId }
    });
    res.json({ success: true, message: 'Pooja removed from location' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/locations/admin/assign-all-poojas/:locationId
// Assign ALL poojas to this location at once
router.post('/admin/assign-all-poojas/:locationId', adminProtect, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.locationId);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    const allPoojas = await Pooja.findAll({ attributes: ['id'] });
    const records = allPoojas.map(p => ({ pooja_id: p.id, location_id: parseInt(req.params.locationId) }));
    await PoojaLocation.bulkCreate(records, { ignoreDuplicates: true });

    res.json({ success: true, message: `All ${allPoojas.length} poojas assigned to ${location.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Assign/Remove Idols from a Location ───────────────────────────────────────

// POST /api/locations/admin/:id/assign-idol
router.post('/admin/:id/assign-idol', adminProtect, async (req, res) => {
  try {
    const { idol_id, idol_ids } = req.body;
    const ids = idol_ids || (idol_id ? [idol_id] : []);
    if (!ids.length) return res.status(400).json({ success: false, message: 'idol_id or idol_ids required' });

    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    const records = ids.map(iid => ({ idol_id: iid, location_id: parseInt(req.params.id) }));
    await IdolLocation.bulkCreate(records, { ignoreDuplicates: true });

    res.json({ success: true, message: `${ids.length} idol(s) assigned to ${location.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/locations/admin/:id/remove-idol/:idolId
router.delete('/admin/:id/remove-idol/:idolId', adminProtect, async (req, res) => {
  try {
    await IdolLocation.destroy({
      where: { location_id: req.params.id, idol_id: req.params.idolId }
    });
    res.json({ success: true, message: 'Idol removed from location' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/locations/admin/:id/items - See what poojas+idols are assigned to a location
router.get('/admin/:id/items', adminProtect, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    const [poojas, idols] = await Promise.all([
      Pooja.findAll({
        include: [{ model: Location, as: 'locations', where: { id: req.params.id }, attributes: [] }]
      }),
      Idol.findAll({
        include: [{ model: Location, as: 'locations', where: { id: req.params.id }, attributes: [] }]
      })
    ]);

    res.json({ success: true, location: location.name, poojas, idols });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
