'use client';

import { TemplateProps } from './index';
import { Github, Linkedin, Twitter, Instagram, Youtube, Globe, ExternalLink, Sparkles } from 'lucide-react';

export function CreativeTemplate({ data }: TemplateProps) {
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
        <div className="min-h-screen bg-black text-white">
            {/* Hero */}
            <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm mb-6">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Portfolio
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        {user.name}
                    </h1>
                    {portfolio.headline && (
                        <p className="text-xl md:text-2xl text-gray-300 mb-8">{portfolio.headline}</p>
                    )}

                    {/* Social Links */}
                    {portfolio.socialLinks && Object.values(portfolio.socialLinks).some(v => v) && (
                        <div className="flex justify-center gap-4 mb-12">
                            {Object.entries(portfolio.socialLinks).map(([platform, url]) => {
                                if (!url) return null;
                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:scale-110 transition-all"
                                    >
                                        {socialIcons[platform] || <Globe className="w-5 h-5" />}
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    <a
                        href="#projects"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:scale-105 transition-transform shadow-lg shadow-purple-500/25"
                    >
                        View My Work
                    </a>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
                        <div className="w-1 h-2 bg-white/50 rounded-full" />
                    </div>
                </div>
            </section>

            {/* About */}
            {portfolio.bio && (
                <section className="py-24 px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            About Me
                        </h2>
                        <p className="text-xl text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {portfolio.bio}
                        </p>

                        {/* Skills */}
                        {portfolio.skills && portfolio.skills.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-3">
                                    {portfolio.skills.map((skill, index) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-sm"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <section id="projects" className="py-24 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Featured Projects
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {projects.map((project) => (
                                <article
                                    key={project._id}
                                    className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                                >
                                    {/* Media */}
                                    <div className="aspect-video overflow-hidden">
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
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                                        {project.description && (
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                        )}

                                        {project.tags && project.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.tags.map((tag) => (
                                                    <span key={tag} className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
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
                                                    className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Live Demo
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
                                                    Code
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-12 border-t border-white/10">
                <div className="text-center text-gray-500 text-sm">
                    Made with <span className="text-pink-500">♥</span> by {user.name} • Powered by Porty
                </div>
            </footer>
        </div>
    );
}
