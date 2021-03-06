const express = require('express');
const router = express.Router();

const { signUp, login, uploadAvatar } = require('../services/user.service');
const { validateSignUp, validateLogin } = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');

router.post('/user', validateSignUp, signUp);
router.post('/user/login', validateLogin, login);
router.post('/user/avatar', authenticate, uploadAvatar);
module.exports = router;
