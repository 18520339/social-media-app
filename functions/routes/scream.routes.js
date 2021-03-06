const express = require('express');
const router = express.Router();

const { getScreams, createScream } = require('../services/scream.service');
const { authenticate } = require('../middlewares/auth');

router.get('/screams', getScreams);
router.post('/scream', authenticate, createScream);
module.exports = router;
