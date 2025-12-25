import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;

        const projects = await prisma.project.findMany({
            where: { userId: user.id },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        // Parse tags JSON for each project
        const projectsData = projects.map(p => ({
            ...p,
            _id: p.id,
            tags: JSON.parse(p.tags)
        }));

        return Response.json({
            success: true,
            data: { projects: projectsData }
        });
    } catch (error: any) {
        console.error('Get projects error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get projects' },
            { status: 500 }
        );
    }
}
