import Contact from "../models/Contact.js";
import { sendEmail } from "../configs/email.js";

const MAIN_OWNER_EMAIL = process.env.MAIN_OWNER_EMAIL || 'rohandesai9218@gmail.com';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    // 📧 1. Send confirmation email to User
    try {
      const userHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
  <h2 style="color: #0ea5e9;">We received your message!</h2>
  <p>Dear ${name},</p>
  <p>Thank you for contacting us. We have received your inquiry and our support team will get back to you shortly.</p>
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <p><strong>Your Message:</strong></p>
    <p style="white-space: pre-line; color: #4b5563;">${message}</p>
  </div>
  <p>Best regards,<br>Car Rental Team</p>
</div>
      `;
      await sendEmail(email, "Thank you for contacting Car Rental", userHtml);
    } catch (mailErr) {
      console.error("❌ Failed to send user contact confirmation email:", mailErr.message);
    }

    // 📧 2. Send notification email to Admin
    try {
      const adminHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
  <h2 style="color: #0ea5e9;">New Contact Form Submission</h2>
  <p><strong>From:</strong> ${name} (${email})</p>
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-line; color: #374151;">${message}</p>
  </div>
</div>
      `;
      await sendEmail(MAIN_OWNER_EMAIL, `New Contact Form Inquiry from ${name}`, adminHtml);
    } catch (adminMailErr) {
      console.error("❌ Failed to send admin contact alert email:", adminMailErr.message);
    }

    res.status(201).json({ message: "Message sent successfully 🚀" });
  } catch (error) {
    console.error("❌ Error saving contact:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
};

// Add this function to get all contacts for admin
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
};