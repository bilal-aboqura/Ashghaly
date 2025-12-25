const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const { deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Get all users
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, suspended } = req.query;

        const query = {};

        // Search by name, email, or subdomain
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subdomain: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (suspended !== undefined) query.isSuspended = suspended === 'true';

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Get project counts for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const projectCount = await Project.countDocuments({ userId: user._id });
            const portfolio = await Portfolio.findOne({ userId: user._id });

            return {
                ...user.toJSON(),
                projectCount,
                hasPortfolio: !!portfolio,
                templateId: portfolio?.templateId
            };
        }));

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users.'
        });
    }
};

/**
 * Get user details
 * GET /api/admin/user/:id
 */
exports.getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const portfolio = await Portfolio.findOne({ userId: id });
        const projects = await Project.find({ userId: id }).sort({ createdAt: -1 });

        // Calculate storage usage (estimate based on Cloudinary uploads)
        const storageUsage = projects.reduce((acc, project) => {
            if (project.cloudinaryPublicId) {
                // Estimate: images ~500KB, videos ~5MB average
                return acc + (project.mediaType === 'video_upload' ? 5 * 1024 * 1024 : 500 * 1024);
            }
            return acc;
        }, 0);

        res.json({
            success: true,
            data: {
                user,
                portfolio,
                projects,
                stats: {
                    projectCount: projects.length,
                    storageUsage,
                    storageUsageFormatted: formatBytes(storageUsage)
                }
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user details.'
        });
    }
};

/**
 * Suspend user
 * PUT /api/admin/user/:id/suspend
 */
exports.suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Prevent suspending admins
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot suspend admin users.'
            });
        }

        user.isSuspended = true;
        user.suspendedAt = new Date();
        user.suspendReason = reason || 'Violated terms of service';
        await user.save();

        res.json({
            success: true,
            message: 'User suspended successfully.',
            data: { user }
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to suspend user.'
        });
    }
};

/**
 * Unsuspend user
 * PUT /api/admin/user/:id/unsuspend
 */
exports.unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        user.isSuspended = false;
        user.suspendedAt = null;
        user.suspendReason = null;
        await user.save();

        res.json({
            success: true,
            message: 'User unsuspended successfully.',
            data: { user }
        });
    } catch (error) {
        console.error('Unsuspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsuspend user.'
        });
    }
};

/**
 * Delete user
 * DELETE /api/admin/user/:id
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Prevent deleting admins
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users.'
            });
        }

        // Delete all projects and their Cloudinary assets
        const projects = await Project.find({ userId: id });
        for (const project of projects) {
            if (project.cloudinaryPublicId) {
                const resourceType = project.mediaType === 'video_upload' ? 'video' : 'image';
                try {
                    await deleteFromCloudinary(project.cloudinaryPublicId, resourceType);
                } catch (err) {
                    console.error('Failed to delete Cloudinary asset:', err);
                }
            }
        }

        // Delete projects
        await Project.deleteMany({ userId: id });

        // Delete portfolio
        await Portfolio.deleteOne({ userId: id });

        // Delete user
        await user.deleteOne();

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully.'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user.'
        });
    }
};

/**
 * Change user's template
 * PUT /api/admin/user/:id/template
 */
exports.changeUserTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { templateId } = req.body;

        if (!templateId || !['minimal', 'creative', 'professional'].includes(templateId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid template ID.'
            });
        }

        const portfolio = await Portfolio.findOne({ userId: id });
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found.'
            });
        }

        portfolio.templateId = templateId;
        await portfolio.save();

        res.json({
            success: true,
            message: 'Template changed successfully.',
            data: { portfolio }
        });
    } catch (error) {
        console.error('Change template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change template.'
        });
    }
};

/**
 * Get platform statistics
 * GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isSuspended: false });
        const suspendedUsers = await User.countDocuments({ isSuspended: true });
        const totalProjects = await Project.countDocuments();
        const totalPortfolios = await Portfolio.countDocuments({ isPublished: true });

        // Users by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const usersByMonth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                totalProjects,
                totalPortfolios,
                usersByMonth
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics.'
        });
    }
};

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
