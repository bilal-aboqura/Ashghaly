import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
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

        if (file.size > 50 * 1024 * 1024) {
            return Response.json(
                { success: false, message: 'File too large. Max 50MB.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await uploadToCloudinary(buffer, {
            folder: `porty/${user.id}/videos`,
            resourceType: 'video'
        });

        const projectCount = await prisma.project.count({ where: { userId: user.id } });

        const project = await prisma.project.create({
            data: {
                userId: user.id,
                title,
                description,
                mediaType: 'video_upload',
                mediaUrl: uploadResult.url,
                thumbnailUrl: uploadResult.thumbnailUrl || '',
                cloudinaryPublicId: uploadResult.publicId,
                tags: JSON.stringify(tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []),
                projectUrl: projectUrl || null,
                githubUrl: githubUrl || null,
                order: projectCount
            }
        });

        return Response.json({
            success: true,
            data: {
                project: {
                    ...project,
                    _id: project.id,
                    tags: JSON.parse(project.tags)
                }
            }
        });
    } catch (error: any) {
        console.error('Upload video error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to upload video' },
            { status: 500 }
        );
    }
}
