import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return Response.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return Response.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (user.isSuspended) {
            return Response.json(
                { success: false, message: 'Account suspended. Contact support.' },
                { status: 403 }
            );
        }

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
        console.error('Login error:', error);
        return Response.json(
            { success: false, message: error.message || 'Login failed' },
            { status: 500 }
        );
    }
}
