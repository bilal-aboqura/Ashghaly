import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    subdomain: string;
    role: 'user' | 'admin';
    isSuspended: boolean;
    suspendedAt?: Date;
    suspendedReason?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const RESERVED_SUBDOMAINS = [
    'www', 'api', 'admin', 'dashboard', 'login', 'register',
    'app', 'mail', 'support', 'help', 'blog', 'static', 'assets',
    'cdn', 'img', 'images', 'css', 'js', 'fonts'
];

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    subdomain: {
        type: String,
        required: [true, 'Subdomain is required'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'Subdomain must be at least 3 characters'],
        maxlength: [30, 'Subdomain cannot exceed 30 characters'],
        match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
        validate: {
            validator: function (v: string) {
                return !RESERVED_SUBDOMAINS.includes(v) && !v.startsWith('-') && !v.endsWith('-');
            },
            message: 'This subdomain is not available'
        }
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
    suspendedAt: Date,
    suspendedReason: String
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
