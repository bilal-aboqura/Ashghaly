import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { parseVideoUrl } from '@/lib/videoEmbed';

export async function POST(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;
        const { title, description, videoUrl, tags } = await request.json();

        if (!videoUrl) {
            return Response.json(
                { success: false, message: 'Video URL is required' },
                { status: 400 }
            );
        }

        const videoInfo = parseVideoUrl(videoUrl);

        if (!videoInfo) {
            return Response.json(
                { success: false, message: 'Invalid video URL. Supported: YouTube, Vimeo, Google Drive' },
                { status: 400 }
            );
        }

        const projectCount = await prisma.project.count({ where: { userId: user.id } });

        const project = await prisma.project.create({
            data: {
                userId: user.id,
                title: title || 'Untitled Video',
                description: description || '',
                mediaType: 'video_external',
                mediaUrl: videoInfo.embedUrl,
                thumbnailUrl: videoInfo.thumbnailUrl,
                externalPlatform: videoInfo.platform,
                externalVideoId: videoInfo.videoId,
                tags: JSON.stringify(tags || []),
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
        console.error('Add external video error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to add video' },
            { status: 500 }
        );
    }
}
