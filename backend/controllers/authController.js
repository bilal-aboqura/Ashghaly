const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, subdomain } = req.body;

        // Validate required fields
        if (!name || !email || !password || !subdomain) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, password, and subdomain.'
            });
        }

        // Check if subdomain is reserved
        if (User.isReservedSubdomain(subdomain)) {
            return res.status(400).json({
                success: false,
                message: 'This subdomain is reserved. Please choose another.'
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Check if subdomain is available
        const subdomainAvailable = await User.isSubdomainAvailable(subdomain);
        if (!subdomainAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain already taken. Please choose another.'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            subdomain: subdomain.toLowerCase()
        });

        // Create empty portfolio
        await Portfolio.create({
            userId: user._id,
            bio: '',
            skills: [],
            socialLinks: {},
            templateId: 'minimal'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    subdomain: user.subdomain,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        // Find user with password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check if suspended
        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended.',
                reason: user.suspendReason
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    subdomain: user.subdomain,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    subdomain: user.subdomain,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data.'
        });
    }
};

/**
 * Check subdomain availability
 * GET /api/auth/check-subdomain/:subdomain
 */
exports.checkSubdomain = async (req, res) => {
    try {
        const { subdomain } = req.params;

        if (!subdomain || subdomain.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain must be at least 3 characters.',
                available: false
            });
        }

        // Check if reserved
        if (User.isReservedSubdomain(subdomain)) {
            return res.json({
                success: true,
                available: false,
                message: 'This subdomain is reserved.'
            });
        }

        // Check availability
        const available = await User.isSubdomainAvailable(subdomain);

        res.json({
            success: true,
            available,
            message: available ? 'Subdomain is available.' : 'Subdomain is already taken.'
        });
    } catch (error) {
        console.error('Check subdomain error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check subdomain.'
        });
    }
};
