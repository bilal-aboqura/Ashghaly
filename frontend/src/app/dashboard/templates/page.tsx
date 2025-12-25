'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Check, Loader2, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const templates = [
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and simple design that puts your work front and center',
        preview: 'bg-gradient-to-br from-gray-900 to-gray-800',
        features: ['Clean layout', 'Fast loading', 'Great for developers'],
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Bold and expressive design with dynamic animations',
        preview: 'bg-gradient-to-br from-purple-900 to-pink-900',
        features: ['Animations', 'Bold colors', 'Great for designers'],
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate-style layout perfect for business professionals',
        preview: 'bg-gradient-to-br from-blue-900 to-indigo-900',
        features: ['Formal style', 'Resume-like', 'Great for consultants'],
    },
];

export default function TemplatesPage() {
    const [currentTemplate, setCurrentTemplate] = useState<string>('minimal');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await api.getMyPortfolio();
                const portfolioData = response.data as { portfolio?: { templateId?: string } } | undefined;
                if (response.success && portfolioData?.portfolio) {
                    setCurrentTemplate(portfolioData.portfolio.templateId || 'minimal');
                }
            } catch (error) {
                console.error('Failed to fetch portfolio:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const selectTemplate = async (templateId: string) => {
        if (templateId === currentTemplate) return;

        setIsSaving(true);
        try {
            await api.updatePortfolio({ templateId });
            setCurrentTemplate(templateId);
            toast.success('Template updated!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update template');
        } finally {
            setIsSaving(false);
        }
    };

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
                <h1 className="text-3xl font-bold mb-2">Templates</h1>
                <p className="text-gray-400">Choose how your portfolio looks to visitors</p>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => {
                    const isSelected = currentTemplate === template.id;

                    return (
                        <div
                            key={template.id}
                            className={`card relative overflow-hidden cursor-pointer transition-all duration-300 ${isSelected
                                ? 'ring-2 ring-blue-500 border-blue-500/50'
                                : 'hover:border-gray-600'
                                }`}
                            onClick={() => selectTemplate(template.id)}
                        >
                            {/* Preview */}
                            <div className={`aspect-video rounded-xl mb-4 ${template.preview} relative overflow-hidden`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Palette className="w-12 h-12 text-white/30" />
                                </div>

                                {/* Selected badge */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold">{template.name}</h3>
                                    {isSelected && (
                                        <span className="badge badge-info">Active</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">{template.description}</p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2">
                                {template.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Loading overlay */}
                            {isSaving && (
                                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="mt-8 glass rounded-xl p-6">
                <h3 className="font-semibold mb-2">🎨 More templates coming soon!</h3>
                <p className="text-gray-400 text-sm">
                    We&apos;re working on new templates. Your current template will be preserved when new ones are added.
                </p>
            </div>
        </div>
    );
}
