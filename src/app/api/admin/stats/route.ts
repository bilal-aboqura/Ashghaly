import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User, Portfolio, Project } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAdmin(request);

        if ('error' in result) {
            return result.error;
        }

        await connectDB();

        const [totalUsers, activeUsers, suspendedUsers, totalProjects, totalPortfolios] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isSuspended: false }),
            User.countDocuments({ isSuspended: true }),
            Project.countDocuments(),
            Portfolio.countDocuments()
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
