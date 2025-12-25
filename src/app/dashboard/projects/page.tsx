'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import {
    Plus, Upload, Video, Image, Loader2, Trash2, Edit2,
    ExternalLink, Eye, EyeOff, X, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
    _id: string;
    title: string;
    description: string;
    mediaType: 'image' | 'video_upload' | 'video_external';
    mediaUrl: string;
    thumbnailUrl: string;
    externalPlatform?: string;
    tags: string[];
    projectUrl: string;
    githubUrl: string;
    isVisible: boolean;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'image' | 'video' | 'external'>('image');
    const [isUploading, setIsUploading] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [tags, setTags] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.getMyProjects();
            const projectsData = response.data as { projects?: Project[] } | undefined;
            if (response.success) {
                setProjects(projectsData?.projects || []);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setTags('');
        setProjectUrl('');
        setGithubUrl('');
        setEditingProject(null);
    };

    const openModal = (type: 'image' | 'video' | 'external') => {
        resetForm();
        setModalType(type);
        setShowModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title || file.name);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('projectUrl', projectUrl);
        formData.append('githubUrl', githubUrl);

        try {
            const response = modalType === 'image'
                ? await api.uploadImage(formData)
                : await api.uploadVideo(formData);

            if (response.success) {
                toast.success('Project uploaded successfully!');
                setShowModal(false);
                fetchProjects();
            }
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleExternalVideo = async () => {
        if (!videoUrl) {
            toast.error('Please enter a video URL');
            return;
        }

        setIsUploading(true);
        try {
            const response = await api.addExternalVideo({
                title: title || 'Untitled Video',
                description,
                videoUrl,
                tags: tags ? tags.split(',').map(t => t.trim()) : [],
            });

            if (response.success) {
                toast.success('Video added successfully!');
                setShowModal(false);
                fetchProjects();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add video');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await api.deleteProject(id);
            toast.success('Project deleted');
            setProjects(projects.filter(p => p._id !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete');
        }
    };

    const toggleVisibility = async (project: Project) => {
        try {
            await api.updateProject(project._id, { isVisible: !project.isVisible });
            setProjects(projects.map(p =>
                p._id === project._id ? { ...p, isVisible: !p.isVisible } : p
            ));
            toast.success(project.isVisible ? 'Project hidden' : 'Project visible');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update');
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Projects</h1>
                    <p className="text-gray-400">Showcase your best work</p>
                </div>
            </div>

            {/* Add buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => openModal('image')}
                    className="card-interactive flex items-center gap-4 p-6"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Image className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Upload Image</p>
                        <p className="text-sm text-gray-400">JPG, PNG, GIF, WebP (10MB)</p>
                    </div>
                </button>

                <button
                    onClick={() => openModal('video')}
                    className="card-interactive flex items-center gap-4 p-6"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Upload Video</p>
                        <p className="text-sm text-gray-400">MP4, WebM, MOV (50MB)</p>
                    </div>
                </button>

                <button
                    onClick={() => openModal('external')}
                    className="card-interactive flex items-center gap-4 p-6"
                >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Video className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">External Video</p>
                        <p className="text-sm text-gray-400">YouTube, Vimeo, Drive</p>
                    </div>
                </button>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-gray-400 mb-4">Start by uploading your first project</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project._id} className="card group relative overflow-hidden">
                            {/* Thumbnail */}
                            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gray-800">
                                {project.thumbnailUrl ? (
                                    <img
                                        src={project.thumbnailUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video className="w-12 h-12 text-gray-600" />
                                    </div>
                                )}

                                {/* Type badge */}
                                <div className="absolute top-2 left-2">
                                    <span className={`badge ${project.mediaType === 'image' ? 'badge-info' :
                                        project.mediaType === 'video_upload' ? 'badge-success' : 'badge-warning'
                                        }`}>
                                        {project.mediaType === 'image' ? 'Image' :
                                            project.mediaType === 'video_upload' ? 'Video' : project.externalPlatform}
                                    </span>
                                </div>

                                {/* Visibility badge */}
                                {!project.isVisible && (
                                    <div className="absolute top-2 right-2">
                                        <span className="badge bg-gray-900/80 text-gray-400 border-gray-700">
                                            Hidden
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <h3 className="font-semibold mb-1 truncate">{project.title}</h3>
                            {project.description && (
                                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                    {project.description}
                                </p>
                            )}

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {project.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleVisibility(project)}
                                    className="btn-ghost p-2"
                                    title={project.isVisible ? 'Hide' : 'Show'}
                                >
                                    {project.isVisible ? (
                                        <Eye className="w-4 h-4" />
                                    ) : (
                                        <EyeOff className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(project._id)}
                                    className="btn-ghost p-2 text-red-400 hover:text-red-300"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {project.projectUrl && (
                                    <a
                                        href={project.projectUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-ghost p-2 ml-auto"
                                        title="View Project"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
                    <div className="relative glass rounded-2xl p-6 w-full max-w-lg animate-fade-in">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-6">
                            {modalType === 'image' ? 'Upload Image' :
                                modalType === 'video' ? 'Upload Video' : 'Add External Video'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="input-field"
                                    placeholder="Project title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input-field min-h-[100px]"
                                    placeholder="Describe your project..."
                                />
                            </div>

                            {modalType === 'external' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Video URL
                                    </label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="input-field"
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        YouTube, Vimeo, or Google Drive link
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="input-field"
                                    placeholder="react, design, web (comma separated)"
                                />
                            </div>

                            {modalType !== 'external' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Select File
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={modalType === 'image' ? 'image/*' : 'video/*'}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-input"
                                    />
                                    <label
                                        htmlFor="file-input"
                                        className="btn-secondary w-full cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Choose {modalType === 'image' ? 'Image' : 'Video'}
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}

                            {modalType === 'external' && (
                                <button
                                    onClick={handleExternalVideo}
                                    disabled={isUploading || !videoUrl}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Add Video
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
