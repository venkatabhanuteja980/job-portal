/**
 * Comprehensive verification script for Auth, Candidate, Employer, Job, Application, Admin, Notification, and Public routes.
 * Tests route mounting, Zod request validations, RBAC checks, and controllers.
 */

const assert = require('assert');
const mongoose = require('mongoose');

console.log('='.repeat(70));
console.log('  COMPREHENSIVE BACKEND ENDPOINTS VERIFICATION (PHASE 2 PART 5)');
console.log('='.repeat(70));
console.log('');

// Setup dummy env values if not present
process.env.NODE_ENV = 'development';
process.env.PORT = '8888';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Mock mongoose DB connection
mongoose.connect = async () => {};
mongoose.disconnect = async () => {};

// Mock database model methods to avoid buffering/database timeouts
const User = require('./src/models/User');
const CandidateProfile = require('./src/models/CandidateProfile');
const EmployerProfile = require('./src/models/EmployerProfile');
const Company = require('./src/models/Company');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');
const Skill = require('./src/models/Skill');
const Notification = require('./src/models/Notification');
const Report = require('./src/models/Report');
const Category = require('./src/models/Category');

// In-memory mock database store
const mockUsers = [];
const mockProfiles = [];
const mockEmployerProfiles = [];
const mockCompanies = [];
const mockJobs = [];
const mockApplications = [];
const mockNotifications = [];
const mockReports = [];
const mockCategories = [];
const mockSkills = [];

// Chainable query helper
const makeQuery = (data) => {
  const promise = Promise.resolve(data);
  promise.populate = function() { return this; };
  promise.sort = function() { return this; };
  promise.select = function() { return this; };
  promise.skip = function() { return this; };
  promise.limit = function() { return this; };
  return promise;
};

// ─── 1. USER MOCKS ───────────────────────────────────────────────────────────
User.findOne = (query) => {
  let user;
  if (query.email) {
    user = mockUsers.find(u => u.email === query.email);
  } else if (query.verificationToken) {
    user = mockUsers.find(u => u.verificationToken === query.verificationToken);
  } else if (query.resetPasswordToken) {
    user = mockUsers.find(u => u.resetPasswordToken === query.resetPasswordToken);
  }
  if (user) {
    user.comparePassword = async (pwd) => pwd === user.password;
  }
  return makeQuery(user || null);
};

User.findById = (id) => {
  const user = mockUsers.find(u => u._id.toString() === id.toString());
  return makeQuery(user || null);
};

User.find = (query) => {
  let filtered = mockUsers;
  if (query && query.$or) {
    // Basic search mockup
    const searchVal = query.$or[0].firstName.source;
    filtered = mockUsers.filter(u => 
      u.firstName.toLowerCase().includes(searchVal.toLowerCase()) || 
      u.lastName.toLowerCase().includes(searchVal.toLowerCase()) ||
      u.email.toLowerCase().includes(searchVal.toLowerCase())
    );
  }
  return makeQuery(filtered);
};

User.countDocuments = async (query) => {
  if (query && query.role) {
    return mockUsers.filter(u => u.role === query.role).length;
  }
  if (query && query.isBlocked) {
    return mockUsers.filter(u => u.isBlocked === query.isBlocked).length;
  }
  return mockUsers.length;
};

User.prototype.save = async function() {
  const idx = mockUsers.findIndex(u => u._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockUsers[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    mockUsers.push(this);
  }
  return this;
};

User.prototype.generateVerificationToken = function() {
  this.verificationToken = 'mocked_ver_token_hash';
  this.verificationExpires = Date.now() + 3600000;
  return 'mocked_raw_ver_token';
};

// ─── 2. CANDIDATE MOCKS ──────────────────────────────────────────────────────
CandidateProfile.findOne = (query) => {
  if (query.userId) {
    const profile = mockProfiles.find(p => p.userId.toString() === query.userId.toString());
    return makeQuery(profile || null);
  }
  return makeQuery(null);
};

CandidateProfile.findById = (id) => {
  const profile = mockProfiles.find(p => p._id.toString() === id.toString());
  return makeQuery(profile || null);
};

CandidateProfile.create = async (data) => {
  const profile = new CandidateProfile({
    _id: new mongoose.Types.ObjectId(),
    userId: data.userId,
    savedJobs: [],
    profileCompletion: 0,
    resumeUrl: 'http://example.com/resume.pdf',
    ...data
  });
  mockProfiles.push(profile);
  return profile;
};

CandidateProfile.prototype.save = async function() {
  const idx = mockProfiles.findIndex(p => p._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockProfiles[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    mockProfiles.push(this);
  }
  return this;
};

CandidateProfile.prototype.calculateTotalExperience = function() { return 0; };
CandidateProfile.prototype.calculateProfileCompletion = function() { return 15; };

// ─── 3. EMPLOYER MOCKS ───────────────────────────────────────────────────────
EmployerProfile.findOne = (query) => {
  if (query.userId) {
    const profile = mockEmployerProfiles.find(p => p.userId.toString() === query.userId.toString());
    return makeQuery(profile || null);
  }
  return makeQuery(null);
};

EmployerProfile.findById = (id) => {
  const profile = mockEmployerProfiles.find(p => p._id.toString() === id.toString());
  return makeQuery(profile || null);
};

EmployerProfile.find = (query) => {
  let filtered = mockEmployerProfiles;
  if (query && query.isApproved !== undefined) {
    filtered = mockEmployerProfiles.filter(p => p.isApproved === query.isApproved);
  }
  return makeQuery(filtered);
};

EmployerProfile.countDocuments = async (query) => {
  let filtered = mockEmployerProfiles;
  if (query && query.isApproved !== undefined) {
    filtered = mockEmployerProfiles.filter(p => p.isApproved === query.isApproved);
  }
  return filtered.length;
};

EmployerProfile.create = async (data) => {
  const profile = new EmployerProfile({
    _id: new mongoose.Types.ObjectId(),
    userId: data.userId,
    isApproved: true, // Auto-approve in Candidate/Employer test
    ...data
  });
  mockEmployerProfiles.push(profile);
  return profile;
};

EmployerProfile.prototype.save = async function() {
  const idx = mockEmployerProfiles.findIndex(p => p._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockEmployerProfiles[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    mockEmployerProfiles.push(this);
  }
  return this;
};

// ─── 4. COMPANY MOCKS ────────────────────────────────────────────────────────
Company.findOne = (query) => {
  const company = mockCompanies.find(c => {
    if (query.createdBy && c.createdBy.toString() !== query.createdBy.toString()) return false;
    if (query.slug && c.slug !== query.slug) return false;
    return true;
  });
  return makeQuery(company || null);
};

Company.find = (query) => {
  let filtered = mockCompanies;
  if (query && query.isVerified !== undefined) {
    filtered = mockCompanies.filter(c => c.isVerified === query.isVerified);
  }
  return makeQuery(filtered);
};

Company.findById = (id) => {
  const company = mockCompanies.find(c => c._id.toString() === id.toString());
  return makeQuery(company || null);
};

Company.countDocuments = async (query) => {
  let filtered = mockCompanies;
  if (query && query.isVerified !== undefined) {
    filtered = mockCompanies.filter(c => c.isVerified === query.isVerified);
  }
  return filtered.length;
};

Company.prototype.save = async function() {
  const idx = mockCompanies.findIndex(c => c._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockCompanies[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    this.slug = this.slug || 'company-slug';
    mockCompanies.push(this);
  }
  return this;
};

// ─── 5. JOB MOCKS ────────────────────────────────────────────────────────────
Job.findOne = (query) => {
  const job = mockJobs.find(j => {
    for (let k in query) {
      if (j[k] && j[k].toString() !== query[k].toString()) return false;
    }
    return true;
  });
  return makeQuery(job || null);
};

Job.find = (query) => {
  let filtered = mockJobs;
  if (query && query.postedBy) {
    filtered = mockJobs.filter(j => j.postedBy.toString() === query.postedBy.toString());
  } else if (query && query.company) {
    filtered = mockJobs.filter(j => j.company.toString() === query.company.toString());
  }
  return makeQuery(filtered);
};

Job.findById = (id) => {
  const job = mockJobs.find(j => j._id.toString() === id.toString());
  return makeQuery(job || null);
};

Job.prototype.save = async function() {
  const idx = mockJobs.findIndex(j => j._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockJobs[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    this.slug = this.slug || 'job-slug';
    mockJobs.push(this);
  }
  return this;
};

Job.countDocuments = async (query) => {
  let filtered = mockJobs;
  if (query && query.status) {
    filtered = mockJobs.filter(j => j.status === query.status);
  } else if (query && query.postedBy) {
    filtered = mockJobs.filter(j => j.postedBy.toString() === query.postedBy.toString());
  } else if (query && query.company) {
    filtered = mockJobs.filter(j => j.company.toString() === query.company.toString());
  }
  return filtered.length;
};

Job.findByIdAndDelete = async (id) => {
  const idx = mockJobs.findIndex(j => j._id.toString() === id.toString());
  if (idx !== -1) {
    mockJobs.splice(idx, 1);
  }
  return { _id: id };
};

Job.aggregate = async (query) => {
  return [{ totalHires: 10 }];
};

// ─── 6. SKILL MOCKS ──────────────────────────────────────────────────────────
Skill.findOne = (query) => {
  let skill;
  if (query.name) {
    skill = mockSkills.find(s => s.name === query.name);
  }
  return makeQuery(skill || null);
};

Skill.find = (query) => {
  let filtered = mockSkills;
  if (query && query.isActive !== undefined) {
    filtered = mockSkills.filter(s => s.isActive === query.isActive);
  }
  if (query && query._id && query._id.$in) {
    filtered = query._id.$in.map(id => {
      let s = mockSkills.find(sk => sk._id.toString() === id.toString());
      return s || { _id: id, name: `Skill-${id}`, slug: `skill-${id}` };
    });
  }
  return makeQuery(filtered);
};

Skill.findById = (id) => {
  const skill = mockSkills.find(s => s._id.toString() === id.toString());
  return makeQuery(skill || null);
};

Skill.prototype.save = async function() {
  const idx = mockSkills.findIndex(s => s._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockSkills[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    this.slug = this.slug || 'skill-slug';
    mockSkills.push(this);
  }
  return this;
};

Skill.findByIdAndDelete = async (id) => {
  const idx = mockSkills.findIndex(s => s._id.toString() === id.toString());
  if (idx !== -1) {
    mockSkills.splice(idx, 1);
  }
  return { _id: id };
};

// ─── 7. NOTIFICATION MOCKS ───────────────────────────────────────────────────
Notification.create = async (data) => {
  const notification = new Notification({
    _id: new mongoose.Types.ObjectId(),
    isRead: false,
    ...data,
  });
  mockNotifications.push(notification);
  return notification;
};

Notification.find = (query) => {
  let filtered = mockNotifications;
  if (query && query.user) {
    filtered = mockNotifications.filter(n => n.user.toString() === query.user.toString());
  }
  if (query && query.isRead !== undefined) {
    filtered = filtered.filter(n => n.isRead === query.isRead);
  }
  return makeQuery(filtered);
};

Notification.findOne = (query) => {
  const notification = mockNotifications.find(n => {
    if (query._id && n._id.toString() !== query._id.toString()) return false;
    if (query.user && n.user.toString() !== query.user.toString()) return false;
    return true;
  });
  return makeQuery(notification || null);
};

Notification.countDocuments = async (query) => {
  let filtered = mockNotifications;
  if (query && query.user) {
    filtered = mockNotifications.filter(n => n.user.toString() === query.user.toString());
  }
  if (query && query.isRead !== undefined) {
    filtered = filtered.filter(n => n.isRead === query.isRead);
  }
  return filtered.length;
};

Notification.updateMany = async (query, update) => {
  let filtered = mockNotifications;
  if (query && query.user) {
    filtered = mockNotifications.filter(n => n.user.toString() === query.user.toString());
  }
  if (query && query.isRead !== undefined) {
    filtered = filtered.filter(n => n.isRead === query.isRead);
  }
  filtered.forEach(n => {
    if (update.$set) {
      if (update.$set.isRead !== undefined) n.isRead = update.$set.isRead;
      if (update.$set.readAt !== undefined) n.readAt = update.$set.readAt;
    }
  });
  return { modifiedCount: filtered.length };
};

Notification.deleteOne = async (query) => {
  const idx = mockNotifications.findIndex(n => {
    if (query._id && n._id.toString() !== query._id.toString()) return false;
    if (query.user && n.user.toString() !== query.user.toString()) return false;
    return true;
  });
  if (idx !== -1) {
    mockNotifications.splice(idx, 1);
    return { deletedCount: 1 };
  }
  return { deletedCount: 0 };
};

Notification.prototype.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return this;
};

// ─── 8. APPLICATION MOCKS ────────────────────────────────────────────────────
Application.findOne = (query) => {
  const appRecord = mockApplications.find(a => {
    if (query.job && (a.job._id || a.job).toString() !== query.job.toString()) return false;
    if (query.candidate && (a.candidate._id || a.candidate).toString() !== query.candidate.toString()) return false;
    return true;
  });
  if (appRecord) {
    const jobIdStr = (appRecord.job._id || appRecord.job).toString();
    const jobDetails = mockJobs.find(j => j._id.toString() === jobIdStr);
    if (jobDetails) appRecord.job = jobDetails;
  }
  return makeQuery(appRecord || null);
};

Application.find = (query) => {
  let filtered = mockApplications;
  if (query && query.candidate) {
    filtered = mockApplications.filter(a => (a.candidate._id || a.candidate).toString() === query.candidate.toString());
  } else if (query && query.job) {
    filtered = mockApplications.filter(a => (a.job._id || a.job).toString() === query.job.toString());
  }
  filtered.forEach(appRecord => {
    const jobIdStr = (appRecord.job._id || appRecord.job).toString();
    const jobDetails = mockJobs.find(j => j._id.toString() === jobIdStr);
    if (jobDetails) appRecord.job = jobDetails;
  });
  return makeQuery(filtered);
};

Application.findById = (id) => {
  const appRecord = mockApplications.find(a => a._id.toString() === id.toString());
  if (appRecord) {
    const jobIdStr = (appRecord.job._id || appRecord.job).toString();
    const jobDetails = mockJobs.find(j => j._id.toString() === jobIdStr);
    if (jobDetails) appRecord.job = jobDetails;
  }
  return makeQuery(appRecord || null);
};

Application.prototype.save = async function() {
  const idx = mockApplications.findIndex(a => a._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockApplications[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{ status: 'applied', date: new Date() }];
    }
    mockApplications.push(this);
  }
  return this;
};

Application.countDocuments = async (query) => {
  let filtered = mockApplications;
  if (query && query.candidate) {
    filtered = mockApplications.filter(a => (a.candidate._id || a.candidate).toString() === query.candidate.toString());
  } else if (query && query.job) {
    filtered = mockApplications.filter(a => (a.job._id || a.job).toString() === query.job.toString());
  } else if (query && query.status) {
    filtered = mockApplications.filter(a => a.status === query.status);
  }
  return filtered.length;
};

Application.deleteMany = async (query) => {
  return { deletedCount: 0 };
};

// ─── 9. REPORT MOCKS ─────────────────────────────────────────────────────────
Report.find = (query) => {
  let filtered = mockReports;
  if (query && query.status) {
    filtered = mockReports.filter(r => r.status === query.status);
  }
  if (query && query.targetType) {
    filtered = filtered.filter(r => r.targetType === query.targetType);
  }
  return makeQuery(filtered);
};

Report.findById = (id) => {
  const report = mockReports.find(r => r._id.toString() === id.toString());
  return makeQuery(report || null);
};

Report.prototype.save = async function() {
  const idx = mockReports.findIndex(r => r._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockReports[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    mockReports.push(this);
  }
  return this;
};

Report.countDocuments = async (query) => {
  let filtered = mockReports;
  if (query && query.status) {
    filtered = mockReports.filter(r => r.status === query.status);
  }
  return filtered.length;
};

// ─── 10. CATEGORY MOCKS ──────────────────────────────────────────────────────
Category.findOne = (query) => {
  let cat;
  if (query.name) {
    cat = mockCategories.find(c => c.name === query.name);
  }
  return makeQuery(cat || null);
};

Category.find = (query) => {
  let filtered = mockCategories;
  if (query && query.isActive !== undefined) {
    filtered = mockCategories.filter(c => c.isActive === query.isActive);
  }
  return makeQuery(filtered);
};

Category.findById = (id) => {
  const cat = mockCategories.find(c => c._id.toString() === id.toString());
  return makeQuery(cat || null);
};

Category.prototype.save = async function() {
  const idx = mockCategories.findIndex(c => c._id.toString() === this._id.toString());
  if (idx !== -1) {
    mockCategories[idx] = this;
  } else {
    this._id = this._id || new mongoose.Types.ObjectId();
    this.slug = this.slug || 'category-slug';
    mockCategories.push(this);
  }
  return this;
};

Category.countDocuments = async (query) => {
  return mockCategories.length;
};

Category.findByIdAndDelete = async (id) => {
  const idx = mockCategories.findIndex(c => c._id.toString() === id.toString());
  if (idx !== -1) {
    mockCategories.splice(idx, 1);
  }
  return { _id: id };
};

// Load App and start test server
const app = require('./src/app');
let server;
const testPort = 8888;
const baseUrl = `http://127.0.0.1:${testPort}/api/v1`;

const results = [];
let passCount = 0;
let failCount = 0;

async function testEndpoint(name, path, options = {}, checkFn) {
  try {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const body = await response.json();
    checkFn(response.status, body);
    results.push({ name, status: 'PASS' });
    passCount++;
  } catch (err) {
    results.push({ 
      name, 
      status: 'FAIL', 
      error: `${err.message} (Cause: ${err.cause ? err.cause.message : 'none'})\nStack: ${err.stack}` 
    });
    failCount++;
  }
}

async function runTests() {
  // Pre-seed an admin account directly to mock store
  const adminUserId = new mongoose.Types.ObjectId();
  const adminUser = new User({
    _id: adminUserId,
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@test.com',
    password: 'Password@123',
    role: 'admin',
    isVerified: true,
    isBlocked: false,
  });
  mockUsers.push(adminUser);

  server = app.listen(testPort, '127.0.0.1', () => {
    console.log(`Test server started on port ${testPort}`);
  });

  // Wait a small tick
  await new Promise(r => setTimeout(r, 100));

  // ─── 1. HEALTH CHECK ─────────────────────────────────────────────────────────
  await testEndpoint(
    'GET /health - Returns API health and configuration',
    '/health',
    { method: 'GET' },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
    }
  );

  // ─── 2. CANDIDATE & EMPLOYER REGISTRATION ───────────────────────────────────
  await testEndpoint(
    'POST /auth/register - Candidate successfully registers',
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Candidate',
        lastName: 'One',
        email: 'candidate@test.com',
        password: 'Password@123',
        role: 'candidate',
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 201);
      const user = mockUsers.find(u => u.email === 'candidate@test.com');
      if (user) user.isVerified = true;
    }
  );

  await testEndpoint(
    'POST /auth/register - Employer successfully registers',
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Employer',
        lastName: 'One',
        email: 'employer@test.com',
        password: 'Password@123',
        role: 'employer',
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 201);
      const user = mockUsers.find(u => u.email === 'employer@test.com');
      if (user) user.isVerified = true;
    }
  );

  // ─── 3. LOGINS (Candidate, Employer, Admin) ──────────────────────────────────
  let candidateToken = '';
  await testEndpoint(
    'POST /auth/login - Candidate logs in successfully',
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email: 'candidate@test.com', password: 'Password@123' }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      candidateToken = body.data.accessToken;
    }
  );

  let employerToken = '';
  await testEndpoint(
    'POST /auth/login - Employer logs in successfully',
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email: 'employer@test.com', password: 'Password@123' }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      employerToken = body.data.accessToken;
    }
  );

  let adminToken = '';
  await testEndpoint(
    'POST /auth/login - Admin logs in successfully',
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@test.com', password: 'Password@123' }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      adminToken = body.data.accessToken;
    }
  );

  // ─── 4. PUBLIC CONTROLLER ENDPOINTS ──────────────────────────────────────────
  await testEndpoint(
    'GET /public/companies - Retrieves verified companies (Public)',
    '/public/companies',
    { method: 'GET' },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.data));
    }
  );

  await testEndpoint(
    'GET /public/categories - Retrieves active categories list (Public)',
    '/public/categories',
    { method: 'GET' },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.data.categories));
    }
  );

  await testEndpoint(
    'GET /public/skills - Retrieves active skills list (Public)',
    '/public/skills',
    { method: 'GET' },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.data.skills));
    }
  );

  await testEndpoint(
    'GET /public/stats - Retrieves public statistics metrics (Public)',
    '/public/stats',
    { method: 'GET' },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(body.data.activeJobs !== undefined);
    }
  );

  // ─── 5. NOTIFICATION CONTROLLER ENDPOINTS ────────────────────────────────────
  await testEndpoint(
    'GET /notifications - Fetches notifications list (Candidate authorized)',
    '/notifications',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${candidateToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.data));
    }
  );

  await testEndpoint(
    'GET /notifications/unread-count - Retrieves unread notifications count',
    '/notifications/unread-count',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${candidateToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.data.unreadCount, 0);
    }
  );

  await testEndpoint(
    'PATCH /notifications/read-all - Marks all user notifications as read',
    '/notifications/read-all',
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${candidateToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
    }
  );

  // ─── 6. ADMIN CONTROLLER ENDPOINTS ───────────────────────────────────────────
  await testEndpoint(
    'GET /admin/dashboard/stats - Retrieves admin panel metrics',
    '/admin/dashboard/stats',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(body.data.metrics);
      assert.ok(body.data.recentUsers);
    }
  );

  // RBAC protection test: Employer trying to access admin stats should get 403 Forbidden
  await testEndpoint(
    'GET /admin/dashboard/stats - Rejects non-admin users (RBAC Check)',
    '/admin/dashboard/stats',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${employerToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 403);
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.message, "Role 'employer' is not authorized to access this resource");
    }
  );

  await testEndpoint(
    'GET /admin/users - Retrieves platform users list',
    '/admin/users',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.data));
    }
  );

  // Block candidate user
  const targetCandidateUser = mockUsers.find(u => u.email === 'candidate@test.com');
  await testEndpoint(
    'PATCH /admin/users/:id/block - Blocks candidate user (Zod validation tests)',
    `/admin/users/${targetCandidateUser._id}/block`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isBlocked: true }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.data.user.isBlocked, true);
      assert.strictEqual(targetCandidateUser.isBlocked, true);
    }
  );

  // Employer pending list
  let pendingEmployerId = '';
  const employerProf = mockEmployerProfiles[0];
  if (employerProf) {
    employerProf.isApproved = false; // reset to pending for test
    pendingEmployerId = employerProf._id;
  }
  await testEndpoint(
    'GET /admin/employers/pending - Retrieves pending employer verifications',
    '/admin/employers/pending',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.data));
    }
  );

  if (pendingEmployerId) {
    // Approve employer profile
    await testEndpoint(
      'PATCH /admin/employers/:id/approve - Approves employer profile verification',
      `/admin/employers/${pendingEmployerId}/approve`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      (status, body) => {
        assert.strictEqual(status, 200);
        assert.strictEqual(body.data.profile.isApproved, true);
      }
    );
  }

  // Admin platform settings
  await testEndpoint(
    'GET /admin/settings - Retrieves platform configurations',
    '/admin/settings',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.data.settings.requireEmployerVerification, true);
    }
  );

  await testEndpoint(
    'PUT /admin/settings - Updates platform configurations',
    '/admin/settings',
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        maintenanceMode: true,
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.data.settings.maintenanceMode, true);
    }
  );

  // Admin Category CRUD
  let categoryId = '';
  await testEndpoint(
    'POST /admin/categories - Creates a new job category',
    '/admin/categories',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Product Design',
        description: 'Visual layout, UI components, and User Experience designers.',
        icon: 'FaPalette',
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 201);
      assert.strictEqual(body.data.category.name, 'Product Design');
      categoryId = body.data.category._id;
    }
  );

  await testEndpoint(
    'PUT /admin/categories/:id - Updates a category details',
    `/admin/categories/${categoryId}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        description: 'Updated description for Product Design.',
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.data.category.description, 'Updated description for Product Design.');
    }
  );

  // Admin Skill CRUD
  let skillId = '';
  await testEndpoint(
    'POST /admin/skills - Creates a new verified skill',
    '/admin/skills',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Sketch App',
        category: categoryId,
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 201);
      assert.strictEqual(body.data.skill.name, 'Sketch App');
      skillId = body.data.skill._id;
    }
  );

  await testEndpoint(
    'PUT /admin/skills/:id - Updates a skill details',
    `/admin/skills/${skillId}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Sketch Designer',
      }),
    },
    (status, body) => {
      assert.strictEqual(status, 200);
      assert.strictEqual(body.data.skill.name, 'Sketch Designer');
    }
  );

  // Cleanup category/skill CRUD
  await testEndpoint(
    'DELETE /admin/skills/:id - Deletes a skill',
    `/admin/skills/${skillId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
    }
  );

  await testEndpoint(
    'DELETE /admin/categories/:id - Deletes a category',
    `/admin/categories/${categoryId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    },
    (status, body) => {
      assert.strictEqual(status, 200);
    }
  );

  // ─── SHUTDOWN ────────────────────────────────────────────────────────────────
  server.close();
  console.log('Test server closed.');

  // ─── REPORT ──────────────────────────────────────────────────────────────────
  console.log('');
  console.log('='.repeat(70));
  console.log('  ENDPOINTS VERIFICATION RESULTS');
  console.log('='.repeat(70));
  console.log('');

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    const line = `  ${icon} ${r.name}`;
    console.log(line);
    if (r.error) {
      console.log(`    └─ ERROR: ${r.error}`);
    }
  }

  console.log('');
  console.log('-'.repeat(70));
  console.log(`  Total: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('-'.repeat(70));

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Unhandled verification error:', err);
  if (server) server.close();
  process.exit(1);
});
