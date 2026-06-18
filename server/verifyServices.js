/**
 * Verification script for Phase 2 Part 2 services.
 * Tests: CloudinaryService, EmailService, NotificationService, ResumeParserService, JobMatcherService.
 */

const assert = require('assert');
const path = require('path');

console.log('='.repeat(70));
console.log('  SERVICES UNIT VERIFICATION');
console.log('='.repeat(70));
console.log('');

// Setup dummy env values if not present
process.env.NODE_ENV = 'development';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.EMAIL_FROM = 'noreply@jobportal.com';
process.env.EMAIL_FROM_NAME = 'Job Portal';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';

// Cache all models so they don't overwrite register twice
const mongoose = require('mongoose');
require('./src/models/User');
require('./src/models/Skill');
require('./src/models/Notification');
require('./src/models/Job');
require('./src/models/CandidateProfile');

const results = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
    passCount++;
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    failCount++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    passCount++;
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    failCount++;
  }
}

async function runTests() {
  // ─── 1. CLOUDINARY SERVICE TEST ───────────────────────────────────────────────
  console.log('▶ Testing Cloudinary Service...');
  
  const CloudinaryService = require('./src/services/cloudinaryService');
  const cloudinary = require('./src/config/cloudinary');

  test('Cloudinary: uploadBuffer handles stream piping and upload options', () => {
    // Mock the upload_stream call
    let optionsPassed = null;
    cloudinary.uploader.upload_stream = (options, cb) => {
      optionsPassed = options;
      // Simulate success callback
      setTimeout(() => {
        cb(null, {
          secure_url: 'https://cloudinary.com/test-url.jpg',
          public_id: 'test-public-id',
        });
      }, 10);

      // Return a mock stream object
      return {
        end: (buffer) => {
          assert.deepStrictEqual(buffer, Buffer.from('test-buffer'));
        }
      };
    };

    return CloudinaryService.uploadBuffer(Buffer.from('test-buffer'), 'avatars', { customOpt: true })
      .then((res) => {
        assert.strictEqual(res.url, 'https://cloudinary.com/test-url.jpg');
        assert.strictEqual(res.publicId, 'test-public-id');
        assert.strictEqual(optionsPassed.folder, 'job-portal/avatars');
        assert.strictEqual(optionsPassed.customOpt, true);
      });
  });

  test('Cloudinary: deleteFile calls destroy and handles response', () => {
    let publicIdDeleted = null;
    let resourceTypePassed = null;

    cloudinary.uploader.destroy = async (publicId, opts) => {
      publicIdDeleted = publicId;
      resourceTypePassed = opts.resource_type;
      return { result: 'ok' };
    };

    return CloudinaryService.deleteFile('logo_id', 'image')
      .then((res) => {
        assert.strictEqual(res, true);
        assert.strictEqual(publicIdDeleted, 'logo_id');
        assert.strictEqual(resourceTypePassed, 'image');
      });
  });

  // ─── 2. EMAIL SERVICE TEST ───────────────────────────────────────────────────
  console.log('▶ Testing Email Service...');
  
  const EmailService = require('./src/services/emailService');
  const transporter = require('./src/config/email');

  test('Email: sendEmail builds options and sends successfully', () => {
    let mailSentOpts = null;
    transporter.sendMail = async (opts) => {
      mailSentOpts = opts;
      return { messageId: 'test-msg-id' };
    };

    return EmailService.sendEmail({
      to: 'candidate@test.com',
      subject: 'Test Subject',
      html: '<h1>Hello!</h1>',
    }).then((res) => {
      assert.strictEqual(res.messageId, 'test-msg-id');
      assert.strictEqual(mailSentOpts.to, 'candidate@test.com');
      assert.strictEqual(mailSentOpts.subject, 'Test Subject');
      assert.ok(mailSentOpts.html.includes('<h1>Hello!</h1>'));
      assert.strictEqual(mailSentOpts.text, 'Hello!'); // Plain text fallback logic
    });
  });

  test('Email: helper methods generate correct email subject and templates', () => {
    let mailSentOpts = null;
    transporter.sendMail = async (opts) => {
      mailSentOpts = opts;
      return { messageId: 'test-id' };
    };

    return EmailService.sendVerificationEmail('verify@test.com', 'Jane Doe', 'verify-tok-123')
      .then(() => {
        assert.strictEqual(mailSentOpts.to, 'verify@test.com');
        assert.ok(mailSentOpts.html.includes('verify-tok-123'));
        assert.ok(mailSentOpts.html.includes('Jane Doe'));
      });
  });

  // ─── 3. NOTIFICATION SERVICE TEST ─────────────────────────────────────────────
  console.log('▶ Testing Notification Service...');
  
  const NotificationService = require('./src/services/notificationService');
  const Notification = require('./src/models/Notification');
  const User = require('./src/models/User');

  await testAsync('Notification: createNotification creates database record and fires background email', async () => {
    let mockNotifCreated = null;
    Notification.create = async (data) => {
      mockNotifCreated = data;
      return { ...data, _id: 'notif_id_123' };
    };

    let userQueriedId = null;
    User.findById = (id) => {
      userQueriedId = id;
      return {
        then: (cb) => {
          cb({
            fullName: 'John Doe',
            email: 'john@test.com',
            isBlocked: false,
          });
          return { catch: () => {} };
        }
      };
    };

    let emailSentTo = null;
    EmailService.sendEmail = async (opts) => {
      emailSentTo = opts.to;
      return { messageId: 'email-id' };
    };

    const notif = await NotificationService.createNotification({
      user: 'user_123',
      title: 'Alert Title',
      message: 'Alert Message Text',
      type: 'system',
      link: '/jobs',
      sendEmail: true
    });

    assert.strictEqual(notif._id, 'notif_id_123');
    assert.strictEqual(mockNotifCreated.user, 'user_123');
    assert.strictEqual(mockNotifCreated.title, 'Alert Title');
    assert.strictEqual(mockNotifCreated.message, 'Alert Message Text');
    assert.strictEqual(mockNotifCreated.type, 'system');

    // Wait a brief tick for background promise execution
    await new Promise((r) => setTimeout(r, 20));
    assert.strictEqual(userQueriedId, 'user_123');
    assert.strictEqual(emailSentTo, 'john@test.com');
  });

  // ─── 4. RESUME PARSER SERVICE TEST ────────────────────────────────────────────
  console.log('▶ Testing Resume Parser Service...');
  
  const ResumeParserService = require('./src/services/resumeParserService');
  const Skill = require('./src/models/Skill');

  await testAsync('Resume Parser: parseResumeText extracts email, phone, name, and matches DB skills', async () => {
    // Mock database active skills list
    Skill.find = () => ({
      select: () => {
        return Promise.resolve([
          { name: 'Node.js' },
          { name: 'React' },
          { name: 'MongoDB' },
          { name: 'Python' },
          { name: 'C++' },
        ]);
      }
    });

    const mockResumeText = `
      Alex Mercer
      alex.mercer@email.com | +91 98765 43210
      Summary:
      Experienced Professional skilled in React and Node.js backend systems.
      Education:
      Bachelor of Technology from IIT Delhi, 2018-2022
      Experience:
      Software Engineer at TechCorp, 2022 to Present
    `;

    const parsed = await ResumeParserService.parseResumeText(mockResumeText);

    assert.strictEqual(parsed.extractedName, 'Alex Mercer');
    assert.strictEqual(parsed.extractedEmail, 'alex.mercer@email.com');
    assert.strictEqual(parsed.extractedPhone, '+91 98765 43210');
    
    // Skills check
    assert.ok(parsed.extractedSkills.includes('React'));
    assert.ok(parsed.extractedSkills.includes('Node.js'));
    assert.ok(!parsed.extractedSkills.includes('Python'));

    // Education check
    assert.strictEqual(parsed.extractedEducation.length, 1);
    assert.strictEqual(parsed.extractedEducation[0].degree, 'B.Tech');
    assert.strictEqual(parsed.extractedEducation[0].institution, 'IIT Delhi');

    // Experience check
    assert.strictEqual(parsed.extractedExperience.length, 1);
    assert.strictEqual(parsed.extractedExperience[0].title, 'Software engineer');
    assert.strictEqual(parsed.extractedExperience[0].company, 'TechCorp');
  });

  // ─── 5. JOB MATCHER SERVICE TEST ──────────────────────────────────────────────
  console.log('▶ Testing Job Matcher Service...');
  
  const JobMatcherService = require('./src/services/jobMatcherService');

  await testAsync('Job Matcher: calculateMatch calculates correct match scores and skills list', async () => {
    // Mock Skill DB lookups in helper method
    Skill.find = (filter) => {
      const ids = filter._id.$in;
      const dbSkills = [
        { _id: 'sk1', name: 'JavaScript' },
        { _id: 'sk2', name: 'Node.js' },
        { _id: 'sk3', name: 'React' },
        { _id: 'sk4', name: 'AWS' },
        { _id: 'sk5', name: 'Docker' }
      ];
      const matched = dbSkills.filter(s => ids.includes(s._id));
      return {
        select: () => Promise.resolve(matched)
      };
    };

    const candidateProfile = {
      skills: ['sk1', 'sk2', 'sk3'], // JS, Node, React
      customSkills: ['git'],
      totalExperience: 3,
      education: [
        { degree: 'Bachelor of Technology' }
      ]
    };

    const job = {
      skills: ['sk1', 'sk2', 'sk4', 'sk5'], // JS, Node, AWS, Docker (4 required)
      customSkills: [],
      experienceRequired: { min: 2 },
      educationRequired: 'Bachelor of Technology',
    };

    const match = await JobMatcherService.calculateMatch(candidateProfile, job);

    // Skills match math:
    // Job required: JavaScript, Node.js, AWS, Docker (4 skills)
    // Candidate has: JavaScript, Node.js (2 matching) -> 2/4 = 0.50 (50%)
    // Skill contribution = 0.50 * 0.60 = 0.30
    
    // Experience fit math:
    // Candidate 3 years >= Required 2 years -> 1.0 (100%)
    // Experience contribution = 1.0 * 0.25 = 0.25
    
    // Education fit math:
    // Candidate has Bachelor >= Required Bachelor -> 1.0 (100%)
    // Education contribution = 1.0 * 0.15 = 0.15
    
    // Total match percentage = (0.30 + 0.25 + 0.15) * 100 = 70%

    assert.strictEqual(match.matchScore, 70);
    assert.deepStrictEqual(match.matchingSkills.sort(), ['javascript', 'node.js']);
    assert.deepStrictEqual(match.missingSkills.sort(), ['aws', 'docker']);
  });

  // ─── FINAL REPORT ─────────────────────────────────────────────────────────────
  console.log('');
  console.log('='.repeat(70));
  console.log('  SERVICES VERIFICATION RESULTS');
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
  process.exit(1);
});
