/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow images from Cloudinary and external sources
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'vumbnail.com',
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com',
            },
        ],
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mysite.com',
    },

    // Enable experimental features for better performance
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
};

module.exports = nextConfig;
