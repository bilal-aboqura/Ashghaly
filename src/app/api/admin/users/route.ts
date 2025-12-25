import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
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

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { subdomain: { contains: search } }
            ];
        }

        if (suspended === 'true') {
            where.isSuspended = true;
        } else if (suspended === 'false') {
            where.isSuspended = false;
        }

        const total = await prisma.user.count({ where });
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                subdomain: true,
                role: true,
                isSuspended: true,
                createdAt: true,
                portfolio: {
                    select: { templateId: true }
                },
                _count: {
                    select: { projects: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        const usersData = users.map(user => ({
            _id: user.id,
            name: user.name,
            email: user.email,
            subdomain: user.subdomain,
            role: user.role,
            isSuspended: user.isSuspended,
            createdAt: user.createdAt,
            projectCount: user._count.projects,
            templateId: user.portfolio?.templateId || 'minimal'
        }));

        return Response.json({
            success: true,
            data: {
                users: usersData,
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
