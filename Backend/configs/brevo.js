import SibApiV3Sdk from 'sib-api-v3-sdk';

// Configure Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmailViaBrevo = async (toEmail, subject, htmlContent, attachments = []) => {
  try {
    console.log('📧 Sending email via Brevo to:', toEmail);
    
    // Create email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: 'Car Rental System',
      email: 'rohandesai9218@gmail.com'
    };
    sendSmtpEmail.to = [{ email: toEmail }];
    
    // Add attachments if provided (for PDF receipts)
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
      console.error('Brevo API Error:', error.response.body);
    }
    throw error;
  }
};