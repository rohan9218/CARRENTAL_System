import { sendEmailViaBrevo } from './brevo.js';
import { sendEmailViaNodemailer } from './nodemailer.js';

export const sendEmail = async (toEmail, subject, htmlContent, attachments = []) => {
  console.log(`📧 Unified email dispatch requested for: ${toEmail}`);

  // 1. Try Brevo if API key is set
  if (process.env.BREVO_API_KEY) {
    try {
      const brevoAttachments = (attachments || []).map(attachment => ({
        filename: attachment.filename,
        content: attachment.content
      }));
      return await sendEmailViaBrevo(toEmail, subject, htmlContent, brevoAttachments);
    } catch (brevoErr) {
      console.warn(`⚠️ Brevo dispatch failed (${brevoErr.message}). Trying Nodemailer fallback...`);
    }
  } else {
    console.log('ℹ️ BREVO_API_KEY not found. Attempting Nodemailer dispatch...');
  }

  // 2. Fall back to Nodemailer SMTP if EMAIL_USER & EMAIL_PASS are configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      return await sendEmailViaNodemailer(toEmail, subject, htmlContent, attachments);
    } catch (nodemailerErr) {
      console.error(`❌ Nodemailer fallback failed: ${nodemailerErr.message}`);
      throw nodemailerErr;
    }
  }

  const errorMsg = 'No working email service configuration found. Please check BREVO_API_KEY or EMAIL_USER/EMAIL_PASS in your deployment environment.';
  console.error(`❌ ${errorMsg}`);
  throw new Error(errorMsg);
};