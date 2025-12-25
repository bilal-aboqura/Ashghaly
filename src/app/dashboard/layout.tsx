'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import {
    Sparkles, LayoutDashboard, Briefcase, FolderOpen, Palette,
    Settings, LogOut, User, ExternalLink, Loader2, Shield
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase },
        { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
        { name: 'Templates', href: '/dashboard/templates', icon: Palette },
    ];

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-800">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold gradient-text">Porty</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* Admin link */}
                        {isAdmin && (
                            <li>
                                <Link
                                    href="/admin"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname.startsWith('/admin')
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <Shield className="w-5 h-5" />
                                    Admin Panel
                                </Link>
                            </li>
                        )}
                    </ul>

                    {/* View Portfolio Link */}
                    {user && (
                        <div className="mt-6 px-4">
                            <a
                                href={`http://${user.subdomain}.localhost:3000`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View live portfolio
                            </a>
                        </div>
                    )}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.subdomain}.mysite.com</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
