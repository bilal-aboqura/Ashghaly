const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    isFormData?: boolean;
}

// Response types
interface AuthUser {
    id: string;
    name: string;
    email: string;
    subdomain: string;
    role: 'user' | 'admin';
}

interface AuthResponse {
    user: AuthUser;
    token: string;
}

interface MeResponse {
    user: AuthUser;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const { method = 'GET', body, headers = {}, isFormData = false } = options;

        const token = this.getToken();
        const requestHeaders: Record<string, string> = {
            ...headers,
        };

        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        if (!isFormData && body) {
            requestHeaders['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: requestHeaders,
                body: isFormData ? body as BodyInit : body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Network error';
            throw new Error(message);
        }
    }

    // Auth endpoints
    async register(name: string, email: string, password: string, subdomain: string) {
        return this.request<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: { name, email, password, subdomain },
        });
    }

    async login(email: string, password: string) {
        return this.request<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    }

    async getMe() {
        return this.request<MeResponse>('/api/auth/me');
    }

    async checkSubdomain(subdomain: string) {
        return this.request<{ available: boolean }>(`/api/auth/check-subdomain/${subdomain}`);
    }

    // Portfolio endpoints
    async getMyPortfolio() {
        return this.request('/api/portfolio/me');
    }

    async updatePortfolio(data: any) {
        return this.request('/api/portfolio/me', {
            method: 'PUT',
            body: data,
        });
    }

    async getPublicPortfolio(subdomain: string) {
        return this.request(`/api/portfolio/${subdomain}`);
    }

    // Project endpoints
    async getMyProjects(page = 1, limit = 20) {
        return this.request(`/api/projects/me?page=${page}&limit=${limit}`);
    }

    async uploadImage(formData: FormData) {
        return this.request('/api/projects/upload/image', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async uploadVideo(formData: FormData) {
        return this.request('/api/projects/upload/video', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async addExternalVideo(data: { title: string; description?: string; videoUrl: string; tags?: string[] }) {
        return this.request('/api/projects/external', {
            method: 'POST',
            body: data,
        });
    }

    async updateProject(id: string, data: any) {
        return this.request(`/api/projects/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    async deleteProject(id: string) {
        return this.request(`/api/projects/${id}`, {
            method: 'DELETE',
        });
    }

    async reorderProjects(projectIds: string[]) {
        return this.request('/api/projects/reorder', {
            method: 'PUT',
            body: { projectIds },
        });
    }

    // Admin endpoints
    async getAdminStats() {
        return this.request('/api/admin/stats');
    }

    async getAdminUsers(page = 1, search = '', suspended?: boolean) {
        let url = `/api/admin/users?page=${page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (suspended !== undefined) url += `&suspended=${suspended}`;
        return this.request(url);
    }

    async getAdminUserDetails(id: string) {
        return this.request(`/api/admin/user/${id}`);
    }

    async suspendUser(id: string, reason: string) {
        return this.request(`/api/admin/user/${id}/suspend`, {
            method: 'PUT',
            body: { reason },
        });
    }

    async unsuspendUser(id: string) {
        return this.request(`/api/admin/user/${id}/unsuspend`, {
            method: 'PUT',
        });
    }

    async deleteUser(id: string) {
        return this.request(`/api/admin/user/${id}`, {
            method: 'DELETE',
        });
    }

    async changeUserTemplate(id: string, templateId: string) {
        return this.request(`/api/admin/user/${id}/template`, {
            method: 'PUT',
            body: { templateId },
        });
    }
}

export const api = new ApiClient(API_URL);
export type { ApiResponse };
