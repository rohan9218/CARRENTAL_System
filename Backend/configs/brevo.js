import SibApiV3Sdk from 'sib-api-v3-sdk';

export const sendEmailViaBrevo = async (toEmail, subject, htmlContent, attachments = []) => {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    throw new Error('BREVO_API_KEY is missing in environment variables');
  }

  // Dynamically set API Key for each request
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = brevoKey;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER || process.env.MAIN_OWNER_EMAIL || 'rohandesai9218@gmail.com';

  try {
    console.log('📧 Sending email via Brevo to:', toEmail);
    
    // Create email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: 'Car Rental System',
      email: senderEmail
    };
    sendSmtpEmail.to = [{ email: toEmail }];
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      sendSmtpEmail.attachment = attachments.map(attachment => ({
        name: attachment.filename || `receipt_${Date.now()}.pdf`,
        content: attachment.content
      }));
    }
    
    // Send email via Brevo API
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully via Brevo to ${toEmail}`);
    return data;
    
  } catch (error) {
    console.error('❌ Error sending email via Brevo:', error.message);
    if (error.response && error.response.body) {
      console.error('Brevo API Error Details:', error.response.body);
    }
    throw error;
  }
};