import { MinimalTemplate } from './MinimalTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';

export interface PortfolioData {
    user: {
        name: string;
        subdomain: string;
    };
    portfolio: {
        bio: string;
        headline: string;
        skills: string[];
        socialLinks: {
            website?: string;
            github?: string;
            linkedin?: string;
            twitter?: string;
            instagram?: string;
            youtube?: string;
            dribbble?: string;
            behance?: string;
        };
        templateId?: string;
        customization?: {
            primaryColor?: string;
            secondaryColor?: string;
        };
    };
    projects: Array<{
        _id: string;
        title: string;
        description: string;
        mediaType: 'image' | 'video_upload' | 'video_external';
        mediaUrl: string;
        thumbnailUrl: string;
        externalPlatform?: string;
        tags: string[];
        projectUrl?: string;
        githubUrl?: string;
    }>;
}

export interface TemplateProps {
    data: PortfolioData;
}

export const templates: Record<string, React.ComponentType<TemplateProps>> = {
    minimal: MinimalTemplate,
    creative: CreativeTemplate,
    professional: ProfessionalTemplate,
};

export { MinimalTemplate, CreativeTemplate, ProfessionalTemplate };
