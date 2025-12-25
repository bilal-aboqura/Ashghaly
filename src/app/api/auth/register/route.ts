import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User, Portfolio } from '@/lib/models';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, subdomain } = await request.json();

        if (!name || !email || !password || !subdomain) {
            return Response.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if email exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return Response.json(
                { success: false, message: 'Email already registered' },
                { status: 400 }
            );
        }

        // Check if subdomain exists
        const existingSubdomain = await User.findOne({ subdomain: subdomain.toLowerCase() });
        if (existingSubdomain) {
            return Response.json(
                { success: false, message: 'Subdomain already taken' },
                { status: 400 }
            );
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            subdomain: subdomain.toLowerCase()
        });

        // Create portfolio
        await Portfolio.create({
            userId: user._id,
            templateId: 'minimal'
        });

        const token = signToken(user._id.toString());

        return Response.json({
            success: true,
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
    } catch (error: any) {
        console.error('Register error:', error);
        return Response.json(
            { success: false, message: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
