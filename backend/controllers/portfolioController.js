const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Create or update portfolio
 * POST /api/portfolio
 */
exports.createPortfolio = async (req, res) => {
    try {
        const { bio, headline, skills, socialLinks, templateId, customization, seo } = req.body;

        // Check if portfolio exists
        let portfolio = await Portfolio.findOne({ userId: req.userId });

        if (portfolio) {
            // Update existing
            if (bio !== undefined) portfolio.bio = bio;
            if (headline !== undefined) portfolio.headline = headline;
            if (skills !== undefined) portfolio.skills = skills;
            if (socialLinks !== undefined) portfolio.socialLinks = { ...portfolio.socialLinks, ...socialLinks };
            if (templateId !== undefined) portfolio.templateId = templateId;
            if (customization !== undefined) portfolio.customization = { ...portfolio.customization, ...customization };
            if (seo !== undefined) portfolio.seo = { ...portfolio.seo, ...seo };

            await portfolio.save();
        } else {
            // Create new
            portfolio = await Portfolio.create({
                userId: req.userId,
                bio: bio || '',
                headline: headline || '',
                skills: skills || [],
                socialLinks: socialLinks || {},
                templateId: templateId || 'minimal',
                customization: customization || {},
                seo: seo || {}
            });
        }

        res.status(201).json({
            success: true,
            message: 'Portfolio saved successfully.',
            data: { portfolio }
        });
    } catch (error) {
        console.error('Create portfolio error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to save portfolio.'
        });
    }
};

/**
 * Get current user's portfolio
 * GET /api/portfolio/me
 */
exports.getMyPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.userId });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found. Please create one.'
            });
        }

        // Get projects
        const projects = await Project.find({ userId: req.userId, isVisible: true })
            .sort({ order: 1, createdAt: -1 });

        // Get user info
        const user = await User.findById(req.userId);

        res.json({
            success: true,
            data: {
                portfolio,
                projects,
                user: {
                    name: user.name,
                    subdomain: user.subdomain
                }
            }
        });
    } catch (error) {
        console.error('Get my portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolio.'
        });
    }
};

/**
 * Update portfolio
 * PUT /api/portfolio/me
 */
exports.updatePortfolio = async (req, res) => {
    try {
        const { bio, headline, skills, socialLinks, templateId, customization, seo, isPublished } = req.body;

        const portfolio = await Portfolio.findOne({ userId: req.userId });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found.'
            });
        }

        // Update fields
        if (bio !== undefined) portfolio.bio = bio;
        if (headline !== undefined) portfolio.headline = headline;
        if (skills !== undefined) portfolio.skills = skills;
        if (socialLinks !== undefined) portfolio.socialLinks = { ...portfolio.socialLinks, ...socialLinks };
        if (templateId !== undefined) portfolio.templateId = templateId;
        if (customization !== undefined) portfolio.customization = { ...portfolio.customization, ...customization };
        if (seo !== undefined) portfolio.seo = { ...portfolio.seo, ...seo };
        if (isPublished !== undefined) portfolio.isPublished = isPublished;

        await portfolio.save();

        res.json({
            success: true,
            message: 'Portfolio updated successfully.',
            data: { portfolio }
        });
    } catch (error) {
        console.error('Update portfolio error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update portfolio.'
        });
    }
};

/**
 * Get public portfolio by subdomain
 * GET /api/portfolio/:subdomain
 */
exports.getPublicPortfolio = async (req, res) => {
    try {
        const { subdomain } = req.params;

        // Find user
        const user = await User.findOne({
            subdomain: subdomain.toLowerCase(),
            isSuspended: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found.'
            });
        }

        // Get portfolio
        const portfolio = await Portfolio.findOne({ userId: user._id });

        if (!portfolio || !portfolio.isPublished) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found or not published.'
            });
        }

        // Get projects
        const projects = await Project.find({ userId: user._id, isVisible: true })
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: {
                portfolio,
                projects,
                user: {
                    name: user.name,
                    subdomain: user.subdomain
                }
            }
        });
    } catch (error) {
        console.error('Get public portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolio.'
        });
    }
};
