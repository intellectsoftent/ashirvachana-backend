const express = require('express');
const router = express.Router();
const { BlogPost } = require('../models');
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
  if (value === 'true' || value === true || value === '1') return true;
  if (value === 'false' || value === false || value === '0') return false;
  return null;
};

// PUBLIC: Get All Blogs
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = { is_published: true };
    if (category) where.category = category;
    if (search) where.title = { [Op.like]: `%${search}%` };
    const posts = await BlogPost.findAll({ where, order: [['date', 'DESC']] });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC: Get Single Blog
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });
    await post.increment('view_count');
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Get All Blogs
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const posts = await BlogPost.findAll({ order: [['date', 'DESC']] });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Create Blog - accepts multipart/form-data OR application/json
router.post('/admin/create', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const { title, category, author, date, read_time, excerpt, full_content } = req.body;
    if (!title || !author || !full_content) {
      return res.status(400).json({ success: false, message: 'Title, author and content are required' });
    }
    if (full_content.length < 500) {
      return res.status(400).json({ success: false, message: 'Content must be at least 500 characters' });
    }
    const tags      = parseFormArray(req.body.tags);
    const image_url = getImageUrl(req) || req.body.image_url || null;

    const post = await BlogPost.create({
      title, category, author,
      date: date || new Date(),
      read_time: read_time || '5 min read',
      image_url, excerpt, full_content, tags
    });
    res.status(201).json({ success: true, message: 'Blog post created', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Update Blog - accepts multipart/form-data OR application/json
router.put('/admin/:id', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const updateData = {};
    if (req.body.title !== undefined)       updateData.title = req.body.title;
    if (req.body.category !== undefined)    updateData.category = req.body.category;
    if (req.body.author !== undefined)      updateData.author = req.body.author;
    if (req.body.date !== undefined)        updateData.date = req.body.date;
    if (req.body.read_time !== undefined)   updateData.read_time = req.body.read_time;
    if (req.body.excerpt !== undefined)     updateData.excerpt = req.body.excerpt;
    if (req.body.full_content !== undefined) updateData.full_content = req.body.full_content;
    if (req.body.tags !== undefined)        updateData.tags = parseFormArray(req.body.tags);
    if (req.body.is_published !== undefined) updateData.is_published = parseBool(req.body.is_published);

    if (req.file) {
      deleteOldImage(post.image_url);
      updateData.image_url = getImageUrl(req);
    } else if (req.body.image_url !== undefined) {
      updateData.image_url = req.body.image_url || null;
    }

    await post.update(updateData);
    res.json({ success: true, message: 'Post updated', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Delete Blog
router.delete('/admin/:id', adminProtect, async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    deleteOldImage(post.image_url);
    await post.destroy();
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
