const express = require('express');
const ApplicationController = require('../controllers/applicationController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, requireApprovedEmployer } = require('../middleware/rbac');
const {
  applyJobSchema,
  updateApplicationStatusSchema,
  scheduleInterviewSchema,
} = require('../validators/applicationValidator');

const router = express.Router();

// All application routes require authentication
router.use(authenticate);

// ─── Candidate Routes ────────────────────────────────────────────────────────
router.post(
  '/',
  authorize('candidate'),
  validate(applyJobSchema),
  ApplicationController.applyJob
);

router.patch(
  '/:id/withdraw',
  authorize('candidate'),
  ApplicationController.withdrawApplication
);

router.get(
  '/my-applications',
  authorize('candidate'),
  ApplicationController.viewCandidateApplications
);

// ─── Employer / Admin Routes ──────────────────────────────────────────────────
router.patch(
  '/:id/status',
  authorize('employer', 'admin'),
  requireApprovedEmployer,
  validate(updateApplicationStatusSchema),
  ApplicationController.updateStatus
);

router.post(
  '/:id/interview',
  authorize('employer', 'admin'),
  requireApprovedEmployer,
  validate(scheduleInterviewSchema),
  ApplicationController.scheduleInterview
);

router.get(
  '/job/:jobId',
  authorize('employer', 'admin'),
  requireApprovedEmployer,
  ApplicationController.viewApplicants
);

module.exports = router;
