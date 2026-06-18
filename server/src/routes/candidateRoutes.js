const express = require('express');
const CandidateController = require('../controllers/candidateController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { uploadResume, uploadAvatar } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { updateCandidateProfileSchema } = require('../validators/candidateValidator');

const router = express.Router();

// All candidate routes require candidate authentication
router.use(authenticate);
router.use(authorize('candidate'));

// Profile Routes
router.get('/profile', CandidateController.getProfile);
router.put('/profile', validate(updateCandidateProfileSchema), CandidateController.updateProfile);

// File Upload Routes (apply upload rate limits)
router.post('/profile/resume', uploadLimiter, uploadResume, CandidateController.uploadResume);
router.post('/profile/avatar', uploadLimiter, uploadAvatar, CandidateController.uploadAvatar);

// Saved Jobs Routes
router.get('/saved-jobs', CandidateController.getSavedJobs);
router.post('/saved-jobs/:jobId', CandidateController.saveJob);
router.delete('/saved-jobs/:jobId', CandidateController.unsaveJob);

// Recommendation & Dashboard Routes
router.get('/recommendations', CandidateController.getRecommendations);
router.get('/dashboard', CandidateController.getDashboard);

module.exports = router;
