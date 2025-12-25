import { NextRequest } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;

        const user = await prisma.user.findFirst({
            where: {
                subdomain: subdomain.toLowerCase(),
                isSuspended: false
            }
        });

        if (!user) {
            return Response.json(
                { success: false, message: 'Portfolio not found' },
                { status: 404 }
            );
        }

        const portfolio = await prisma.portfolio.findUnique({
            where: { userId: user.id }
        });

        if (!portfolio || !portfolio.isPublished) {
            return Response.json(
                { success: false, message: 'Portfolio not found' },
                { status: 404 }
            );
        }

        const projects = await prisma.project.findMany({
            where: {
                userId: user.id,
                isVisible: true
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        });

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
                    skills: JSON.parse(portfolio.skills),
                    socialLinks: JSON.parse(portfolio.socialLinks),
                    templateId: portfolio.templateId,
                    customization: JSON.parse(portfolio.customization),
                    seo: JSON.parse(portfolio.seo)
                },
                projects: projects.map(p => ({
                    _id: p.id,
                    title: p.title,
                    description: p.description,
                    mediaType: p.mediaType,
                    mediaUrl: p.mediaUrl,
                    thumbnailUrl: p.thumbnailUrl,
                    externalPlatform: p.externalPlatform,
                    tags: JSON.parse(p.tags),
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
