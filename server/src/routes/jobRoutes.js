const express = require('express');
const JobController = require('../controllers/jobController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, requireApprovedEmployer } = require('../middleware/rbac');
const { createJobSchema, updateJobSchema, updateJobStatusSchema } = require('../validators/jobValidator');

const router = express.Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
router.get('/', JobController.listJobs);
router.get('/:id', JobController.getJobDetails);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.use(authenticate);

// Employer-specific Job retrieval
router.get('/my-jobs/all', authorize('employer'), JobController.getMyJobs);

// Job Management (Employer / Admin)
router.post(
  '/',
  authorize('employer'),
  requireApprovedEmployer,
  validate(createJobSchema),
  JobController.createJob
);

router.put(
  '/:id',
  authorize('employer'),
  requireApprovedEmployer,
  validate(updateJobSchema),
  JobController.updateJob
);

router.patch(
  '/:id/status',
  authorize('employer'),
  requireApprovedEmployer,
  validate(updateJobStatusSchema),
  JobController.changeStatus
);

router.delete(
  '/:id',
  authorize('employer', 'admin'),
  JobController.deleteJob
);

module.exports = router;
