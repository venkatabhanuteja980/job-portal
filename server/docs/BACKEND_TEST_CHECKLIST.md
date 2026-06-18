# MERN Job Portal System — Backend Test Checklist

This checklist defines all key backend test scenarios, their validation targets, and their verification status.

---

## 1. Authentication & Session Management

- [x] **Candidate Registration**:
  - Valid payload creates candidate `User` and empty `CandidateProfile`.
  - Duplicate email throws 409 conflict.
  - Returns verification link in email template.
- [x] **Employer Registration**:
  - Valid payload creates employer `User` and empty `EmployerProfile`.
- [x] **Email Verification**:
  - Correct token transitions `isVerified` to `true`.
  - Expired token throws 400 bad request.
- [x] **User Login**:
  - Correct credentials return access token and set refresh cookie.
  - Invalid password returns 401 unauthorized.
  - Blocked user fails to log in.
- [x] **Token Refresh**:
  - Valid refresh cookie returns new access token.
  - Cleared/expired refresh cookie fails.
- [x] **Password Reset Workflow**:
  - Request link generates token and email.
  - Reset token updates password and invalidates token.

---

## 2. Profile Management

- [x] **Candidate Profile CRUD**:
  - Profile updates calculate profile completion score (e.g. 10% name, 15% skills).
  - Unauthorized roles blocked from candidate profile routes.
- [x] **Resume Upload**:
  - Valid PDF/DOCX pipes to Cloudinary and triggers parser.
  - Parser extracts email, phone, name, and parses matched skills.
  - Large files (> 5MB) or invalid formats rejected.
- [x] **Employer Profile**:
  - Update profile designation and company reference.
- [x] **Company Profile**:
  - Creating profile auto-generates URL slug using name.
  - Uploading logo updates company logo object.

---

## 3. Job Postings & Moderation

- [x] **Create Job**:
  - Only approved employers can post jobs.
  - Auto-generates unique slug with suffix.
  - Compiles references for Category and Skills.
- [x] **Job Search & Filter**:
  - Public search supports keyword text matching and filters (salary, job type).
  - Returns metadata pagination blocks.
- [x] **Close/Reopen Job**:
  - Employer poster can toggle status between `active` and `closed`.
- [x] **Admin Moderation**:
  - Admins can delete or moderate any job posting.

---

## 4. Application Pipeline

- [x] **Submit Application**:
  - Candidate applies with optional cover letter.
  - Application checks for duplicate submission (compound unique index).
  - Triggers Job Matcher service (skills, education, experience scores).
  - Emits in-app and email notifications to employer.
- [x] **Status Lifecycle**:
  - Employer updates status (e.g. `applied` -> `shortlisted`).
  - Appends timeline entry and notifies candidate.
- [x] **Schedule Interview**:
  - Employer schedules interview (date, time, link, notes).
  - Triggers notifications and updates application state.
- [x] **Withdraw Application**:
  - Candidate can withdraw application at any point.

---

## 5. System Administration

- [x] **Block User**:
  - Admin blocks user profile. Immediately terminates access on next token refresh.
- [x] **Approve Employer**:
  - Admin reviews and approves employer, granting job-posting privileges.
- [x] **Report Resolution**:
  - Admin resolves spam/fake job flags.
- [x] **Category & Skill CRUD**:
  - Admin creates and manages the database skill tags and job categories.
