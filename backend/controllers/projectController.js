const Project = require('../models/Project');
const { deleteFromCloudinary, getVideoThumbnail } = require('../utils/cloudinary');
const { getVideoData, isValidVideoUrl } = require('../utils/videoEmbed');

/**
 * Upload image project
 * POST /api/projects/upload
 */
exports.uploadProject = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an image or video.'
            });
        }

        const { title, description, tags, projectUrl, githubUrl } = req.body;

        // Determine media type from file
        const isVideo = req.file.mimetype.startsWith('video/');
        const mediaType = isVideo ? 'video_upload' : 'image';

        // Create project
        const project = await Project.create({
            userId: req.userId,
            title: title || 'Untitled Project',
            description: description || '',
            mediaType,
            mediaUrl: req.file.path, // Cloudinary URL
            cloudinaryPublicId: req.file.filename,
            thumbnailUrl: isVideo ? getVideoThumbnail(req.file.filename) : req.file.path,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            projectUrl: projectUrl || '',
            githubUrl: githubUrl || ''
        });

        res.status(201).json({
            success: true,
            message: 'Project uploaded successfully.',
            data: { project }
        });
    } catch (error) {
        console.error('Upload project error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload project.'
        });
    }
};

/**
 * Add external video project
 * POST /api/projects/external
 */
exports.addExternalVideo = async (req, res) => {
    try {
        const { title, description, videoUrl, tags, projectUrl, githubUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Video URL is required.'
            });
        }

        // Validate and parse video URL
        if (!isValidVideoUrl(videoUrl)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid video URL. Please use YouTube, Vimeo, or Google Drive links.'
            });
        }

        const videoData = getVideoData(videoUrl);

        // Create project
        const project = await Project.create({
            userId: req.userId,
            title: title || 'Untitled Video',
            description: description || '',
            mediaType: 'video_external',
            mediaUrl: videoData.embedUrl,
            externalPlatform: videoData.platform,
            externalVideoId: videoData.videoId,
            thumbnailUrl: videoData.thumbnailUrl,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            projectUrl: projectUrl || '',
            githubUrl: githubUrl || ''
        });

        res.status(201).json({
            success: true,
            message: 'Video added successfully.',
            data: { project }
        });
    } catch (error) {
        console.error('Add external video error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to add video.'
        });
    }
};

/**
 * Get user's projects
 * GET /api/projects/me
 */
exports.getMyProjects = async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        const query = { userId: req.userId };
        if (type) query.mediaType = type;

        const projects = await Project.find(query)
            .sort({ order: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Project.countDocuments(query);

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get my projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get projects.'
        });
    }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, projectUrl, githubUrl, isVisible, order } = req.body;

        const project = await Project.findOne({ _id: id, userId: req.userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found.'
            });
        }

        // Update fields
        if (title !== undefined) project.title = title;
        if (description !== undefined) project.description = description;
        if (tags !== undefined) project.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        if (projectUrl !== undefined) project.projectUrl = projectUrl;
        if (githubUrl !== undefined) project.githubUrl = githubUrl;
        if (isVisible !== undefined) project.isVisible = isVisible;
        if (order !== undefined) project.order = order;

        await project.save();

        res.json({
            success: true,
            message: 'Project updated successfully.',
            data: { project }
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project.'
        });
    }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findOne({ _id: id, userId: req.userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found.'
            });
        }

        // Delete from Cloudinary if uploaded
        if (project.cloudinaryPublicId) {
            const resourceType = project.mediaType === 'video_upload' ? 'video' : 'image';
            await deleteFromCloudinary(project.cloudinaryPublicId, resourceType);
        }

        await project.deleteOne();

        res.json({
            success: true,
            message: 'Project deleted successfully.'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project.'
        });
    }
};

/**
 * Reorder projects
 * PUT /api/projects/reorder
 */
exports.reorderProjects = async (req, res) => {
    try {
        const { projectIds } = req.body;

        if (!Array.isArray(projectIds)) {
            return res.status(400).json({
                success: false,
                message: 'projectIds must be an array.'
            });
        }

        // Update order for each project
        const updates = projectIds.map((id, index) =>
            Project.updateOne(
                { _id: id, userId: req.userId },
                { order: index }
            )
        );

        await Promise.all(updates);

        res.json({
            success: true,
            message: 'Projects reordered successfully.'
        });
    } catch (error) {
        console.error('Reorder projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder projects.'
        });
    }
};
