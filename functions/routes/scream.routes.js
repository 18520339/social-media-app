const express = require('express');
const router = express.Router();

const {
    getScreams,
    getScreamById,
    createScream,
    deleteScream,
    likeScream,
    unlikeScream,
    commentScream,
} = require('../services/scream.service');
const { authenticate } = require('../middlewares/auth');

router.get('/screams', getScreams);
router.get('/scream/:screamId', getScreamById);

router.post('/scream', authenticate, createScream);
router.delete('/scream/:screamId', authenticate, deleteScream);

router.post('/scream/:screamId/like', authenticate, likeScream);
router.post('/scream/:screamId/unlike', authenticate, unlikeScream);
router.post('/scream/:screamId/comment', authenticate, commentScream);

module.exports = router;
