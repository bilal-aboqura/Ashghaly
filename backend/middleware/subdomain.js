const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

/**
 * Subdomain middleware
 * Detects subdomain from host header and loads portfolio data
 */
const subdomain = async (req, res, next) => {
    try {
        const host = req.headers.host || '';
        const baseDomain = process.env.BASE_DOMAIN || 'mysite.com';

        // Extract subdomain from host
        // host could be: "username.mysite.com" or "username.mysite.com:3000"
        const hostWithoutPort = host.split(':')[0];

        // Remove base domain to get subdomain
        // e.g., "john.mysite.com" -> "john"
        let subdomain = null;

        if (hostWithoutPort.endsWith(`.${baseDomain}`)) {
            subdomain = hostWithoutPort.replace(`.${baseDomain}`, '');
        } else if (hostWithoutPort.includes('.localhost')) {
            // Development: username.localhost -> username
            subdomain = hostWithoutPort.split('.')[0];
        }

        // Skip if no subdomain or reserved subdomain
        if (!subdomain || subdomain === 'www' || subdomain === 'api') {
            req.subdomain = null;
            return next();
        }

        // Find user by subdomain
        const user = await User.findOne({
            subdomain: subdomain.toLowerCase(),
            isSuspended: false
        });

        if (!user) {
            req.subdomain = subdomain;
            req.portfolioUser = null;
            req.portfolio = null;
            return next();
        }

        // Load portfolio
        const portfolio = await Portfolio.findOne({ userId: user._id });

        // Attach to request
        req.subdomain = subdomain;
        req.portfolioUser = user;
        req.portfolio = portfolio;

        next();
    } catch (error) {
        console.error('Subdomain middleware error:', error);
        next(error);
    }
};

/**
 * Require subdomain middleware
 * Returns 404 if no valid portfolio found
 */
const requireSubdomain = (req, res, next) => {
    if (!req.portfolioUser) {
        return res.status(404).json({
            success: false,
            message: 'Portfolio not found.'
        });
    }

    if (!req.portfolio || !req.portfolio.isPublished) {
        return res.status(404).json({
            success: false,
            message: 'This portfolio is not published.'
        });
    }

    next();
};

module.exports = { subdomain, requireSubdomain };
