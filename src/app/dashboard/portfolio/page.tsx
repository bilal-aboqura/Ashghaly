'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Save, Loader2, Plus, X, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Portfolio {
    bio: string;
    headline: string;
    skills: string[];
    socialLinks: {
        website: string;
        github: string;
        linkedin: string;
        twitter: string;
        instagram: string;
        youtube: string;
        dribbble: string;
        behance: string;
    };
}

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<Portfolio>({
        bio: '',
        headline: '',
        skills: [],
        socialLinks: {
            website: '',
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            youtube: '',
            dribbble: '',
            behance: '',
        },
    });
    const [newSkill, setNewSkill] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await api.getMyPortfolio();
                const portfolioData = response.data as { portfolio?: { bio?: string; headline?: string; skills?: string[]; socialLinks?: Record<string, string> } } | undefined;
                if (response.success && portfolioData?.portfolio) {
                    const p = portfolioData.portfolio;
                    setPortfolio({
                        bio: p.bio || '',
                        headline: p.headline || '',
                        skills: p.skills || [],
                        socialLinks: {
                            website: p.socialLinks?.website || '',
                            github: p.socialLinks?.github || '',
                            linkedin: p.socialLinks?.linkedin || '',
                            twitter: p.socialLinks?.twitter || '',
                            instagram: p.socialLinks?.instagram || '',
                            youtube: p.socialLinks?.youtube || '',
                            dribbble: p.socialLinks?.dribbble || '',
                            behance: p.socialLinks?.behance || '',
                        },
                    });
                }
            } catch (error) {
                console.error('Failed to fetch portfolio:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updatePortfolio(portfolio);
            toast.success('Portfolio saved successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save portfolio');
        } finally {
            setIsSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !portfolio.skills.includes(newSkill.trim())) {
            setPortfolio({
                ...portfolio,
                skills: [...portfolio.skills, newSkill.trim()],
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setPortfolio({
            ...portfolio,
            skills: portfolio.skills.filter((s) => s !== skill),
        });
    };

    const updateSocialLink = (platform: string, value: string) => {
        setPortfolio({
            ...portfolio,
            socialLinks: {
                ...portfolio.socialLinks,
                [platform]: value,
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const socialPlatforms = [
        { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
        { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
        { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
        { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
        { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
        { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username' },
        { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username' },
    ];

    return (
        <div className="animate-fade-in max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Edit Portfolio</h1>
                    <p className="text-gray-400">Update your bio, skills, and social links</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="space-y-8">
                {/* Headline */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Headline</h2>
                    <input
                        type="text"
                        value={portfolio.headline}
                        onChange={(e) => setPortfolio({ ...portfolio, headline: e.target.value })}
                        className="input-field"
                        placeholder="e.g., Full-Stack Developer & Designer"
                        maxLength={200}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        A short tagline that describes what you do ({portfolio.headline.length}/200)
                    </p>
                </div>

                {/* Bio */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">About Me</h2>
                    <textarea
                        value={portfolio.bio}
                        onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
                        className="input-field min-h-[150px] resize-y"
                        placeholder="Tell visitors about yourself, your experience, and what you're passionate about..."
                        maxLength={2000}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        {portfolio.bio.length}/2000 characters
                    </p>
                </div>

                {/* Skills */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {portfolio.skills.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm border border-blue-500/20"
                            >
                                {skill}
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 hover:text-red-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            className="input-field flex-1"
                            placeholder="Add a skill (e.g., React, Python, UI Design)"
                            maxLength={50}
                        />
                        <button
                            onClick={addSkill}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Social Links */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Social Links
                    </h2>
                    <div className="grid gap-4">
                        {socialPlatforms.map((platform) => (
                            <div key={platform.key}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {platform.label}
                                </label>
                                <input
                                    type="url"
                                    value={(portfolio.socialLinks as any)[platform.key]}
                                    onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                                    className="input-field"
                                    placeholder={platform.placeholder}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
