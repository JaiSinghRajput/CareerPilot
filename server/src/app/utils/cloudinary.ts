import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export class CloudinaryService {
  /**
   * Uploads a file buffer directly to Cloudinary
   */
  public static async uploadBuffer(buffer: Buffer, originalFileName: string, mimeType: string = 'application/pdf'): Promise<string> {
    return new Promise((resolve, reject) => {
      // Cloudinary upload_stream allows uploading buffers directly without saving to disk
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Auto-detects image, raw, or video
          public_id: `resumes/${Date.now()}_${originalFileName.replace(/\.[^/.]+$/, '')}`, // Strip extension for public_id
          format: 'pdf', // force PDF format for resumes if needed, or remove to auto-detect
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
          reject(new Error('Unknown error during Cloudinary upload'));
        }
      );

      // Write the buffer to the stream and end it
      uploadStream.end(buffer);
    });
  }
}
