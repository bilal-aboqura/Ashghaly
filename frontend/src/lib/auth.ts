import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectDB from './db';
import { User, IUser } from './models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export function signToken(userId: string): string {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '7d'
    });
}

export function verifyToken(token: string): { id: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string };
    } catch {
        return null;
    }
}

export async function getAuthUser(request: NextRequest): Promise<IUser | null> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return null;
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user || user.isSuspended) {
        return null;
    }

    return user;
}

export async function requireAuth(request: NextRequest): Promise<{ user: IUser } | { error: Response }> {
    const user = await getAuthUser(request);

    if (!user) {
        return {
            error: Response.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            )
        };
    }

    return { user };
}

export async function requireAdmin(request: NextRequest): Promise<{ user: IUser } | { error: Response }> {
    const result = await requireAuth(request);

    if ('error' in result) {
        return result;
    }

    if (result.user.role !== 'admin') {
        return {
            error: Response.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            )
        };
    }

    return result;
}
