// routes/liveDrivers.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/liveDriverController');

router.post('/', controller.saveOrUpdate);
router.delete('/:id', controller.remove);
router.get('/', controller.getAll);

module.exports = router;
