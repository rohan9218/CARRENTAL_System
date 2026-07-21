import nodemailer from 'nodemailer';

export const sendEmailViaNodemailer = async (toEmail, subject, htmlContent, attachments = []) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER or EMAIL_PASS is missing in environment variables');
  }

  console.log('📧 Sending email via Nodemailer SMTP to:', toEmail);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"Car Rental System" <${emailUser}>`,
    to: toEmail,
    subject: subject,
    html: htmlContent,
    attachments: attachments.map(att => ({
      filename: att.filename || `attachment_${Date.now()}.pdf`,
      content: Buffer.isBuffer(att.content) 
        ? att.content 
        : (typeof att.content === 'string' && att.content.length > 500 ? Buffer.from(att.content, 'base64') : att.content)
    }))
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent successfully via Nodemailer to ${toEmail}`);
  return info;
};

export default sendEmailViaNodemailer;