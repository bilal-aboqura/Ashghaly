import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortfolio extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    bio: string;
    headline: string;
    skills: string[];
    socialLinks: {
        website?: string;
        github?: string;
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        dribbble?: string;
        behance?: string;
    };
    templateId: string;
    customization: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
    };
    seo: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    bio: {
        type: String,
        default: '',
        maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    headline: {
        type: String,
        default: '',
        maxlength: [200, 'Headline cannot exceed 200 characters']
    },
    skills: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    socialLinks: {
        website: String,
        github: String,
        linkedin: String,
        twitter: String,
        instagram: String,
        youtube: String,
        dribbble: String,
        behance: String
    },
    templateId: {
        type: String,
        enum: ['minimal', 'creative', 'professional'],
        default: 'minimal'
    },
    customization: {
        primaryColor: { type: String, default: '#3b82f6' },
        secondaryColor: { type: String, default: '#8b5cf6' },
        fontFamily: { type: String, default: 'Inter' }
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

PortfolioSchema.virtual('projects', {
    ref: 'Project',
    localField: 'userId',
    foreignField: 'userId'
});

export const Portfolio: Model<IPortfolio> = mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
