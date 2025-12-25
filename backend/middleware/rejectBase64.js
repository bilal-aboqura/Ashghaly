/**
 * Base64 Rejection Middleware
 * Rejects any request containing Base64 image data
 * Enforces multipart/form-data only uploads
 */
const rejectBase64 = (req, res, next) => {
    // Skip if no body
    if (!req.body) {
        return next();
    }

    // Convert body to string for checking
    const bodyString = JSON.stringify(req.body);

    // Patterns to detect Base64 images
    const base64Patterns = [
        /data:image\/[a-zA-Z]+;base64,/i,
        /data:video\/[a-zA-Z]+;base64,/i,
        /data:application\/[a-zA-Z]+;base64,/i,
        // Long base64 strings (images typically have 1000+ chars)
        /^[A-Za-z0-9+/]{1000,}={0,2}$/
    ];

    for (const pattern of base64Patterns) {
        if (pattern.test(bodyString)) {
            return res.status(400).json({
                success: false,
                message: 'Base64 encoded data is not allowed. Please use multipart/form-data for file uploads.',
                code: 'BASE64_REJECTED'
            });
        }
    }

    // Check individual fields for data URLs
    const checkField = (value, path = '') => {
        if (typeof value === 'string') {
            if (value.startsWith('data:image/') ||
                value.startsWith('data:video/') ||
                value.startsWith('data:application/')) {
                return true;
            }
        } else if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                if (checkField(value[i], `${path}[${i}]`)) {
                    return true;
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                if (checkField(value[key], `${path}.${key}`)) {
                    return true;
                }
            }
        }
        return false;
    };

    if (checkField(req.body)) {
        return res.status(400).json({
            success: false,
            message: 'Base64 encoded data is not allowed. Please use multipart/form-data for file uploads.',
            code: 'BASE64_REJECTED'
        });
    }

    next();
};

module.exports = rejectBase64;
