import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

let isCloudinaryConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary storage initialized successfully.');
} else {
  console.warn(
    'Cloudinary credentials missing in .env. Falling back to local file hosting under /uploads/.'
  );
}

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    if (isCloudinaryConfigured) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        folder: 'agrismart_crops',
        resource_type: 'image',
      });
      // Delete temporary local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return response.secure_url;
    } else {
      // Local fallback: Return the local relative path relative to server URL
      // We will parse this relative path in the controller and frontend
      const filename = localFilePath.replace(/\\/g, '/').split('/').pop();
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error('Image Upload Error in Cloudinary Helper:', error.message);
    // Return local file path as secondary fallback rather than crashing
    const filename = localFilePath.replace(/\\/g, '/').split('/').pop();
    return `/uploads/${filename}`;
  }
};
