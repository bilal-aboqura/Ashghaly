import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, subdomain } = await request.json();

        if (!name || !email || !password || !subdomain) {
            return Response.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingEmail) {
            return Response.json(
                { success: false, message: 'Email already registered' },
                { status: 400 }
            );
        }

        // Check if subdomain exists
        const existingSubdomain = await prisma.user.findUnique({
            where: { subdomain: subdomain.toLowerCase() }
        });
        if (existingSubdomain) {
            return Response.json(
                { success: false, message: 'Subdomain already taken' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                subdomain: subdomain.toLowerCase()
            }
        });

        // Create portfolio
        await prisma.portfolio.create({
            data: {
                userId: user.id,
                templateId: 'minimal'
            }
        });

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
        console.error('Register error:', error);
        return Response.json(
            { success: false, message: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
