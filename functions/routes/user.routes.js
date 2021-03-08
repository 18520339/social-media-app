const express = require('express');
const router = express.Router();

const {
    signUp,
    login,
    getMe,
    getUserByHandle,
    addUserInfos,
    uploadAvatar,
} = require('../services/user.service');
const { validateSignUp, validateLogin } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

router.get('/user/me', authenticate, getMe);
router.get('/user/:handle', getUserByHandle);
router.post('/user', authenticate, addUserInfos);
router.post('/user/avatar', authenticate, uploadAvatar);

router.post('/user/signup', validateSignUp, signUp);
router.post('/user/login', validateLogin, login);
module.exports = router;
