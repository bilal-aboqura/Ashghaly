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
            const response = await fetch(`/api${endpoint}`, {
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
        return this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: { name, email, password, subdomain },
        });
    }

    async login(email: string, password: string) {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    }

    async getMe() {
        return this.request<MeResponse>('/auth/me');
    }

    async checkSubdomain(subdomain: string) {
        return this.request<{ available: boolean }>(`/auth/check-subdomain/${subdomain}`);
    }

    // Portfolio endpoints
    async getMyPortfolio() {
        return this.request('/portfolio/me');
    }

    async updatePortfolio(data: unknown) {
        return this.request('/portfolio/me', {
            method: 'PUT',
            body: data,
        });
    }

    async getPublicPortfolio(subdomain: string) {
        return this.request(`/portfolio/${subdomain}`);
    }

    // Project endpoints
    async getMyProjects(page = 1, limit = 20) {
        return this.request(`/projects/me?page=${page}&limit=${limit}`);
    }

    async uploadImage(formData: FormData) {
        return this.request('/projects/upload/image', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async uploadVideo(formData: FormData) {
        return this.request('/projects/upload/video', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async addExternalVideo(data: { title: string; description?: string; videoUrl: string; tags?: string[] }) {
        return this.request('/projects/external', {
            method: 'POST',
            body: data,
        });
    }

    async updateProject(id: string, data: unknown) {
        return this.request(`/projects/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    async deleteProject(id: string) {
        return this.request(`/projects/${id}`, {
            method: 'DELETE',
        });
    }

    async reorderProjects(projectIds: string[]) {
        return this.request('/projects/reorder', {
            method: 'PUT',
            body: { projectIds },
        });
    }

    // Admin endpoints
    async getAdminStats() {
        return this.request('/admin/stats');
    }

    async getAdminUsers(page = 1, search = '', suspended?: boolean) {
        let url = `/admin/users?page=${page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (suspended !== undefined) url += `&suspended=${suspended}`;
        return this.request(url);
    }

    async suspendUser(id: string, reason: string) {
        return this.request(`/admin/user/${id}`, {
            method: 'PUT',
            body: { action: 'suspend', reason },
        });
    }

    async unsuspendUser(id: string) {
        return this.request(`/admin/user/${id}`, {
            method: 'PUT',
            body: { action: 'unsuspend' },
        });
    }

    async deleteUser(id: string) {
        return this.request(`/admin/user/${id}`, {
            method: 'DELETE',
        });
    }

    async changeUserTemplate(id: string, templateId: string) {
        return this.request(`/admin/user/${id}`, {
            method: 'PUT',
            body: { action: 'changeTemplate', templateId },
        });
    }
}

export const api = new ApiClient();
export type { ApiResponse };
