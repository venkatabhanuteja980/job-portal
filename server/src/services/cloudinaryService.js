const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

/**
 * Service to manage file uploads and deletions on Cloudinary.
 */
class CloudinaryService {
  /**
   * Uploads a file buffer to Cloudinary.
   * Converts the memory buffer into a readable stream and pipes it to Cloudinary's upload_stream API.
   * 
   * @param {Buffer} fileBuffer - The buffer of the file uploaded via Multer
   * @param {string} folder - Target folder in Cloudinary (e.g., 'resumes', 'avatars', 'logos')
   * @param {object} options - Custom Cloudinary upload options
   * @returns {Promise<{url: string, publicId: string}>} File URL and public ID from Cloudinary
   */
  static async uploadBuffer(fileBuffer, folder, options = {}) {
    return new Promise((resolve, reject) => {
      if (!fileBuffer) {
        return reject(ApiError.badRequest('File buffer is required for upload'));
      }

      const defaultOptions = {
        folder: `job-portal/${folder}`,
        resource_type: 'auto',
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        { ...defaultOptions, ...options },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(ApiError.internal(`File upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      // Write buffer to stream and end it
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Specialized method to upload candidate resumes.
   * Saves resumes to 'resumes' folder.
   * 
   * @param {Buffer} fileBuffer - Resume file buffer
   * @param {string} originalName - Original filename
   * @returns {Promise<{url: string, publicId: string, originalName: string}>}
   */
  static async uploadResume(fileBuffer, originalName) {
    // Resumes are sensitive, upload as raw or PDF/Docx
    const uploadResult = await this.uploadBuffer(fileBuffer, 'resumes', {
      resource_type: 'raw', // Preserves original document formatting (pdf/docx)
      access_mode: 'public', // Set to public or authenticated. Public makes it easy to download.
    });

    return {
      ...uploadResult,
      originalName,
    };
  }

  /**
   * Specialized method to upload user avatars.
   * Saves to 'avatars' folder and applies resizing transformations.
   * 
   * @param {Buffer} fileBuffer - Avatar image buffer
   * @param {string} userId - ID of the user
   * @returns {Promise<{url: string, publicId: string}>}
   */
  static async uploadAvatar(fileBuffer, userId) {
    return this.uploadBuffer(fileBuffer, 'avatars', {
      resource_type: 'image',
      public_id: `avatar_${userId}_${Date.now()}`,
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
      ],
    });
  }

  /**
   * Specialized method to upload company logos.
   * Saves to 'logos' folder.
   * 
   * @param {Buffer} fileBuffer - Logo image buffer
   * @param {string} companySlug - Slug of the company
   * @returns {Promise<{url: string, publicId: string}>}
   */
  static async uploadLogo(fileBuffer, companySlug) {
    return this.uploadBuffer(fileBuffer, 'logos', {
      resource_type: 'image',
      public_id: `logo_${companySlug}_${Date.now()}`,
      transformation: [
        { width: 150, height: 150, crop: 'fit' },
        { quality: 'auto' },
      ],
    });
  }

  /**
   * Deletes a file from Cloudinary.
   * 
   * @param {string} publicId - The public ID of the resource on Cloudinary
   * @param {string} resourceType - Cloudinary resource type ('image', 'raw', 'video')
   * @returns {Promise<boolean>} Success state of the deletion
   */
  static async deleteFile(publicId, resourceType = 'image') {
    if (!publicId) return false;

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary Deletion Error:', error);
      // We don't block processes if deletion fails (log it and proceed)
      return false;
    }
  }
}

module.exports = CloudinaryService;
