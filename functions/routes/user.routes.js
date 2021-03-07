const express = require('express');
const router = express.Router();

const {
    signUp,
    login,
    getUser,
    uploadAvatar,
    addUserInfos,
} = require('../services/user.service');
const { validateSignUp, validateLogin } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

router.get('/user', authenticate, getUser);
router.post('/user', authenticate, addUserInfos);
router.post('/user/avatar', authenticate, uploadAvatar);

router.post('/user/signup', validateSignUp, signUp);
router.post('/user/login', validateLogin, login);
module.exports = router;
