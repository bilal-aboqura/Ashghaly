/**
 * Video Embed Utility
 * Parses external video URLs and generates embed data
 */

// Regular expressions for video platforms
const patterns = {
    youtube: [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ],
    vimeo: [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/
    ],
    gdrive: [
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
    ]
};

/**
 * Parse video URL and extract platform and ID
 * @param {string} url - Video URL
 * @returns {object|null} - { platform, videoId } or null if not recognized
 */
const parseVideoUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Check YouTube
    for (const pattern of patterns.youtube) {
        const match = url.match(pattern);
        if (match) {
            return { platform: 'youtube', videoId: match[1] };
        }
    }

    // Check Vimeo
    for (const pattern of patterns.vimeo) {
        const match = url.match(pattern);
        if (match) {
            return { platform: 'vimeo', videoId: match[1] };
        }
    }

    // Check Google Drive
    for (const pattern of patterns.gdrive) {
        const match = url.match(pattern);
        if (match) {
            return { platform: 'gdrive', videoId: match[1] };
        }
    }

    return null;
};

/**
 * Generate embed URL for video
 * @param {string} platform - Platform name
 * @param {string} videoId - Video ID
 * @returns {string} - Embed URL
 */
const getEmbedUrl = (platform, videoId) => {
    switch (platform) {
        case 'youtube':
            return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        case 'vimeo':
            return `https://player.vimeo.com/video/${videoId}?dnt=1`;
        case 'gdrive':
            return `https://drive.google.com/file/d/${videoId}/preview`;
        default:
            return null;
    }
};

/**
 * Get thumbnail URL for video
 * @param {string} platform - Platform name
 * @param {string} videoId - Video ID
 * @returns {string} - Thumbnail URL
 */
const getThumbnailUrl = (platform, videoId) => {
    switch (platform) {
        case 'youtube':
            // YouTube provides multiple quality thumbnails
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        case 'vimeo':
            // Vimeo thumbnails require API call, return placeholder
            return `https://vumbnail.com/${videoId}.jpg`;
        case 'gdrive':
            // Google Drive thumbnail
            return `https://drive.google.com/thumbnail?id=${videoId}&sz=w640`;
        default:
            return null;
    }
};

/**
 * Generate embed HTML iframe
 * @param {string} platform - Platform name
 * @param {string} videoId - Video ID
 * @param {object} options - Optional settings
 * @returns {string} - HTML iframe string
 */
const getEmbedHtml = (platform, videoId, options = {}) => {
    const {
        width = '100%',
        height = '100%',
        className = 'video-embed'
    } = options;

    const embedUrl = getEmbedUrl(platform, videoId);

    if (!embedUrl) return null;

    return `<iframe 
    src="${embedUrl}" 
    width="${width}" 
    height="${height}" 
    class="${className}"
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
  ></iframe>`;
};

/**
 * Validate video URL
 * @param {string} url - Video URL
 * @returns {boolean} - Is valid video URL
 */
const isValidVideoUrl = (url) => {
    return parseVideoUrl(url) !== null;
};

/**
 * Get complete video data from URL
 * @param {string} url - Video URL
 * @returns {object|null} - Complete video data or null
 */
const getVideoData = (url) => {
    const parsed = parseVideoUrl(url);

    if (!parsed) return null;

    return {
        platform: parsed.platform,
        videoId: parsed.videoId,
        embedUrl: getEmbedUrl(parsed.platform, parsed.videoId),
        thumbnailUrl: getThumbnailUrl(parsed.platform, parsed.videoId),
        originalUrl: url
    };
};

module.exports = {
    parseVideoUrl,
    getEmbedUrl,
    getThumbnailUrl,
    getEmbedHtml,
    isValidVideoUrl,
    getVideoData
};
