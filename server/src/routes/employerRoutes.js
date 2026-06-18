const express = require('express');
const EmployerController = require('../controllers/employerController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { uploadLogo } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { updateEmployerProfileSchema, companySchema } = require('../validators/employerValidator');

const router = express.Router();

// All employer routes require employer authentication
router.use(authenticate);
router.use(authorize('employer'));

// Employer Profile Routes
router.get('/profile', EmployerController.getProfile);
router.put('/profile', validate(updateEmployerProfileSchema), EmployerController.updateProfile);

// Company Routes
router.get('/company', EmployerController.getCompany);
router.post('/company', validate(companySchema), EmployerController.createCompany);
router.put('/company', validate(companySchema.partial()), EmployerController.updateCompany);

// Logo Upload Route
router.post('/company/logo', uploadLimiter, uploadLogo, EmployerController.uploadLogo);

// Dashboard Analytics Route
router.get('/dashboard', EmployerController.getDashboard);

module.exports = router;
