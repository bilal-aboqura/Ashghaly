import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Project } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string || 'Untitled';
        const description = formData.get('description') as string || '';
        const tagsStr = formData.get('tags') as string || '';
        const projectUrl = formData.get('projectUrl') as string || '';
        const githubUrl = formData.get('githubUrl') as string || '';

        if (!file) {
            return Response.json(
                { success: false, message: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file size (50MB for videos)
        if (file.size > 50 * 1024 * 1024) {
            return Response.json(
                { success: false, message: 'File too large. Max 50MB.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        await connectDB();

        const uploadResult = await uploadToCloudinary(buffer, {
            folder: `porty/${user._id}/videos`,
            resourceType: 'video'
        });

        const projectCount = await Project.countDocuments({ userId: user._id });

        const project = await Project.create({
            userId: user._id,
            title,
            description,
            mediaType: 'video_upload',
            mediaUrl: uploadResult.url,
            thumbnailUrl: uploadResult.thumbnailUrl || '',
            cloudinaryPublicId: uploadResult.publicId,
            tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
            projectUrl: projectUrl || undefined,
            githubUrl: githubUrl || undefined,
            order: projectCount
        });

        return Response.json({
            success: true,
            data: { project }
        });
    } catch (error: any) {
        console.error('Upload video error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to upload video' },
            { status: 500 }
        );
    }
}
