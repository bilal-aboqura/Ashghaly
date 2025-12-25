import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;

        return Response.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    subdomain: user.subdomain,
                    role: user.role
                }
            }
        });
    } catch (error: any) {
        console.error('Get me error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get user' },
            { status: 500 }
        );
    }
}
