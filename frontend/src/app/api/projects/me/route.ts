import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Project } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;

        await connectDB();

        const projects = await Project.find({ userId: user._id })
            .sort({ order: 1, createdAt: -1 });

        return Response.json({
            success: true,
            data: { projects }
        });
    } catch (error: any) {
        console.error('Get projects error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get projects' },
            { status: 500 }
        );
    }
}
