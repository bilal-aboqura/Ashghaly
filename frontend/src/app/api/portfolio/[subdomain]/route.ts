import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User, Portfolio, Project } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;

        await connectDB();

        const user = await User.findOne({
            subdomain: subdomain.toLowerCase(),
            isSuspended: false
        });

        if (!user) {
            return Response.json(
                { success: false, message: 'Portfolio not found' },
                { status: 404 }
            );
        }

        const portfolio = await Portfolio.findOne({
            userId: user._id,
            isPublished: true
        });

        if (!portfolio) {
            return Response.json(
                { success: false, message: 'Portfolio not found' },
                { status: 404 }
            );
        }

        const projects = await Project.find({
            userId: user._id,
            isVisible: true
        }).sort({ order: 1, createdAt: -1 });

        return Response.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    subdomain: user.subdomain
                },
                portfolio: {
                    bio: portfolio.bio,
                    headline: portfolio.headline,
                    skills: portfolio.skills,
                    socialLinks: portfolio.socialLinks,
                    templateId: portfolio.templateId,
                    customization: portfolio.customization,
                    seo: portfolio.seo
                },
                projects: projects.map(p => ({
                    _id: p._id,
                    title: p.title,
                    description: p.description,
                    mediaType: p.mediaType,
                    mediaUrl: p.mediaUrl,
                    thumbnailUrl: p.thumbnailUrl,
                    externalPlatform: p.externalPlatform,
                    tags: p.tags,
                    projectUrl: p.projectUrl,
                    githubUrl: p.githubUrl
                }))
            }
        });
    } catch (error: any) {
        console.error('Get public portfolio error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get portfolio' },
            { status: 500 }
        );
    }
}
