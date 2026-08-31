import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export class CloudinaryService {
    /**
     * Uploads a file buffer directly to Cloudinary
     */
    static async uploadBuffer(buffer, originalFileName, mimeType = 'application/pdf') {
        return new Promise((resolve, reject) => {
            // Cloudinary upload_stream allows uploading buffers directly without saving to disk
            const uploadStream = cloudinary.uploader.upload_stream({
                resource_type: 'auto', // Auto-detects image, raw, or video
                public_id: `resumes/${Date.now()}_${originalFileName.replace(/\.[^/.]+$/, '')}`, // Strip extension for public_id
                format: 'pdf', // force PDF format for resumes if needed, or remove to auto-detect
            }, (error, result) => {
                if (error)
                    return reject(error);
                if (result)
                    return resolve(result.secure_url);
                reject(new Error('Unknown error during Cloudinary upload'));
            });
            // Write the buffer to the stream and end it
            uploadStream.end(buffer);
        });
    }
}
//# sourceMappingURL=cloudinary.js.map