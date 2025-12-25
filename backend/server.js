require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const projectRoutes = require('./routes/project');
const adminRoutes = require('./routes/admin');

// Import middleware
const { subdomain } = require('./middleware/subdomain');

const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    }
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    }
});

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        const baseDomain = process.env.BASE_DOMAIN || 'mysite.com';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Allow frontend URL
        if (origin === frontendUrl) return callback(null, true);

        // Allow subdomains
        const subdomainPattern = new RegExp(`^https?://[a-z0-9-]+\\.${baseDomain.replace('.', '\\.')}(:\\d+)?$`);
        if (subdomainPattern.test(origin)) return callback(null, true);

        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Subdomain middleware
app.use(subdomain);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

// Public portfolio API (for subdomain access)
app.get('/api/public/portfolio', (req, res) => {
    if (!req.portfolioUser || !req.portfolio) {
        return res.status(404).json({
            success: false,
            message: 'Portfolio not found.'
        });
    }

    const Project = require('./models/Project');

    Project.find({ userId: req.portfolioUser._id, isVisible: true })
        .sort({ order: 1, createdAt: -1 })
        .then(projects => {
            res.json({
                success: true,
                data: {
                    portfolio: req.portfolio,
                    projects,
                    user: {
                        name: req.portfolioUser.name,
                        subdomain: req.portfolioUser.subdomain
                    }
                }
            });
        })
        .catch(error => {
            console.error('Public portfolio error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load portfolio.'
            });
        });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found.'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB for images and 50MB for videos.'
        });
    }

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS error: Origin not allowed.'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error.'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
🚀 Porty Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Running on port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API URL: http://localhost:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;
