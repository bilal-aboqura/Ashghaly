import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Project } from '@/lib/models';
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

        await connectDB();

        const project = await Project.findOne({ _id: id, userId: user._id });

        if (!project) {
            return Response.json(
                { success: false, message: 'Project not found' },
                { status: 404 }
            );
        }

        // Filter allowed fields
        const allowedFields = ['title', 'description', 'tags', 'projectUrl', 'githubUrl', 'isVisible', 'order'];
        const filteredUpdates: any = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            filteredUpdates,
            { new: true, runValidators: true }
        );

        return Response.json({
            success: true,
            data: { project: updatedProject }
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

        await connectDB();

        const project = await Project.findOne({ _id: id, userId: user._id });

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

        await Project.findByIdAndDelete(id);

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
