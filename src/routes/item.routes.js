const express = require('express');
const router = express.Router();
const { getAllItems, searchItems } = require('../controllers/item.controller');


// GET /api/items?page=1&limit=10
router.get('/', getAllItems);

// GET /api/items/search?title=nasa&category=earth&pubDate=2026-02-20
router.get('/search', searchItems);

module.exports = router;