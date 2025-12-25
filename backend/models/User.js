const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    subdomain: {
        type: String,
        required: [true, 'Subdomain is required'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'Subdomain must be at least 3 characters'],
        maxlength: [30, 'Subdomain cannot exceed 30 characters'],
        match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspendedAt: {
        type: Date,
        default: null
    },
    suspendReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Static method to check if subdomain is available
userSchema.statics.isSubdomainAvailable = async function (subdomain) {
    const user = await this.findOne({ subdomain: subdomain.toLowerCase() });
    return !user;
};

// Reserved subdomains that cannot be used
userSchema.statics.RESERVED_SUBDOMAINS = [
    'www', 'api', 'admin', 'app', 'dashboard', 'mail', 'email',
    'ftp', 'cdn', 'static', 'assets', 'img', 'images', 'css', 'js',
    'login', 'register', 'signup', 'signin', 'auth', 'oauth',
    'help', 'support', 'docs', 'blog', 'news', 'about', 'contact',
    'terms', 'privacy', 'legal', 'status', 'health'
];

userSchema.statics.isReservedSubdomain = function (subdomain) {
    return this.RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
};

const User = mongoose.model('User', userSchema);

module.exports = User;
