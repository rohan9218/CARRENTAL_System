import { sendEmailViaBrevo } from './brevo.js';

export const sendEmail = async (toEmail, subject, htmlContent, attachments = []) => {
  try {
    console.log(`📧 Sending email to: ${toEmail}`);
    
    // Convert attachments for Brevo format if needed
    let brevoAttachments = [];
    if (attachments && attachments.length > 0) {
      brevoAttachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content
      }));
    }
    
    // Send email via Brevo
    return await sendEmailViaBrevo(toEmail, subject, htmlContent, brevoAttachments);
    
  } catch (error) {
    console.error('❌ Error in sendEmail function:', error.message);
    throw error;
  }
};