import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;

        await connectDB();

        const existingUser = await User.findOne({ subdomain: subdomain.toLowerCase() });

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
