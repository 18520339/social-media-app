const express = require('express');
const router = express.Router();

const {
    getScreams,
    getScreamById,
    createScream,
    commentOnScream,
} = require('../services/scream.service');
const { authenticate } = require('../middlewares/auth');

router.get('/screams', getScreams);
router.get('/scream/:screamId', getScreamById);
router.post('/scream', authenticate, createScream);
router.post('/scream/:screamId/comment', authenticate, commentOnScream);
module.exports = router;
