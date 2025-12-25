import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const result = await requireAdmin(request);

        if ('error' in result) {
            return result.error;
        }

        const { id } = await params;
        const { action, reason, templateId } = await request.json();

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (action === 'suspend') {
            await prisma.user.update({
                where: { id },
                data: {
                    isSuspended: true,
                    suspendedAt: new Date(),
                    suspendedReason: reason || 'No reason provided'
                }
            });

            return Response.json({
                success: true,
                message: 'User suspended'
            });
        }

        if (action === 'unsuspend') {
            await prisma.user.update({
                where: { id },
                data: {
                    isSuspended: false,
                    suspendedAt: null,
                    suspendedReason: null
                }
            });

            return Response.json({
                success: true,
                message: 'User unsuspended'
            });
        }

        if (action === 'changeTemplate' && templateId) {
            await prisma.portfolio.update({
                where: { userId: id },
                data: { templateId }
            });

            return Response.json({
                success: true,
                message: 'Template updated'
            });
        }

        return Response.json(
            { success: false, message: 'Invalid action' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Admin user action error:', error);
        return Response.json(
            { success: false, message: error.message || 'Action failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const result = await requireAdmin(request);

        if ('error' in result) {
            return result.error;
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user's projects and Cloudinary assets
        const projects = await prisma.project.findMany({ where: { userId: id } });

        for (const project of projects) {
            if (project.cloudinaryPublicId) {
                const resourceType = project.mediaType === 'video_upload' ? 'video' : 'image';
                await deleteFromCloudinary(project.cloudinaryPublicId, resourceType);
            }
        }

        // Delete user (cascade will delete portfolio and projects)
        await prisma.user.delete({ where: { id } });

        return Response.json({
            success: true,
            message: 'User and all data deleted'
        });
    } catch (error: any) {
        console.error('Delete user error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to delete user' },
            { status: 500 }
        );
    }
}
