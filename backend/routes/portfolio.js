const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { auth } = require('../middleware/auth');
const rejectBase64 = require('../middleware/rejectBase64');

// Public route - get portfolio by subdomain
router.get('/:subdomain', portfolioController.getPublicPortfolio);

// Protected routes
router.post('/', auth, rejectBase64, portfolioController.createPortfolio);
router.get('/me', auth, portfolioController.getMyPortfolio);
router.put('/me', auth, rejectBase64, portfolioController.updatePortfolio);

module.exports = router;
