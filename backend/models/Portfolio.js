const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One portfolio per user
    },
    bio: {
        type: String,
        maxlength: [2000, 'Bio cannot exceed 2000 characters'],
        default: ''
    },
    headline: {
        type: String,
        maxlength: [200, 'Headline cannot exceed 200 characters'],
        default: ''
    },
    skills: [{
        type: String,
        trim: true,
        maxlength: [50, 'Each skill cannot exceed 50 characters']
    }],
    socialLinks: {
        website: { type: String, default: '' },
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        dribbble: { type: String, default: '' },
        behance: { type: String, default: '' }
    },
    templateId: {
        type: String,
        enum: ['minimal', 'creative', 'professional'],
        default: 'minimal'
    },
    customization: {
        primaryColor: { type: String, default: '#3B82F6' },
        secondaryColor: { type: String, default: '#1E40AF' },
        fontFamily: { type: String, default: 'Inter' },
        showContactForm: { type: Boolean, default: true }
    },
    seo: {
        title: { type: String, maxlength: 60, default: '' },
        description: { type: String, maxlength: 160, default: '' },
        keywords: [{ type: String }]
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster lookups
portfolioSchema.index({ userId: 1 });

// Virtual populate for projects
portfolioSchema.virtual('projects', {
    ref: 'Project',
    localField: 'userId',
    foreignField: 'userId'
});

// Enable virtuals in JSON
portfolioSchema.set('toObject', { virtuals: true });
portfolioSchema.set('toJSON', { virtuals: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
