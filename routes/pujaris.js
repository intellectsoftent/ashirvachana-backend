const express = require('express');
const router = express.Router();
const { Pujari, Location } = require('../models');
const { adminProtect } = require('../middleware/auth');
const { upload, getImageUrl, deleteOldImage } = require('../middleware/upload');

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
  if (value === 'true' || value === true || value === '1') return true;
  if (value === 'false' || value === false || value === '0') return false;
  return null;
};

const enrichWithLocations = async (pujaris) => {
  const allLocations = await Location.findAll({ attributes: ['id', 'name'] });
  const locationMap = {};
  allLocations.forEach(l => { locationMap[l.id] = l.name; });
  return pujaris.map(p => {
    const pData = p.toJSON ? p.toJSON() : p;
    pData.service_locations = (pData.service_location_ids || []).map(id => ({
      id, name: locationMap[id] || 'Unknown'
    }));
    return pData;
  });
};

// PUBLIC: Get All Available Pujaris
router.get('/', async (req, res) => {
  try {
    const { location_id, specialization } = req.query;
    let pujaris = await Pujari.findAll({ where: { is_available: true }, order: [['rating', 'DESC']] });
    if (location_id) {
      pujaris = pujaris.filter(p => Array.isArray(p.service_location_ids) && p.service_location_ids.map(Number).includes(parseInt(location_id)));
    }
    if (specialization) {
      pujaris = pujaris.filter(p => Array.isArray(p.specializations) && p.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase())));
    }
    const enriched = await enrichWithLocations(pujaris);
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC: Get Single Pujari
router.get('/:id', async (req, res) => {
  try {
    const pujari = await Pujari.findByPk(req.params.id);
    if (!pujari) return res.status(404).json({ success: false, message: 'Pujari not found' });
    const [enriched] = await enrichWithLocations([pujari]);
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC: Get Pujaris by Location
router.get('/available/:locationId', async (req, res) => {
  try {
    const locationId = parseInt(req.params.locationId);
    const location = await Location.findByPk(locationId);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    const allPujaris = await Pujari.findAll({ where: { is_available: true } });
    const available = allPujaris.filter(p => Array.isArray(p.service_location_ids) && p.service_location_ids.map(Number).includes(locationId));
    const enriched = await enrichWithLocations(available);
    res.json({ success: true, location: location.name, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Get All Pujaris
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const pujaris = await Pujari.findAll({ order: [['createdAt', 'DESC']] });
    const enriched = await enrichWithLocations(pujaris);
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Create Pujari - accepts multipart/form-data OR application/json
router.post('/admin/create', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const { full_name, phone, experience, rating, bio } = req.body;
    if (!full_name) return res.status(400).json({ success: false, message: 'Full name is required' });

    const specializations      = parseFormArray(req.body.specializations);
    const service_location_ids = parseFormArray(req.body.service_location_ids).map(Number).filter(Boolean);
    const is_available         = parseBool(req.body.is_available) ?? true;
    const profile_image        = getImageUrl(req) || req.body.profile_image || null;

    if (service_location_ids.length > 0) {
      const found = await Location.findAll({ where: { id: service_location_ids } });
      if (found.length !== service_location_ids.length) {
        return res.status(400).json({ success: false, message: 'One or more location IDs are invalid' });
      }
    }

    const pujari = await Pujari.create({
      full_name, phone, experience,
      rating: rating ? parseFloat(rating) : 5.0,
      specializations, service_location_ids, is_available, profile_image, bio
    });

    const [enriched] = await enrichWithLocations([pujari]);
    res.status(201).json({ success: true, message: 'Pujari added successfully', data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Update Pujari - accepts multipart/form-data OR application/json
router.put('/admin/:id', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const pujari = await Pujari.findByPk(req.params.id);
    if (!pujari) return res.status(404).json({ success: false, message: 'Pujari not found' });

    const updateData = {};
    if (req.body.full_name !== undefined)   updateData.full_name = req.body.full_name;
    if (req.body.phone !== undefined)       updateData.phone = req.body.phone;
    if (req.body.experience !== undefined)  updateData.experience = req.body.experience;
    if (req.body.rating !== undefined)      updateData.rating = parseFloat(req.body.rating);
    if (req.body.bio !== undefined)         updateData.bio = req.body.bio;
    if (req.body.is_available !== undefined) updateData.is_available = parseBool(req.body.is_available);
    if (req.body.specializations !== undefined) updateData.specializations = parseFormArray(req.body.specializations);

    if (req.body.service_location_ids !== undefined) {
      const ids = parseFormArray(req.body.service_location_ids).map(Number).filter(Boolean);
      if (ids.length > 0) {
        const found = await Location.findAll({ where: { id: ids } });
        if (found.length !== ids.length) return res.status(400).json({ success: false, message: 'One or more location IDs are invalid' });
      }
      updateData.service_location_ids = ids;
    }

    if (req.file) {
      deleteOldImage(pujari.profile_image);
      updateData.profile_image = getImageUrl(req);
    } else if (req.body.profile_image !== undefined) {
      updateData.profile_image = req.body.profile_image || null;
    }

    await pujari.update(updateData);
    const [enriched] = await enrichWithLocations([pujari]);
    res.json({ success: true, message: 'Pujari updated', data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Delete Pujari
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    const pujari = await Pujari.findByPk(req.params.id);
    if (!pujari) return res.status(404).json({ success: false, message: 'Pujari not found' });
    deleteOldImage(pujari.profile_image);
    await pujari.destroy();
    res.json({ success: true, message: 'Pujari deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Toggle Availability
router.patch('/admin/:id/toggle-availability', adminProtect, async (req, res) => {
  try {
    const pujari = await Pujari.findByPk(req.params.id);
    if (!pujari) return res.status(404).json({ success: false, message: 'Pujari not found' });
    await pujari.update({ is_available: !pujari.is_available });
    res.json({ success: true, message: `Pujari is now ${pujari.is_available ? 'Available' : 'Unavailable'}`, is_available: pujari.is_available });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Update Service Locations Only
router.patch('/admin/:id/locations', adminProtect, async (req, res) => {
  try {
    const { service_location_ids } = req.body;
    const pujari = await Pujari.findByPk(req.params.id);
    if (!pujari) return res.status(404).json({ success: false, message: 'Pujari not found' });
    const ids = parseFormArray(service_location_ids).map(Number).filter(Boolean);
    if (ids.length > 0) {
      const found = await Location.findAll({ where: { id: ids } });
      if (found.length !== ids.length) return res.status(400).json({ success: false, message: 'One or more location IDs are invalid' });
    }
    await pujari.update({ service_location_ids: ids });
    res.json({ success: true, message: 'Pujari locations updated', data: pujari });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
