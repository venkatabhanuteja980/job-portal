const express = require('express');
const AdminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  rejectEmployerSchema,
  blockUserSchema,
  resolveReportSchema,
  categorySchema,
  skillSchema,
} = require('../validators/adminValidator');

const router = express.Router();

// All admin routes require authentication and admin RBAC role
router.use(authenticate);
router.use(authorize('admin'));

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/dashboard/stats', AdminController.getDashboardStats);

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/block', validate(blockUserSchema), AdminController.toggleBlockUser);

// ─── Employer Approval/Rejection ─────────────────────────────────────────────
router.get('/employers/pending', AdminController.listPendingEmployers);
router.patch('/employers/:id/approve', AdminController.approveEmployer);
router.patch('/employers/:id/reject', validate(rejectEmployerSchema), AdminController.rejectEmployer);

// ─── Job Moderation ──────────────────────────────────────────────────────────
router.get('/jobs', AdminController.listJobs);
router.patch('/jobs/:id/moderate', AdminController.moderateJob);

// ─── Report Management ───────────────────────────────────────────────────────
router.get('/reports', AdminController.listReports);
router.patch('/reports/:id/resolve', validate(resolveReportSchema), AdminController.resolveReport);

// ─── Category CRUD ───────────────────────────────────────────────────────────
router.post('/categories', validate(categorySchema), AdminController.createCategory);
router.put('/categories/:id', validate(categorySchema.partial()), AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// ─── Skill CRUD ──────────────────────────────────────────────────────────────
router.post('/skills', validate(skillSchema), AdminController.createSkill);
router.put('/skills/:id', validate(skillSchema.partial()), AdminController.updateSkill);
router.delete('/skills/:id', AdminController.deleteSkill);

// ─── Platform Settings ───────────────────────────────────────────────────────
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

module.exports = router;
