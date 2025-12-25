'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';
import {
    Shield, Users, FolderOpen, BarChart3, Search, Loader2,
    Ban, Unlock, Trash2, Palette, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    subdomain: string;
    role: string;
    isSuspended: boolean;
    createdAt: string;
    projectCount: number;
    templateId: string;
}

interface Stats {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalProjects: number;
    totalPortfolios: number;
}

export default function AdminPage() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, page, filter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const suspended = filter === 'all' ? undefined : filter === 'suspended';
            const [statsRes, usersRes] = await Promise.all([
                api.getAdminStats(),
                api.getAdminUsers(page, search, suspended),
            ]);

            if (statsRes.success) {
                setStats(statsRes.data as Stats);
            }
            if (usersRes.success && usersRes.data) {
                const data = usersRes.data as { users: User[]; pagination: { pages: number } };
                setUsers(data.users || []);
                setTotalPages(data.pagination?.pages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const handleSuspend = async (userId: string) => {
        const reason = prompt('Reason for suspension:');
        if (!reason) return;

        try {
            await api.suspendUser(userId, reason);
            toast.success('User suspended');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to suspend user');
        }
    };

    const handleUnsuspend = async (userId: string) => {
        try {
            await api.unsuspendUser(userId);
            toast.success('User unsuspended');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to unsuspend user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure? This will delete all user data permanently.')) return;

        try {
            await api.deleteUser(userId);
            toast.success('User deleted');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const handleChangeTemplate = async (userId: string) => {
        const templateId = prompt('Enter template ID (minimal, creative, professional):');
        if (!templateId || !['minimal', 'creative', 'professional'].includes(templateId)) {
            toast.error('Invalid template ID');
            return;
        }

        try {
            await api.changeUserTemplate(userId, templateId);
            toast.success('Template changed');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to change template');
        }
    };

    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Admin Panel</h1>
                        <p className="text-gray-400">Manage users and platform settings</p>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                    <p className="text-xs text-gray-400">Total Users</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                                    <p className="text-xs text-gray-400">Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Ban className="w-5 h-5 text-red-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.suspendedUsers}</p>
                                    <p className="text-xs text-gray-400">Suspended</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <FolderOpen className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalProjects}</p>
                                    <p className="text-xs text-gray-400">Projects</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-cyan-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalPortfolios}</p>
                                    <p className="text-xs text-gray-400">Portfolios</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-12"
                                placeholder="Search by name, email, or subdomain..."
                            />
                        </div>
                        <button type="submit" className="btn-secondary">
                            Search
                        </button>
                    </form>
                    <div className="flex gap-2">
                        {(['all', 'active', 'suspended'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setPage(1); }}
                                className={`px-4 py-2 rounded-lg transition-all ${filter === f
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No users found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">User</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Subdomain</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Projects</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Template</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <a
                                                    href={`http://${user.subdomain}.mysite.com`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    {user.subdomain}
                                                </a>
                                            </td>
                                            <td className="py-4 px-4">{user.projectCount}</td>
                                            <td className="py-4 px-4 capitalize">{user.templateId || 'minimal'}</td>
                                            <td className="py-4 px-4">
                                                {user.isSuspended ? (
                                                    <span className="badge badge-error">Suspended</span>
                                                ) : (
                                                    <span className="badge badge-success">Active</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={`http://${user.subdomain}.localhost:3000`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-ghost p-2"
                                                        title="View Portfolio"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleChangeTemplate(user._id)}
                                                        className="btn-ghost p-2"
                                                        title="Change Template"
                                                    >
                                                        <Palette className="w-4 h-4" />
                                                    </button>
                                                    {user.isSuspended ? (
                                                        <button
                                                            onClick={() => handleUnsuspend(user._id)}
                                                            className="btn-ghost p-2 text-green-400"
                                                            title="Unsuspend"
                                                        >
                                                            <Unlock className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSuspend(user._id)}
                                                            className="btn-ghost p-2 text-yellow-400"
                                                            title="Suspend"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="btn-ghost p-2 text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-800">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="btn-ghost p-2 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-400">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="btn-ghost p-2 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
