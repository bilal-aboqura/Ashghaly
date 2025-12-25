'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';
import {
    LayoutDashboard, FolderOpen, Eye, ExternalLink,
    TrendingUp, Calendar, Globe, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    projectCount: number;
    portfolio: any;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [portfolioRes, projectsRes] = await Promise.all([
                    api.getMyPortfolio().catch(() => null),
                    api.getMyProjects().catch(() => null),
                ]);

                const portfolioData = portfolioRes?.data as { portfolio?: { templateId?: string; isPublished?: boolean } } | undefined;
                const projectsData = projectsRes?.data as { projects?: unknown[] } | undefined;

                setStats({
                    projectCount: projectsData?.projects?.length || 0,
                    portfolio: portfolioData?.portfolio || null,
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-400">
                    Here&apos;s an overview of your portfolio
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Projects */}
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.projectCount || 0}</p>
                            <p className="text-sm text-gray-400">Projects</p>
                        </div>
                    </div>
                </div>

                {/* Template */}
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold capitalize">{stats?.portfolio?.templateId || 'None'}</p>
                            <p className="text-sm text-gray-400">Template</p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats?.portfolio?.isPublished ? 'bg-green-500/10' : 'bg-yellow-500/10'
                            }`}>
                            <Eye className={`w-6 h-6 ${stats?.portfolio?.isPublished ? 'text-green-500' : 'text-yellow-500'
                                }`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.portfolio?.isPublished ? 'Live' : 'Draft'}</p>
                            <p className="text-sm text-gray-400">Status</p>
                        </div>
                    </div>
                </div>

                {/* Subdomain */}
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                            <p className="text-lg font-bold truncate">{user?.subdomain}</p>
                            <p className="text-sm text-gray-400">.mysite.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/portfolio" className="card-interactive flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="font-medium">Edit Portfolio</p>
                            <p className="text-sm text-gray-400">Update your bio and skills</p>
                        </div>
                    </Link>

                    <Link href="/dashboard/projects" className="card-interactive flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="font-medium">Add Project</p>
                            <p className="text-sm text-gray-400">Upload new work</p>
                        </div>
                    </Link>

                    <Link href="/dashboard/templates" className="card-interactive flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <p className="font-medium">Change Template</p>
                            <p className="text-sm text-gray-400">Try a new look</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Live Portfolio CTA */}
            <div className="glass rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Your Portfolio is {stats?.portfolio?.isPublished ? 'Live!' : 'Ready to Launch'}</h3>
                        <p className="text-gray-400">
                            {stats?.portfolio?.isPublished
                                ? `Visit ${user?.subdomain}.mysite.com to see it in action`
                                : 'Complete your portfolio and publish it to the world'
                            }
                        </p>
                    </div>
                    <a
                        href={`http://${user?.subdomain}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Portfolio
                    </a>
                </div>
            </div>
        </div>
    );
}
