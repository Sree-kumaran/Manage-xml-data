const express = require('express');
const router = express.Router();
const { getAllItems } = require('../controllers/item.controller');

// GET /api/items?page=1&limit=10
router.get('/', getAllItems);

module.exports = router;