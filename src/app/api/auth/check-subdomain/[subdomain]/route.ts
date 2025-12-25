import { NextRequest } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;

        const existingUser = await prisma.user.findUnique({
            where: { subdomain: subdomain.toLowerCase() }
        });

        return Response.json({
            success: true,
            data: {
                available: !existingUser
            }
        });
    } catch (error: any) {
        console.error('Check subdomain error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to check subdomain' },
            { status: 500 }
        );
    }
}
