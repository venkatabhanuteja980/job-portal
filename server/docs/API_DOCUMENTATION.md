# MERN Job Portal System — REST API Documentation

Welcome to the REST API documentation for the Job Portal Backend. This document describes the base URL, authentication mechanics, standardized responses, and all API endpoints.

---

## 1. Global Specifications

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Mechanics
The portal uses JSON Web Tokens (JWT) for authentication and Role-Based Access Control (RBAC).
* **Access Token**: Short-lived JWT (15 minutes by default) passed in the `Authorization` header as a Bearer token:
  ```http
  Authorization: Bearer <accessToken>
  ```
* **Refresh Token**: Long-lived JWT (7 days by default) set as an HttpOnly, Secure, SameSite cookie named `refreshToken`. It is used to get a new access token via the `/auth/refresh-token` endpoint.

### Standard Response Format

#### Success Payload
All successful responses return a JSON object with a `success` boolean, a `message` string, and optional `data` and `pagination` objects:
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Payload
All error responses return a `success: false` payload, an error `message`, and an optional array of field-specific validation `errors`:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## 2. API Endpoints

### 2.1 Authentication & Session Management (`/auth`)

#### Register User
* **Method**: `POST`
* **URL**: `/auth/register`
* **Auth**: None (Public)
* **Body (JSON)**:
  ```json
  {
    "firstName": "Alex",
    "lastName": "Smith",
    "email": "alex.smith@example.com",
    "password": "Password@123",
    "role": "candidate" // or "employer"
  }
  ```
* **Success (201)**: Returns candidate/employer details. Fires verification email.

#### Login User
* **Method**: `POST`
* **URL**: `/auth/login`
* **Auth**: None (Rate-limited to 10 requests per 15 minutes)
* **Body (JSON)**:
  ```json
  {
    "email": "alex.smith@example.com",
    "password": "Password@123"
  }
  ```
* **Success (200)**: Returns user info and signed `accessToken`. Sets `refreshToken` cookie.

#### Logout User
* **Method**: `POST`
* **URL**: `/auth/logout`
* **Auth**: None (Clears token cookie)
* **Success (200)**: Clears `refreshToken` cookie.

#### Refresh Access Token
* **Method**: `POST`
* **URL**: `/auth/refresh-token`
* **Auth**: None (Reads `refreshToken` cookie automatically)
* **Success (200)**: Returns a fresh `accessToken`.

#### Verify Email
* **Method**: `GET`
* **URL**: `/auth/verify-email/:token`
* **Auth**: None (Token passed in url path)
* **Success (200)**: Marks user as verified.

#### Resend Email Verification
* **Method**: `POST`
* **URL**: `/auth/resend-verification`
* **Auth**: None
* **Body (JSON)**:
  ```json
  { "email": "alex.smith@example.com" }
  ```
* **Success (200)**: Sends a new email verification token.

#### Forgot Password
* **Method**: `POST`
* **URL**: `/auth/forgot-password`
* **Auth**: None
* **Body (JSON)**:
  ```json
  { "email": "alex.smith@example.com" }
  ```
* **Success (200)**: Sends a password reset token to the user's email.

#### Reset Password
* **Method**: `POST`
* **URL**: `/auth/reset-password/:token`
* **Auth**: None (Token passed in path)
* **Body (JSON)**:
  ```json
  { "password": "NewSecurePassword@456" }
  ```
* **Success (200)**: Updates user password.

#### Change Password
* **Method**: `PATCH`
* **URL**: `/auth/change-password`
* **Auth**: Bearer Token
* **Body (JSON)**:
  ```json
  {
    "currentPassword": "Password@123",
    "newPassword": "NewSecurePassword@456"
  }
  ```
* **Success (200)**: Password changed successfully.

#### Get Current User
* **Method**: `GET`
* **URL**: `/auth/me`
* **Auth**: Bearer Token
* **Success (200)**: Returns verified user payload.

---

### 2.2 Candidate Profiles & Tools (`/candidates`)

#### Get Candidate Profile
* **Method**: `GET`
* **URL**: `/candidates/profile`
* **Auth**: Bearer Token (`candidate` role only)
* **Success (200)**: Returns candidate profile, experience lists, skills, and profile completion percentage.

#### Update Candidate Profile
* **Method**: `PUT`
* **URL**: `/candidates/profile`
* **Auth**: Bearer Token (`candidate` role only)
* **Body (JSON)**:
  ```json
  {
    "phone": "+919988776655",
    "headline": "Full-Stack Software Engineer",
    "summary": "MERN Stack specialist with 3 years experience...",
    "customSkills": ["React", "Express", "Node.js"],
    "address": {
      "street": "123 Tech Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "zipCode": "560001"
    }
  }
  ```

#### Upload & Parse Resume
* **Method**: `POST`
* **URL**: `/candidates/profile/resume`
* **Auth**: Bearer Token (`candidate` role only)
* **Body**: `multipart/form-data` containing the file under field `resume` (PDF/DOCX, max 5MB)
* **Success (200)**: Uploads resume to Cloudinary, extracts contact details/skills, and updates profile.

#### Upload Profile Picture
* **Method**: `POST`
* **URL**: `/candidates/profile/avatar`
* **Auth**: Bearer Token (`candidate` role only)
* **Body**: `multipart/form-data` containing image under field `avatar` (JPEG/PNG, max 2MB)

#### List Saved Jobs
* **Method**: `GET`
* **URL**: `/candidates/saved-jobs`
* **Auth**: Bearer Token (`candidate` role only)

#### Save/Unsave Job
* **Method**: `POST` / `DELETE`
* **URL**: `/candidates/saved-jobs/:jobId`
* **Auth**: Bearer Token (`candidate` role only)

#### Get Job Recommendations
* **Method**: `GET`
* **URL**: `/candidates/recommendations`
* **Auth**: Bearer Token (`candidate` role only)
* **Success (200)**: Ranks platform jobs matching candidate profile parameters.

---

### 2.3 Employer & Company Profiles (`/employers`)

#### Get Employer Profile
* **Method**: `GET`
* **URL**: `/employers/profile`
* **Auth**: Bearer Token (`employer` role only)

#### Update Employer Profile
* **Method**: `PUT`
* **URL**: `/employers/profile`
* **Auth**: Bearer Token (`employer` role only)
* **Body (JSON)**:
  ```json
  {
    "phone": "+447890123456",
    "designation": "Hiring Director",
    "department": "Engineering Operations"
  }
  ```

#### Create Company Profile
* **Method**: `POST`
* **URL**: `/employers/company`
* **Auth**: Bearer Token (`employer` role only)
* **Body (JSON)**:
  ```json
  {
    "name": "Global Tech Corp",
    "website": "https://globaltech.example.com",
    "email": "careers@globaltech.example.com",
    "phone": "02071234567",
    "industry": "Software Services",
    "description": "Premium cloud engineering solutions.",
    "headquarters": "London, UK",
    "locations": ["London", "Remote"],
    "size": "201-500",
    "foundedYear": 2018
  }
  ```

#### Upload Company Logo
* **Method**: `POST`
* **URL**: `/employers/company/logo`
* **Auth**: Bearer Token (`employer` role only)
* **Body**: `multipart/form-data` containing image under field `logo` (JPEG/PNG, max 1MB)

---

### 2.4 Job Management (`/jobs`)

#### List Jobs (Public search)
* **Method**: `GET`
* **URL**: `/jobs`
* **Query Params**: `search`, `location`, `jobType`, `experienceLevel`, `minSalary`, `maxSalary`, `page`, `limit`
* **Auth**: None

#### Create Job Posting
* **Method**: `POST`
* **URL**: `/jobs`
* **Auth**: Bearer Token (`employer` role and must be approved by admin)
* **Body (JSON)**:
  ```json
  {
    "title": "Senior React Developer",
    "description": "Seeking frontend architect for design patterns...",
    "requirements": ["5+ years React", "Redux Toolkit", "TypeScript"],
    "skills": ["66a1a111a111a111a111a111"],
    "location": "London, UK",
    "locationType": "hybrid",
    "salary": {
      "min": 75000,
      "max": 95000,
      "currency": "GBP"
    },
    "experienceLevel": "senior",
    "experienceRequired": { "min": 5 },
    "jobType": "full-time",
    "category": "66a2a222a222a222a222a222",
    "deadline": "2026-09-01T00:00:00.000Z"
  }
  ```

#### Update/Delete Job
* **Method**: `PUT` / `DELETE`
* **URL**: `/jobs/:id`
* **Auth**: Bearer Token (`employer` poster, or `admin`)

---

### 2.5 Job Applications (`/applications`)

#### Apply for a Job
* **Method**: `POST`
* **URL**: `/applications`
* **Auth**: Bearer Token (`candidate` role only)
* **Body (JSON)**:
  ```json
  {
    "jobId": "66a3a333a333a333a333a333",
    "coverLetter": "Excited to apply for this backend position..."
  }
  ```
* **Success (201)**: Computes matching score, files application, alerts employer.

#### Update Application Status
* **Method**: `PATCH`
* **URL**: `/applications/:id/status`
* **Auth**: Bearer Token (`employer` poster, or `admin`)
* **Body (JSON)**:
  ```json
  {
    "status": "shortlisted",
    "note": "Candidate exhibits strong background in microservices."
  }
  ```

#### Schedule Interview
* **Method**: `POST`
* **URL**: `/applications/:id/interview`
* **Auth**: Bearer Token (`employer` poster, or `admin`)
* **Body (JSON)**:
  ```json
  {
    "scheduledDate": "2026-07-10T10:00:00.000Z",
    "scheduledTime": "11:00 AM",
    "type": "video",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "notes": "Bring your laptop for system design walk-through."
  }
  ```

---

### 2.6 Notifications Bell (`/notifications`)

#### Get Notifications
* **Method**: `GET`
* **URL**: `/notifications`
* **Auth**: Bearer Token (All roles)

#### Mark All Read
* **Method**: `PATCH`
* **URL**: `/notifications/read-all`
* **Auth**: Bearer Token

---

### 2.7 Platform Moderation (`/admin`)

#### Get Dashboard Stats
* **Method**: `GET`
* **URL**: `/admin/dashboard/stats`
* **Auth**: Bearer Token (`admin` role only)

#### Block/Unblock User
* **Method**: `PATCH`
* **URL**: `/admin/users/:id/block`
* **Auth**: Bearer Token (`admin` role only)
* **Body (JSON)**:
  ```json
  { "isBlocked": true }
  ```

#### Approve/Reject Employer
* **Method**: `PATCH`
* **URL**: `/admin/employers/:id/approve` or `/admin/employers/:id/reject`
* **Auth**: Bearer Token (`admin` role only)
* **Rejection Body (JSON)**:
  ```json
  { "rejectionReason": "Uploaded company registration does not match company name" }
  ```

#### Skill & Category CRUD
* **Method**: `POST` / `PUT` / `DELETE`
* **URL**: `/admin/skills` and `/admin/categories`
* **Auth**: Bearer Token (`admin` role only)
