'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary Upload Service
 * Handles image uploads with automatic optimization and CDN delivery.
 */
export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file uploaded');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a promise to handle the stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'elevanza-ecommerce',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    const cloudinaryResult = result as any;

    console.log(`Cloudinary upload success: ${cloudinaryResult.secure_url}`);

    return { 
      success: true, 
      url: cloudinaryResult.secure_url 
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return { success: false, error: 'Failed to upload image to Cloudinary' };
  }
}
