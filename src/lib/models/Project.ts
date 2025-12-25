import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    mediaType: 'image' | 'video_upload' | 'video_external';
    mediaUrl: string;
    thumbnailUrl: string;
    cloudinaryPublicId?: string;
    externalPlatform?: 'youtube' | 'vimeo' | 'gdrive';
    externalVideoId?: string;
    tags: string[];
    projectUrl?: string;
    githubUrl?: string;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        default: '',
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    mediaType: {
        type: String,
        required: true,
        enum: ['image', 'video_upload', 'video_external']
    },
    mediaUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    cloudinaryPublicId: String,
    externalPlatform: {
        type: String,
        enum: ['youtube', 'vimeo', 'gdrive']
    },
    externalVideoId: String,
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    projectUrl: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    githubUrl: {
        type: String,
        match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Please provide a valid GitHub URL']
    },
    order: {
        type: Number,
        default: 0
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

ProjectSchema.index({ userId: 1, order: 1 });

export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
