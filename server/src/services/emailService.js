const transporter = require('../config/email');

/**
 * Service to handle sending system-generated emails.
 */
class EmailService {
  /**
   * Core send email wrapper.
   * 
   * @param {object} options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject line
   * @param {string} options.html - HTML content
   * @param {string} [options.text] - Plain text fallback
   * @returns {Promise<object>} Nodemailer send response
   */
  static async sendEmail({ to, subject, html, text }) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Job Portal'}" <${process.env.EMAIL_FROM || 'noreply@jobportal.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Basic auto-fallback text representation
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        const nodemailer = require('nodemailer');
        // Ethereal testing helper: logs test URL
        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
          console.log(`[Ethereal Email] Preview URL: ${testUrl}`);
        }
      }
      return info;
    } catch (error) {
      console.error(`Email Sending Failed to: ${to}. Error:`, error.message);
      // We don't crash the app if email fails, but we throw or log it
      throw error;
    }
  }

  /**
   * Generates a standard layout HTML wrapper for consistent styling.
   */
  static _getEmailTemplate(title, bodyHtml) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #e6ebf1;
          }
          .header {
            background: linear-gradient(135deg, #4f46e5, #4338ca);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
            color: #32325d;
            line-height: 1.6;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 25px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
          }
          .footer {
            background-color: #fcfcfc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #8898aa;
            border-top: 1px solid #f0f3f7;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Job Portal</h1>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Job Portal. All rights reserved.<br>
            If you have any questions, contact our support team at support@jobportal.com.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Sends user email verification link.
   */
  static async sendVerificationEmail(email, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

    const bodyHtml = `
      <h2>Welcome to the Platform, ${name}!</h2>
      <p>Thank you for registering with us. To complete your account activation and start exploring jobs or candidates, please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="button" target="_blank">Verify Email Address</a>
      </div>
      <p>This verification link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste this link in your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: #6b7280;">${verifyUrl}</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address — Job Portal',
      html: this._getEmailTemplate('Email Verification', bodyHtml),
    });
  }

  /**
   * Sends password reset email.
   */
  static async sendPasswordResetEmail(email, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const bodyHtml = `
      <h2>Hello ${name},</h2>
      <p>We received a request to reset the password for your Job Portal account. Click the button below to choose a new password:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
      </div>
      <p>This reset link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <p>If the button doesn't work, copy and paste this link in your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: #6b7280;">${resetUrl}</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request — Job Portal',
      html: this._getEmailTemplate('Reset Password Request', bodyHtml),
    });
  }

  /**
   * Sends welcome email after successful email verification.
   */
  static async sendWelcomeEmail(email, name, role) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const dashboardUrl = `${clientUrl}/${role}/dashboard`;

    const bodyHtml = `
      <h2>Welcome Aboard, ${name}!</h2>
      <p>Your email has been verified, and your Job Portal account is now active.</p>
      <p>You have registered as a <strong>${role.toUpperCase()}</strong>. You can now access your customized dashboard to update your profile and begin using the platform.</p>
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button" target="_blank">Go to Dashboard</a>
      </div>
      <p>We are excited to help you on your professional journey!</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to the Job Portal!',
      html: this._getEmailTemplate('Welcome Aboard', bodyHtml),
    });
  }

  /**
   * Sends job application status updates to candidate.
   */
  static async sendApplicationStatusEmail(email, name, jobTitle, companyName, status, note = '') {
    let statusText;
    let explanation;

    switch (status) {
      case 'reviewed':
        statusText = 'Reviewed';
        explanation = 'The employer has reviewed your resume and application.';
        break;
      case 'shortlisted':
        statusText = 'Shortlisted';
        explanation = 'Congratulations! The employer has shortlisted your application for the next stage.';
        break;
      case 'offered':
        statusText = 'Offered';
        explanation = 'Exciting news! You have been offered a position. The employer will be in touch shortly.';
        break;
      case 'hired':
        statusText = 'Hired';
        explanation = 'Welcome to the team! The employer has marked you as hired for this position.';
        break;
      case 'rejected':
        statusText = 'Not Selected';
        explanation = 'Thank you for your interest. Unfortunately, the employer has decided to proceed with other candidates for this role.';
        break;
      default:
        statusText = status;
        explanation = `Your application status has been updated to: ${status}.`;
    }

    const bodyHtml = `
      <h2>Application Status Update</h2>
      <p>Dear ${name},</p>
      <p>We have an update regarding your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      <p>Your current status: <span style="background-color: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${statusText}</span></p>
      <p>${explanation}</p>
      ${note ? `<p><strong>Employer Note:</strong> <i>"${note}"</i></p>` : ''}
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/candidate/applications" class="button" target="_blank">Track Applications</a>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Application Update: ${jobTitle} at ${companyName}`,
      html: this._getEmailTemplate('Application Update', bodyHtml),
    });
  }

  /**
   * Sends interview scheduled email to candidate.
   */
  static async sendInterviewScheduledEmail({ email, name, jobTitle, companyName, date, time, type, link, location, notes }) {
    let interviewTypeDetails;
    if (type === 'video') {
      interviewTypeDetails = `<p><strong>Type:</strong> Video Call<br><strong>Meeting Link:</strong> <a href="${link}" target="_blank">${link}</a></p>`;
    } else if (type === 'onsite') {
      interviewTypeDetails = `<p><strong>Type:</strong> Onsite (In-Person)<br><strong>Location:</strong> ${location}</p>`;
    } else {
      interviewTypeDetails = `<p><strong>Type:</strong> Phone Interview</p>`;
    }

    const bodyHtml = `
      <h2>Interview Scheduled!</h2>
      <p>Dear ${name},</p>
      <p>An interview has been scheduled for your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <p style="margin-top: 0;"><strong>Interview Details:</strong></p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br><strong>Time:</strong> ${time}</p>
        ${interviewTypeDetails}
        ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
      </div>
      <p>Please make sure you are available at the scheduled time. If it is a video call, join a few minutes early to test your audio/video setup.</p>
      <p>Good luck!</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html: this._getEmailTemplate('Interview Scheduled', bodyHtml),
    });
  }

  /**
   * Sends account suspension email.
   */
  static async sendAccountSuspendedEmail(email, name, reason) {
    const bodyHtml = `
      <h2>Account Suspension Notice</h2>
      <p>Dear ${name},</p>
      <p>We regret to inform you that your Job Portal account has been suspended by the platform administrator.</p>
      <p><strong>Reason for suspension:</strong></p>
      <p style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; color: #b91c1c; font-style: italic;">
        "${reason || 'Violation of platform terms of service.'}"
      </p>
      <p>If you believe this action was taken in error or would like to appeal the decision, please contact our support team at support@jobportal.com.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Important: Your account has been suspended',
      html: this._getEmailTemplate('Account Suspended', bodyHtml),
    });
  }
}

module.exports = EmailService;
