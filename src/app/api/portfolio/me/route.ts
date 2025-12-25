import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;

        let portfolio = await prisma.portfolio.findUnique({
            where: { userId: user.id }
        });

        if (!portfolio) {
            portfolio = await prisma.portfolio.create({
                data: {
                    userId: user.id,
                    templateId: 'minimal'
                }
            });
        }

        // Parse JSON fields
        const portfolioData = {
            ...portfolio,
            skills: JSON.parse(portfolio.skills),
            socialLinks: JSON.parse(portfolio.socialLinks),
            customization: JSON.parse(portfolio.customization),
            seo: JSON.parse(portfolio.seo)
        };

        return Response.json({
            success: true,
            data: { portfolio: portfolioData }
        });
    } catch (error: any) {
        console.error('Get portfolio error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to get portfolio' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;
        const updates = await request.json();

        // Prepare update data
        const updateData: any = {};

        if (updates.bio !== undefined) updateData.bio = updates.bio;
        if (updates.headline !== undefined) updateData.headline = updates.headline;
        if (updates.skills !== undefined) updateData.skills = JSON.stringify(updates.skills);
        if (updates.socialLinks !== undefined) updateData.socialLinks = JSON.stringify(updates.socialLinks);
        if (updates.templateId !== undefined) updateData.templateId = updates.templateId;
        if (updates.customization !== undefined) updateData.customization = JSON.stringify(updates.customization);
        if (updates.seo !== undefined) updateData.seo = JSON.stringify(updates.seo);
        if (updates.isPublished !== undefined) updateData.isPublished = updates.isPublished;

        const portfolio = await prisma.portfolio.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                ...updateData
            }
        });

        // Parse JSON fields for response
        const portfolioData = {
            ...portfolio,
            skills: JSON.parse(portfolio.skills),
            socialLinks: JSON.parse(portfolio.socialLinks),
            customization: JSON.parse(portfolio.customization),
            seo: JSON.parse(portfolio.seo)
        };

        return Response.json({
            success: true,
            data: { portfolio: portfolioData }
        });
    } catch (error: any) {
        console.error('Update portfolio error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to update portfolio' },
            { status: 500 }
        );
    }
}
