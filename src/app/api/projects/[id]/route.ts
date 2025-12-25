import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;
        const { id } = await params;
        const updates = await request.json();

        const project = await prisma.project.findFirst({
            where: { id, userId: user.id }
        });

        if (!project) {
            return Response.json(
                { success: false, message: 'Project not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags);
        if (updates.projectUrl !== undefined) updateData.projectUrl = updates.projectUrl;
        if (updates.githubUrl !== undefined) updateData.githubUrl = updates.githubUrl;
        if (updates.isVisible !== undefined) updateData.isVisible = updates.isVisible;
        if (updates.order !== undefined) updateData.order = updates.order;

        const updatedProject = await prisma.project.update({
            where: { id },
            data: updateData
        });

        return Response.json({
            success: true,
            data: {
                project: {
                    ...updatedProject,
                    _id: updatedProject.id,
                    tags: JSON.parse(updatedProject.tags)
                }
            }
        });
    } catch (error: any) {
        console.error('Update project error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;
        const { id } = await params;

        const project = await prisma.project.findFirst({
            where: { id, userId: user.id }
        });

        if (!project) {
            return Response.json(
                { success: false, message: 'Project not found' },
                { status: 404 }
            );
        }

        // Delete from Cloudinary if applicable
        if (project.cloudinaryPublicId) {
            const resourceType = project.mediaType === 'video_upload' ? 'video' : 'image';
            await deleteFromCloudinary(project.cloudinaryPublicId, resourceType);
        }

        await prisma.project.delete({ where: { id } });

        return Response.json({
            success: true,
            message: 'Project deleted'
        });
    } catch (error: any) {
        console.error('Delete project error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to delete project' },
            { status: 500 }
        );
    }
}
