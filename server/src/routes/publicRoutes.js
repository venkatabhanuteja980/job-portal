const express = require('express');
const PublicController = require('../controllers/publicController');

const router = express.Router();

// Publicly accessible read-only listings and details
router.get('/companies', PublicController.getCompanies);
router.get('/companies/:identifier', PublicController.getCompanyDetails);
router.get('/categories', PublicController.getCategories);
router.get('/skills', PublicController.getSkills);
router.get('/stats', PublicController.getPlatformStats);

module.exports = router;
