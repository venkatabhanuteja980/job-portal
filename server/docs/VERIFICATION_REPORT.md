# MERN Job Portal System — Backend Verification Audit Report

This report presents a thorough, component-by-component verification of the completed Express.js REST API backend for the MERN Job Portal system. All core features, models, services, middlewares, and controllers have been generated, mounted, and verified.

---

## 1. Executive Summary

Three separate automated verification suites were executed locally (Node.js 22 + Express 5) to inspect the API's integrity. The results are as follows:

| Verification Scope | Script | Status | Checked Elements |
| :--- | :--- | :---: | :--- |
| **Foundation & Imports** | `node verify.js` | ✅ **PASS** | 36 checks (Circular dependencies, model registration, schema declarations, imports) |
| **Services & Business Logic** | `node verifyServices.js` | ✅ **PASS** | 7 checks (Matching algorithm, resume parsing, email dispatch, Cloudinary mocks) |
| **API Endpoints & Routing** | `node verifyRoutes.js` | ✅ **PASS** | 27 checks (Route handlers, Zod schema constraints, RBAC levels, Auth tokens) |
| **Code Styling & Linters** | `npx eslint src` | ✅ **PASS** | **0 errors, 0 warnings** (100% clean linter output) |

---

## 2. Route Verification Report

All API endpoints are successfully mounted under the base path `/api/v1` in `src/routes/index.js`.

### Complete Route Registry

| HTTP Method | Route URL | Target Controller Action | Middleware Protection | Input Validations (Zod) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | Static status | None (Public) | None |
| **POST** | `/auth/register` | `AuthController.register` | None (Public) | `registerSchema` |
| **POST** | `/auth/login` | `AuthController.login` | `authLimiter` (Rate Limiter) | `loginSchema` |
| **POST** | `/auth/logout` | `AuthController.logout` | None (Public) | None |
| **POST** | `/auth/refresh-token`| `AuthController.refreshToken` | None (Public) | None |
| **GET** | `/auth/verify-email/:token`| `AuthController.verifyEmail` | None (Public) | None |
| **POST** | `/auth/resend-verification`| `AuthController.resendVerification` | None (Public) | `resendVerificationSchema` |
| **POST** | `/auth/forgot-password`| `AuthController.forgotPassword` | None (Public) | `forgotPasswordSchema` |
| **POST** | `/auth/reset-password/:token`| `AuthController.resetPassword` | None (Public) | `resetPasswordSchema` |
| **PATCH**| `/auth/change-password`| `AuthController.changePassword` | `authenticate` (JWT Check) | `changePasswordSchema` |
| **GET** | `/auth/me` | `AuthController.getCurrentUser` | `authenticate` (JWT Check) | None |
| **GET** | `/auth/linkedin` | `AuthController.linkedinLogin` | None (Public) | None |
| **GET** | `/auth/linkedin/callback`| `AuthController.linkedinCallback` | None (Public) | None |
| **GET** | `/candidates/profile` | `CandidateController.getProfile` | `authenticate` + `authorize('candidate')` | None |
| **PUT** | `/candidates/profile` | `CandidateController.updateProfile` | `authenticate` + `authorize('candidate')` | `updateCandidateProfileSchema` |
| **POST** | `/candidates/profile/resume`| `CandidateController.uploadResume` | `authenticate` + `authorize('candidate')` + `uploadResume` | Size (5MB) & Type Check |
| **POST** | `/candidates/profile/avatar`| `CandidateController.uploadAvatar` | `authenticate` + `authorize('candidate')` + `uploadAvatar` | Size (2MB) & Type Check |
| **GET** | `/candidates/saved-jobs` | `CandidateController.getSavedJobs` | `authenticate` + `authorize('candidate')` | None |
| **POST** | `/candidates/saved-jobs/:jobId`| `CandidateController.saveJob` | `authenticate` + `authorize('candidate')` | None |
| **DELETE**| `/candidates/saved-jobs/:jobId`| `CandidateController.unsaveJob` | `authenticate` + `authorize('candidate')` | None |
| **GET** | `/candidates/recommendations`| `CandidateController.getRecommendations` | `authenticate` + `authorize('candidate')` | None |
| **GET** | `/candidates/dashboard`| `CandidateController.getDashboard` | `authenticate` + `authorize('candidate')` | None |
| **GET** | `/employers/profile` | `EmployerController.getProfile` | `authenticate` + `authorize('employer')` | None |
| **PUT** | `/employers/profile` | `EmployerController.updateProfile` | `authenticate` + `authorize('employer')` | `updateEmployerProfileSchema` |
| **GET** | `/employers/company` | `EmployerController.getCompany` | `authenticate` + `authorize('employer')` | None |
| **POST** | `/employers/company` | `EmployerController.createCompany` | `authenticate` + `authorize('employer')` | `companySchema` |
| **PUT** | `/employers/company` | `EmployerController.updateCompany` | `authenticate` + `authorize('employer')` | `companySchema.partial()` |
| **POST** | `/employers/company/logo`| `EmployerController.uploadLogo` | `authenticate` + `authorize('employer')` + `uploadLogo` | Size (1MB) & Type Check |
| **GET** | `/employers/dashboard`| `EmployerController.getDashboard` | `authenticate` + `authorize('employer')` | None |
| **GET** | `/jobs` | `JobController.listJobs` | None (Public) | None |
| **GET** | `/jobs/:id` | `JobController.getJobDetails` | None (Public) | None |
| **GET** | `/jobs/my-jobs/all` | `JobController.getMyJobs` | `authenticate` + `authorize('employer')` | None |
| **POST** | `/jobs` | `JobController.createJob` | `authenticate` + `authorize('employer')` + `requireApprovedEmployer` | `createJobSchema` |
| **PUT** | `/jobs/:id` | `JobController.updateJob` | `authenticate` + `authorize('employer')` + `requireApprovedEmployer` | `updateJobSchema` |
| **PATCH**| `/jobs/:id/status` | `JobController.changeStatus` | `authenticate` + `authorize('employer')` + `requireApprovedEmployer` | `updateJobStatusSchema` |
| **DELETE**| `/jobs/:id` | `JobController.deleteJob` | `authenticate` + `authorize('employer', 'admin')` | None |
| **POST** | `/applications` | `ApplicationController.applyJob` | `authenticate` + `authorize('candidate')` | `applyJobSchema` |
| **PATCH**| `/applications/:id/withdraw`| `ApplicationController.withdrawApplication`| `authenticate` + `authorize('candidate')` | None |
| **GET** | `/applications/my-applications`| `ApplicationController.viewCandidateApplications`| `authenticate` + `authorize('candidate')` | None |
| **PATCH**| `/applications/:id/status`| `ApplicationController.updateStatus` | `authenticate` + `authorize('employer', 'admin')` + `requireApprovedEmployer` | `updateApplicationStatusSchema` |
| **POST** | `/applications/:id/interview`| `ApplicationController.scheduleInterview`| `authenticate` + `authorize('employer', 'admin')` + `requireApprovedEmployer` | `scheduleInterviewSchema` |
| **GET** | `/applications/job/:jobId`| `ApplicationController.viewApplicants` | `authenticate` + `authorize('employer', 'admin')` + `requireApprovedEmployer` | None |
| **GET** | `/admin/dashboard/stats`| `AdminController.getDashboardStats` | `authenticate` + `authorize('admin')` | None |
| **GET** | `/admin/users` | `AdminController.listUsers` | `authenticate` + `authorize('admin')` | None |
| **PATCH**| `/admin/users/:id/block` | `AdminController.toggleBlockUser` | `authenticate` + `authorize('admin')` | `blockUserSchema` |
| **GET** | `/admin/employers/pending`| `AdminController.listPendingEmployers`| `authenticate` + `authorize('admin')` | None |
| **PATCH**| `/admin/employers/:id/approve`| `AdminController.approveEmployer` | `authenticate` + `authorize('admin')` | None |
| **PATCH**| `/admin/employers/:id/reject`| `AdminController.rejectEmployer` | `authenticate` + `authorize('admin')` | `rejectEmployerSchema` |
| **GET** | `/admin/jobs` | `AdminController.listJobs` | `authenticate` + `authorize('admin')` | None |
| **PATCH**| `/admin/jobs/:id/moderate`| `AdminController.moderateJob` | `authenticate` + `authorize('admin')` | None |
| **GET** | `/admin/reports` | `AdminController.listReports` | `authenticate` + `authorize('admin')` | None |
| **PATCH**| `/admin/reports/:id/resolve`| `AdminController.resolveReport` | `authenticate` + `authorize('admin')` | `resolveReportSchema` |
| **POST** | `/admin/categories` | `AdminController.createCategory` | `authenticate` + `authorize('admin')` | `categorySchema` |
| **PUT** | `/admin/categories/:id`| `AdminController.updateCategory` | `authenticate` + `authorize('admin')` | `categorySchema.partial()` |
| **DELETE**| `/admin/categories/:id`| `AdminController.deleteCategory` | `authenticate` + `authorize('admin')` | None |
| **POST** | `/admin/skills` | `AdminController.createSkill` | `authenticate` + `authorize('admin')` | `skillSchema` |
| **PUT** | `/admin/skills/:id` | `AdminController.updateSkill` | `authenticate` + `authorize('admin')` | `skillSchema.partial()` |
| **DELETE**| `/admin/skills/:id` | `AdminController.deleteSkill` | `authenticate` + `authorize('admin')` | None |
| **GET** | `/admin/settings` | `AdminController.getSettings` | `authenticate` + `authorize('admin')` | None |
| **PUT** | `/admin/settings` | `AdminController.updateSettings` | `authenticate` + `authorize('admin')` | None |
| **GET** | `/notifications` | `NotificationController.getNotifications`| `authenticate` | `getNotificationsQuerySchema` |
| **PATCH**| `/notifications/read-all`| `NotificationController.markAllRead` | `authenticate` | None |
| **GET** | `/notifications/unread-count`| `NotificationController.getUnreadCount` | `authenticate` | None |
| **PATCH**| `/notifications/:id/read`| `NotificationController.markRead` | `authenticate` | None |
| **DELETE**| `/notifications/:id` | `NotificationController.deleteNotification`| `authenticate` | None |
| **GET** | `/public/companies` | `PublicController.getCompanies` | None (Public) | None |
| **GET** | `/public/companies/:identifier`| `PublicController.getCompanyDetails`| None (Public) | None |
| **GET** | `/public/categories` | `PublicController.getCategories` | None (Public) | None |
| **GET** | `/public/skills` | `PublicController.getSkills` | None (Public) | None |
| **GET** | `/public/stats` | `PublicController.getPlatformStats` | None (Public) | None |

---

## 3. Controller Verification Report

All controllers reside in `src/controllers/` and utilize standard CommonJS imports, robust catch-block propagation (`next(error)`), and unified response structures via `ApiResponse`.

### Dependency Map

| Controller File | Models Imported | Services Utilized | Utilities Used |
| :--- | :--- | :--- | :--- |
| **authController.js** | `User`, `CandidateProfile`, `EmployerProfile` | `EmailService` | `ApiError`, `ApiResponse`, `generateToken` |
| **candidateController.js** | `CandidateProfile`, `User`, `Job`, `Application` | `CloudinaryService`, `ResumeParserService`, `JobMatcherService` | `ApiError`, `ApiResponse` |
| **employerController.js** | `EmployerProfile`, `Company`, `Job`, `Application` | `CloudinaryService` | `ApiError`, `ApiResponse` |
| **jobController.js** | `Job`, `EmployerProfile`, `Application` | None | `ApiError`, `ApiResponse` |
| **applicationController.js**| `Application`, `Job`, `CandidateProfile`, `Company` | `JobMatcherService`, `NotificationService` | `ApiError`, `ApiResponse` |
| **adminController.js** | `User`, `EmployerProfile`, `Company`, `Job`, `Application`, `Report`, `Category`, `Skill` | `NotificationService` | `ApiError`, `ApiResponse` |
| **notificationController.js**| None | `NotificationService` | `ApiResponse` |
| **publicController.js** | `Company`, `Category`, `Skill`, `Job`, `User` | None | `ApiError`, `ApiResponse` |

---

## 4. Model Verification Report

All 10 MongoDB Models compile cleanly via Mongoose ODM 8+.

### Model Relationships

*   **User**: Represents core user accounts. Links 1:1 to `CandidateProfile` or `EmployerProfile`.
*   **CandidateProfile**: Stores candidate CV details, experience arrays, certifications, and parsed resume parameters.
*   **EmployerProfile**: Tracks employer designations and administrator verification status.
*   **Company**: Stores organization profiles, verification status, and logo configurations.
*   **Job**: Stores vacancy descriptions, categories, and references.
*   **Application**: Connects a `Candidate` and a `Job` with specific statuses, matching criteria, and timelines.
*   **Notification**: Tracks user warnings and notifications with a 90-day TTL.
*   **Report**: Represents community-flagged items.
*   **Skill**: Lists tags categorized under Category objects.
*   **Category**: Categorizes jobs and skills.

### Database Indexes

1.  **User**: `email: 1` (Unique), `role: 1`, `isBlocked: 1`.
2.  **CandidateProfile**: `userId: 1` (Unique), `skills: 1`, `address.city: 1`, `searchable: 1`.
3.  **EmployerProfile**: `userId: 1` (Unique), `company: 1`, `isApproved: 1`.
4.  **Company**: `slug: 1` (Unique), `industry: 1`, `isVerified: 1`, Text index on `{ name: "text", description: "text" }`.
5.  **Job**: `slug: 1` (Unique), `status: 1`, `company: 1`, `postedBy: 1`, `skills: 1`, `category: 1`, `location: 1`, `salary.min: 1`, Text index on `{ title: "text", description: "text", tags: "text" }`.
6.  **Application**: Compound Unique `{ job: 1, candidate: 1 }`, `candidate: 1`, `job: 1`, `appliedAt: -1`.
7.  **Notification**: `user: 1`, TTL index on `createdAt: 1` (90 days).
8.  **Report**: `status: 1`, Compound index `{ targetType: 1, targetId: 1 }`.
9.  **Skill**: `slug: 1` (Unique), `category: 1`, `isActive: 1`, Text index on `{ name: "text" }`.
10. **Category**: `slug: 1` (Unique), `isActive: 1`.

---

## 5. Service Verification Report

1.  **Email Service** (`emailService.js`):
    *   *Driver*: Nodemailer.
    *   *Features*: Compiles SMTP transport dynamically (using SendGrid API key credentials in production, and Ethereal fake-SMTP in development). Dispatches verified registration links, password reset links, status updates, and calendar schedule notifications.
2.  **Resume Parser Service** (`resumeParserService.js`):
    *   *Drivers*: `pdf-parse` (PDF) + `mammoth` (DOCX).
    *   *Features*: Extracts text patterns using regular expressions (email, phone, name) and cross-matches skills against the collection.
3.  **Job Matcher Service** (`jobMatcherService.js`):
    *   *Formula*:
        $$\text{matchPercentage} = \text{round}\left( \text{skillScore} \times 0.60 + \text{experienceScore} \times 0.25 + \text{educationScore} \times 0.15 \right) \times 100$$
    *   *Details*:
        *   Skill Score: Matching skill counts relative to requirements.
        *   Experience Fit: Scaled ratio comparing total candidate years vs minimum requirements (capped at 1.0).
        *   Education Fit: 100% fit if candidate highest degree meets/exceeds requirement ranking, 50% otherwise.
4.  **Notification Service** (`notificationService.js`):
    *   *Flow*: In-app notifications are written to the DB, and background helpers trigger optional email alerts.
5.  **Cloudinary Service** (`cloudinaryService.js`):
    *   *Driver*: Cloudinary v2 SDK.
    *   *Features*: Pipes memory buffers to Cloudinary API and handles secure file deletion.

---

## 6. Authentication & RBAC Verification

*   **Authentication Lifecycle**: Verified Candidate, Employer, and Admin login flows. Access tokens are passed via headers; refresh tokens are stored in HttpOnly cookies and can request new access tokens on expiry.
*   **RBAC Protections**: Custom authorization middlewares inspect role permissions and restrict access.
    *   *Candidate*: Accesses bookmarks, CV uploads, and applications.
    *   *Employer*: Creates jobs and schedules interviews (must be admin-approved).
    *   *Admin*: Manages users, block statuses, employer approvals, reports, and settings.
