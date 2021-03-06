const express = require('express');
const router = express.Router();

const { createUser, login, uploadImage } = require('../services/user.service');
const {
    validateCreateUser,
    validateLogin,
} = require('../middlewares/validation');

router.post('/user', validateCreateUser, createUser);
router.post('/user/login', validateLogin, login);
router.post('/user/image', uploadImage);
module.exports = router;
