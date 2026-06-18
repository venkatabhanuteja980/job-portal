const nodemailer = require('nodemailer');

/**
 * Create a Nodemailer transporter based on the current environment.
 * - Production: SendGrid SMTP
 * - Development: Ethereal for testing
 * @returns {import('nodemailer').Transporter}
 */
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Development: use Ethereal for testing
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

const transporter = createTransporter();

module.exports = transporter;
