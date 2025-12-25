const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// All routes require authentication and admin role
router.use(auth, admin);

// Statistics
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/user/:id', adminController.getUserDetails);
router.put('/user/:id/suspend', adminController.suspendUser);
router.put('/user/:id/unsuspend', adminController.unsuspendUser);
router.put('/user/:id/template', adminController.changeUserTemplate);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;
