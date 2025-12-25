import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return Response.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);

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

        const token = signToken(user.id);

        return Response.json({
            success: true,
            data: {
                user: {
                    id: user.id,
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
