// Video URL parsing utilities for YouTube, Vimeo, and Google Drive

interface VideoInfo {
    platform: 'youtube' | 'vimeo' | 'gdrive';
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
}

export function parseVideoUrl(url: string): VideoInfo | null {
    // YouTube
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            const videoId = match[1];
            return {
                platform: 'youtube',
                videoId,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            };
        }
    }

    // Vimeo
    const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        return {
            platform: 'vimeo',
            videoId,
            embedUrl: `https://player.vimeo.com/video/${videoId}`,
            thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`
        };
    }

    // Google Drive
    const gdrivePattern = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const gdriveMatch = url.match(gdrivePattern);
    if (gdriveMatch) {
        const videoId = gdriveMatch[1];
        return {
            platform: 'gdrive',
            videoId,
            embedUrl: `https://drive.google.com/file/d/${videoId}/preview`,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${videoId}&sz=w1000`
        };
    }

    return null;
}
