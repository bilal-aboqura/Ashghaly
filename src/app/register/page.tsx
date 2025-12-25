'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Globe, Check, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const { register } = useAuth();
    const router = useRouter();

    // Check subdomain availability with debounce
    useEffect(() => {
        if (subdomain.length < 3) {
            setSubdomainStatus('idle');
            return;
        }

        const checkAvailability = async () => {
            setSubdomainStatus('checking');
            try {
                const response = await api.checkSubdomain(subdomain);
                setSubdomainStatus(response.data?.available ? 'available' : 'taken');
            } catch {
                setSubdomainStatus('idle');
            }
        };

        const timeout = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeout);
    }, [subdomain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (subdomainStatus === 'taken') {
            toast.error('Please choose a different subdomain');
            return;
        }

        setIsLoading(true);

        try {
            await register(name, email, password, subdomain);
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg-animated flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">Porty</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-center mb-2">Create Your Portfolio</h1>
                    <p className="text-gray-400 text-center mb-8">
                        Get your own subdomain and start showcasing
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Subdomain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Choose Your Subdomain
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={subdomain}
                                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="input-field pl-12 pr-12"
                                    placeholder="yourname"
                                    minLength={3}
                                    maxLength={30}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {subdomainStatus === 'checking' && (
                                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                    )}
                                    {subdomainStatus === 'available' && (
                                        <Check className="w-5 h-5 text-green-500" />
                                    )}
                                    {subdomainStatus === 'taken' && (
                                        <X className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Your portfolio will be at:{' '}
                                <span className="text-blue-400">{subdomain || 'yourname'}.mysite.com</span>
                            </p>
                            {subdomainStatus === 'taken' && (
                                <p className="text-sm text-red-400 mt-1">This subdomain is already taken</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12 pr-12"
                                    placeholder="Min. 8 characters"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || subdomainStatus === 'taken'}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login link */}
                    <p className="text-center text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
