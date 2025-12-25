import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User, Portfolio, Project } from '@/lib/models';
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

        await connectDB();

        const user = await User.findById(id);

        if (!user) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (action === 'suspend') {
            user.isSuspended = true;
            user.suspendedAt = new Date();
            user.suspendedReason = reason || 'No reason provided';
            await user.save();

            return Response.json({
                success: true,
                message: 'User suspended'
            });
        }

        if (action === 'unsuspend') {
            user.isSuspended = false;
            user.suspendedAt = undefined;
            user.suspendedReason = undefined;
            await user.save();

            return Response.json({
                success: true,
                message: 'User unsuspended'
            });
        }

        if (action === 'changeTemplate' && templateId) {
            await Portfolio.findOneAndUpdate(
                { userId: id },
                { templateId },
                { new: true }
            );

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

        await connectDB();

        const user = await User.findById(id);

        if (!user) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user's projects and Cloudinary assets
        const projects = await Project.find({ userId: id });

        for (const project of projects) {
            if (project.cloudinaryPublicId) {
                const resourceType = project.mediaType === 'video_upload' ? 'video' : 'image';
                await deleteFromCloudinary(project.cloudinaryPublicId, resourceType);
            }
        }

        await Project.deleteMany({ userId: id });
        await Portfolio.deleteOne({ userId: id });
        await User.findByIdAndDelete(id);

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
