import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Portfolio } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const result = await requireAuth(request);

        if ('error' in result) {
            return result.error;
        }

        const { user } = result;

        await connectDB();

        let portfolio = await Portfolio.findOne({ userId: user._id });

        if (!portfolio) {
            portfolio = await Portfolio.create({
                userId: user._id,
                templateId: 'minimal'
            });
        }

        return Response.json({
            success: true,
            data: { portfolio }
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

        // Filter allowed fields
        const allowedFields = ['bio', 'headline', 'skills', 'socialLinks', 'templateId', 'customization', 'seo', 'isPublished'];
        const filteredUpdates: any = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        await connectDB();

        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: user._id },
            filteredUpdates,
            { new: true, upsert: true, runValidators: true }
        );

        return Response.json({
            success: true,
            data: { portfolio }
        });
    } catch (error: any) {
        console.error('Update portfolio error:', error);
        return Response.json(
            { success: false, message: error.message || 'Failed to update portfolio' },
            { status: 500 }
        );
    }
}
