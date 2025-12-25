const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        default: ''
    },
    mediaType: {
        type: String,
        enum: ['image', 'video_upload', 'video_external'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: [true, 'Media URL is required']
    },
    externalPlatform: {
        type: String,
        enum: ['youtube', 'vimeo', 'gdrive', null],
        default: null
    },
    externalVideoId: {
        type: String,
        default: null
    },
    thumbnailUrl: {
        type: String,
        default: null
    },
    cloudinaryPublicId: {
        type: String,
        default: null // For deletion from Cloudinary
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Each tag cannot exceed 30 characters']
    }],
    projectUrl: {
        type: String,
        default: '' // Link to live project
    },
    githubUrl: {
        type: String,
        default: '' // Link to GitHub repo
    },
    order: {
        type: Number,
        default: 0 // For custom ordering
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
projectSchema.index({ userId: 1, order: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });

// Static method to get next order number
projectSchema.statics.getNextOrder = async function (userId) {
    const lastProject = await this.findOne({ userId }).sort({ order: -1 });
    return lastProject ? lastProject.order + 1 : 0;
};

// Pre-save: set order if not specified
projectSchema.pre('save', async function (next) {
    if (this.isNew && this.order === 0) {
        this.order = await this.constructor.getNextOrder(this.userId);
    }
    next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
