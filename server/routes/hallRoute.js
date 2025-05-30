const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hall.controller');
const { protect, restrictTo } = require('../middlewares/authMiddleware');


router.post('/create', protect, restrictTo('admin'), hallController.createHall);

module.exports = router