import Newsletter from "../models/Newsletter.js";
import { sendEmail } from "../configs/email.js";

// Subscribe API
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        // Check if email already subscribed
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.json({ success: false, message: "Already subscribed!" });
        }

        await Newsletter.create({ email });

        // 📧 Send Welcome Newsletter Email
        try {
            const welcomeHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
  <h2 style="color: #0ea5e9; text-align: center;">Welcome to Car Rental Newsletter! 🚗</h2>
  <p>Thank you for subscribing to our newsletter.</p>
  <p>You'll now be the first to know about our exclusive car rental discounts, new arrivals, and special promotions!</p>
  <br>
  <p>Best regards,<br><strong>Car Rental Team</strong></p>
</div>
            `;
            await sendEmail(email, "Welcome to Car Rental Newsletter! 🚗", welcomeHtml);
        } catch (mailErr) {
            console.error("❌ Failed to send newsletter welcome email:", mailErr.message);
        }

        res.json({ success: true, message: "Subscribed successfully!" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all subscribers (for admin)
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        res.json({ success: true, subscribers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
