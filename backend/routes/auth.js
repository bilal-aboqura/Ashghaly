const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-subdomain/:subdomain', authController.checkSubdomain);

// Protected routes
router.get('/me', auth, authController.getMe);

module.exports = router;
