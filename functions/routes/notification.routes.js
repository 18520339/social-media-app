const express = require('express');
const router = express.Router();

const { markNotificationRead } = require('../services/notification.service');
const { authenticate } = require('../middlewares/auth');

/* If post a like or comment with the token of the user
that publishes the scream, no notification will be created */
router.post('/notifications', authenticate, markNotificationRead);
module.exports = router;
