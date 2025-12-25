'use client';

import { TemplateProps } from './index';
import { Github, Linkedin, Twitter, Instagram, Youtube, Globe, ExternalLink, Mail, Briefcase } from 'lucide-react';

export function ProfessionalTemplate({ data }: TemplateProps) {
    const { user, portfolio, projects } = data;

    const socialIcons: Record<string, React.ReactNode> = {
        github: <Github className="w-4 h-4" />,
        linkedin: <Linkedin className="w-4 h-4" />,
        twitter: <Twitter className="w-4 h-4" />,
        instagram: <Instagram className="w-4 h-4" />,
        youtube: <Youtube className="w-4 h-4" />,
        website: <Globe className="w-4 h-4" />,
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Header */}
            <header className="bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar placeholder */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-bold">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                            {portfolio.headline && (
                                <p className="text-xl text-slate-300 mb-4">{portfolio.headline}</p>
                            )}

                            {/* Social Links */}
                            {portfolio.socialLinks && Object.values(portfolio.socialLinks).some(v => v) && (
                                <div className="flex gap-3">
                                    {Object.entries(portfolio.socialLinks).map(([platform, url]) => {
                                        if (!url) return null;
                                        return (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
                                            >
                                                {socialIcons[platform] || <Globe className="w-4 h-4" />}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-12">
                    {/* Sidebar */}
                    <aside className="md:col-span-1">
                        {/* Skills */}
                        {portfolio.skills && portfolio.skills.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {portfolio.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="bg-slate-100 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-600" />
                                Get in Touch
                            </h2>
                            <p className="text-sm text-slate-600 mb-4">
                                Interested in working together? Feel free to reach out.
                            </p>
                            {portfolio.socialLinks?.linkedin && (
                                <a
                                    href={portfolio.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    Connect on LinkedIn
                                </a>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        {/* About */}
                        {portfolio.bio && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">About</h2>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {portfolio.bio}
                                </p>
                            </section>
                        )}

                        {/* Projects */}
                        {projects && projects.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">Portfolio</h2>
                                <div className="grid gap-6">
                                    {projects.map((project) => (
                                        <article
                                            key={project._id}
                                            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            {/* Media */}
                                            <div className="aspect-video bg-slate-100">
                                                {project.mediaType === 'video_external' ? (
                                                    <iframe
                                                        src={project.mediaUrl}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : project.mediaType === 'video_upload' ? (
                                                    <video
                                                        src={project.mediaUrl}
                                                        poster={project.thumbnailUrl}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={project.mediaUrl}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold mb-2 text-slate-900">
                                                    {project.title}
                                                </h3>
                                                {project.description && (
                                                    <p className="text-slate-600 mb-4">{project.description}</p>
                                                )}

                                                {project.tags && project.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {project.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-4">
                                                    {project.projectUrl && (
                                                        <a
                                                            href={project.projectUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            View Project
                                                        </a>
                                                    )}
                                                    {project.githubUrl && (
                                                        <a
                                                            href={project.githubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
                                                        >
                                                            <Github className="w-4 h-4" />
                                                            View Source
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-8 mt-16">
                <div className="max-w-5xl mx-auto px-6 text-center text-sm text-slate-400">
                    © {new Date().getFullYear()} {user.name}. All rights reserved. • Powered by Porty
                </div>
            </footer>
        </div>
    );
}
