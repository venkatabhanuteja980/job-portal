const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZES } = require('../utils/constants');

// Use memory storage (buffer) — files stream to Cloudinary, not saved to disk
const storage = multer.memoryStorage();

/**
 * Create a multer upload middleware with configurable options.
 * @param {'resume' | 'image' | 'logo'} type - Type of file to accept
 * @returns {multer.Multer} Configured multer instance
 */
const createUploader = (type) => {
  let allowedTypes;
  let maxSize;

  switch (type) {
    case 'resume':
      allowedTypes = ALLOWED_FILE_TYPES.RESUME;
      maxSize = MAX_FILE_SIZES.RESUME;
      break;
    case 'image':
      allowedTypes = ALLOWED_FILE_TYPES.IMAGE;
      maxSize = MAX_FILE_SIZES.IMAGE;
      break;
    case 'logo':
      allowedTypes = ALLOWED_FILE_TYPES.IMAGE;
      maxSize = MAX_FILE_SIZES.LOGO;
      break;
    default:
      throw new Error(`Unknown upload type: ${type}`);
  }

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          ApiError.badRequest(
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
          ),
          false
        );
      }
    },
  });
};

/** Resume upload middleware (single file, field name: 'resume') */
const uploadResume = createUploader('resume').single('resume');

/** Avatar upload middleware (single file, field name: 'avatar') */
const uploadAvatar = createUploader('image').single('avatar');

/** Company logo upload middleware (single file, field name: 'logo') */
const uploadLogo = createUploader('logo').single('logo');

module.exports = { uploadResume, uploadAvatar, uploadLogo, createUploader };
