// utils/email.js
import SibApiV3Sdk from "sib-api-v3-sdk";

export const sendEmail = async (to, subject, html) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;

    // 🔐 Brevo API authentication
    client.authentications["api-key"].apiKey =
      process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: {
        email: process.env.MAIN_OWNER_EMAIL || "rohandesai9218@gmail.com",
        name: "Car Rental App",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("✅ Email sent via Brevo to:", to);
  } catch (error) {
    console.error(
      "❌ Brevo Email Error:",
      error.response?.body || error
    );
    throw new Error("Email not sent");
  }
};
