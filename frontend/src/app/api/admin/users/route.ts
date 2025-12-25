import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User, Project, Portfolio } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAdmin(request);

        if ('error' in result) {
            return result.error;
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const suspended = searchParams.get('suspended');

        await connectDB();

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subdomain: { $regex: search, $options: 'i' } }
            ];
        }

        if (suspended === 'true') {
            query.isSuspended = true;
        } else if (suspended === 'false') {
            query.isSuspended = false;
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get project counts
        const userIds = users.map(u => u._id);
        const projectCounts = await Project.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]);

        const portfolios = await Portfolio.find({ userId: { $in: userIds } });

        const usersWithData = users.map(user => {
            const projectCount = projectCounts.find(p => p._id.equals(user._id))?.count || 0;
            const portfolio = portfolios.find(p => p.userId.equals(user._id));

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                subdomain: user.subdomain,
                role: user.role,
                isSuspended: user.isSuspended,
                createdAt: user.createdAt,
                projectCount,
                templateId: portfolio?.templateId || 'minimal'
            };
        });

        return Response.json({
            success: true,
            data: {
                users: usersWithData,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        console.error('Get admin users error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get users' },
            { status: 500 }
        );
    }
}
