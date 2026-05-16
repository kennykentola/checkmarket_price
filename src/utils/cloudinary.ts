
/**
 * Cloudinary Upload Service
 * Handles uploading images directly to Cloudinary using Unsigned Presets.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfi34idu9';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'; // User needs to provide this

export const uploadToCloudinary = async (file: File | string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'marketcheck_uploads');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    // Return the public_id which our imageHelpers can already handle
    return data.public_id;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
