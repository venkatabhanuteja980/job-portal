const ROLES = {
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
};

const JOB_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  EXPIRED: 'expired',
};

const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
};

const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  EXECUTIVE: 'executive',
};

const LOCATION_TYPES = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
};

const NOTIFICATION_TYPES = {
  APPLICATION_UPDATE: 'application_update',
  INTERVIEW_INVITE: 'interview_invite',
  JOB_ALERT: 'job_alert',
  SYSTEM: 'system',
  EMPLOYER_ALERT: 'employer_alert',
  ACCOUNT: 'account',
};

const REPORT_REASONS = {
  SPAM: 'spam',
  FAKE: 'fake',
  INAPPROPRIATE: 'inappropriate',
  MISLEADING: 'misleading',
  DUPLICATE: 'duplicate',
  OTHER: 'other',
};

const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

const INTERVIEW_TYPES = {
  PHONE: 'phone',
  VIDEO: 'video',
  ONSITE: 'onsite',
};

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];

const GENDERS = ['male', 'female', 'other', 'prefer-not-to-say'];

const LANGUAGE_PROFICIENCIES = ['basic', 'conversational', 'proficient', 'fluent', 'native'];

const ALLOWED_FILE_TYPES = {
  RESUME: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
};

const MAX_FILE_SIZES = {
  RESUME: 5 * 1024 * 1024, // 5MB
  IMAGE: 2 * 1024 * 1024, // 2MB
  LOGO: 1 * 1024 * 1024, // 1MB
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  JOB_STATUS,
  APPLICATION_STATUS,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  LOCATION_TYPES,
  NOTIFICATION_TYPES,
  REPORT_REASONS,
  REPORT_STATUS,
  INTERVIEW_TYPES,
  COMPANY_SIZES,
  GENDERS,
  LANGUAGE_PROFICIENCIES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
  PAGINATION,
};
