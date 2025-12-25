import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadToCloudinary(
    buffer: Buffer,
    options: { folder: string; resourceType: 'image' | 'video' }
): Promise<{ url: string; publicId: string; thumbnailUrl?: string }> {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: options.folder,
            resource_type: options.resourceType,
        };

        if (options.resourceType === 'image') {
            uploadOptions.transformation = [
                { width: 1920, height: 1080, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ];
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    const response: any = {
                        url: result.secure_url,
                        publicId: result.public_id
                    };

                    if (options.resourceType === 'video') {
                        response.thumbnailUrl = result.secure_url.replace(/\.[^.]+$/, '.jpg');
                    }

                    resolve(response);
                }
            }
        );

        uploadStream.end(buffer);
    });
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
    }
}

export { cloudinary };
