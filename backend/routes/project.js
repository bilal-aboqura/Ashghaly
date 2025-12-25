const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth } = require('../middleware/auth');
const rejectBase64 = require('../middleware/rejectBase64');
const { uploadImage, uploadVideo } = require('../utils/cloudinary');

// All routes require authentication
router.use(auth);

// Upload routes (multipart/form-data only)
router.post('/upload/image', uploadImage.single('file'), projectController.uploadProject);
router.post('/upload/video', uploadVideo.single('file'), projectController.uploadProject);

// External video route
router.post('/external', rejectBase64, projectController.addExternalVideo);

// CRUD routes
router.get('/me', projectController.getMyProjects);
router.put('/reorder', rejectBase64, projectController.reorderProjects);
router.put('/:id', rejectBase64, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
