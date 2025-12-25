'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    subdomain: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, subdomain: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const response = await api.getMe();
                    if (response.success && response.data?.user) {
                        setUser(response.data.user);
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        if (response.success && response.data) {
            const { user: userData, token: newToken } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
        } else {
            throw new Error(response.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string, subdomain: string) => {
        const response = await api.register(name, email, password, subdomain);
        if (response.success && response.data) {
            const { user: userData, token: newToken } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
        } else {
            throw new Error(response.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const response = await api.getMe();
            if (response.success && response.data?.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                isAdmin: user?.role === 'admin',
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
