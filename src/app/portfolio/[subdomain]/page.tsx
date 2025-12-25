'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { templates, PortfolioData } from '@/components/templates';
import { Loader2 } from 'lucide-react';

export default function PortfolioPage() {
    const params = useParams();
    const subdomain = params?.subdomain as string;
    const [data, setData] = useState<PortfolioData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const response = await fetch(`${apiUrl}/api/portfolio/${subdomain}`);
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.message || 'Portfolio not found');
                }
            } catch (err) {
                setError('Failed to load portfolio');
            } finally {
                setIsLoading(false);
            }
        };

        if (subdomain) {
            fetchPortfolio();
        }
    }, [subdomain]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Portfolio Not Found</h1>
                <p className="text-gray-400 mb-8">{error || 'The portfolio you are looking for does not exist.'}</p>
                <a
                    href="/"
                    className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Home
                </a>
            </div>
        );
    }

    // Get the template component
    const templateId = data.portfolio?.templateId || 'minimal';
    const Template = templates[templateId] || templates.minimal;

    return <Template data={data} />;
}
