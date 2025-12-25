import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Project } from '@/lib/models';
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

        await connectDB();

        const projectCount = await Project.countDocuments({ userId: user._id });

        const project = await Project.create({
            userId: user._id,
            title: title || 'Untitled Video',
            description: description || '',
            mediaType: 'video_external',
            mediaUrl: videoInfo.embedUrl,
            thumbnailUrl: videoInfo.thumbnailUrl,
            externalPlatform: videoInfo.platform,
            externalVideoId: videoInfo.videoId,
            tags: tags || [],
            order: projectCount
        });

        return Response.json({
            success: true,
            data: { project }
        });
    } catch (error: any) {
        console.error('Add external video error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to add video' },
            { status: 500 }
        );
    }
}
