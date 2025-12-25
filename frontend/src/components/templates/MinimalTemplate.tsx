'use client';

import { TemplateProps } from './index';
import { Github, Linkedin, Twitter, Instagram, Youtube, Globe, ExternalLink, Mail } from 'lucide-react';

export function MinimalTemplate({ data }: TemplateProps) {
    const { user, portfolio, projects } = data;

    const socialIcons: Record<string, React.ReactNode> = {
        github: <Github className="w-5 h-5" />,
        linkedin: <Linkedin className="w-5 h-5" />,
        twitter: <Twitter className="w-5 h-5" />,
        instagram: <Instagram className="w-5 h-5" />,
        youtube: <Youtube className="w-5 h-5" />,
        website: <Globe className="w-5 h-5" />,
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Header */}
            <header className="border-b border-gray-800">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    {portfolio.headline && (
                        <p className="text-xl text-gray-400">{portfolio.headline}</p>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* About */}
                {portfolio.bio && (
                    <section className="mb-16">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">About</h2>
                        <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {portfolio.bio}
                        </p>
                    </section>
                )}

                {/* Skills */}
                {portfolio.skills && portfolio.skills.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {portfolio.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Projects</h2>
                        <div className="grid gap-8">
                            {projects.map((project) => (
                                <article key={project._id} className="group">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Thumbnail */}
                                        <div className="md:w-64 flex-shrink-0">
                                            {project.mediaType === 'video_external' ? (
                                                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                                    <iframe
                                                        src={project.mediaUrl}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : project.mediaType === 'video_upload' ? (
                                                <video
                                                    src={project.mediaUrl}
                                                    poster={project.thumbnailUrl}
                                                    controls
                                                    className="w-full aspect-video rounded-lg object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={project.mediaUrl}
                                                    alt={project.title}
                                                    className="w-full aspect-video rounded-lg object-cover"
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                                                {project.title}
                                            </h3>
                                            {project.description && (
                                                <p className="text-gray-400 mb-4">{project.description}</p>
                                            )}
                                            {project.tags && project.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {project.tags.map((tag) => (
                                                        <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-3">
                                                {project.projectUrl && (
                                                    <a
                                                        href={project.projectUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
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
                                                        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                                                    >
                                                        <Github className="w-4 h-4" />
                                                        Source
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Social Links */}
                {portfolio.socialLinks && Object.values(portfolio.socialLinks).some(v => v) && (
                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Connect</h2>
                        <div className="flex gap-4">
                            {Object.entries(portfolio.socialLinks).map(([platform, url]) => {
                                if (!url) return null;
                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-all"
                                    >
                                        {socialIcons[platform] || <Globe className="w-5 h-5" />}
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8">
                <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} {user.name}. Powered by Porty.
                </div>
            </footer>
        </div>
    );
}
