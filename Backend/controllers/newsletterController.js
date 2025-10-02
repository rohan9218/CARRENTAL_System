import Newsletter from "../models/Newsletter.js";

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
