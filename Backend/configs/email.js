import transporter from './nodemailer.js';

export const sendEmail = async (toEmail, subject, htmlContent, attachments = []) => {
  try {
    console.log('📧 Sending email via Nodemailer to:', toEmail);
    
    const mailOptions = {
      from: `"Car Rental System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };

    // Add attachments if provided
    if (attachments.length > 0) {
      mailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: 'base64'
      }));
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${toEmail}: ${info.messageId}`);
    return info;
    
  } catch (error) {
    console.error('❌ Error sending email via Nodemailer:', error);
    throw error;
  }
};