const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'porty/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
        resource_type: 'image'
    }
});

// Cloudinary storage for videos (max 50MB)
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'porty/videos',
        allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
        resource_type: 'video'
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, WebM, MOV, and AVI videos are allowed.'), false);
    }
};

// Multer upload middleware for images (max 10MB)
const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Multer upload middleware for videos (max 50MB)
const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

// Get optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
        ...options
    });
};

// Generate thumbnail for video
const getVideoThumbnail = (publicId) => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
            { width: 480, height: 270, crop: 'fill' },
            { start_offset: '0' }
        ]
    });
};

module.exports = {
    cloudinary,
    uploadImage,
    uploadVideo,
    deleteFromCloudinary,
    getOptimizedUrl,
    getVideoThumbnail
};
