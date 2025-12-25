import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAdmin(request);

        if ('error' in result) {
            return result.error;
        }

        const [totalUsers, activeUsers, suspendedUsers, totalProjects, totalPortfolios] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isSuspended: false } }),
            prisma.user.count({ where: { isSuspended: true } }),
            prisma.project.count(),
            prisma.portfolio.count()
        ]);

        return Response.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                totalProjects,
                totalPortfolios
            }
        });
    } catch (error: any) {
        console.error('Get admin stats error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get stats' },
            { status: 500 }
        );
    }
}
