import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Feedback from "../models/Feedback.js";

// ✅ Submit Feedback (same as before)
export const submitFeedback = async (req, res) => {
    try {
        const { booking, rating, carCondition, serviceQuality, driverBehavior, comments } = req.body;
        const userId = req.user._id; // Authenticated user

        if (!booking || !rating || !carCondition || !serviceQuality) {
            return res.status(400).json({ success: false, message: "All required fields must be filled" });
        }

        // ✅ Optional: Prevent duplicate feedback per booking
        const existing = await Feedback.findOne({ booking });
        if (existing) {
            return res.status(400).json({ success: false, message: "Feedback already submitted for this booking" });
        }

        const newFeedback = new Feedback({
            booking,
            rating,
            carCondition,
            serviceQuality,
            driverBehavior,
            comments,
            user: userId,
        });

        await newFeedback.save();

        res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback: newFeedback });
    } catch (error) {
        console.error("Feedback Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Fetch Feedbacks — Only for Cars Added by Logged-in Owner
export const getAllFeedbacks = async (req, res) => {
    try {
        const ownerId = req.user._id; // Auth middleware sets owner ID

        // Step 1: Find cars added by this owner
        const ownerCars = await Car.find({ owner: ownerId }).select("_id");

        if (!ownerCars.length) {
            return res.status(200).json({ success: true, feedbacks: [] });
        }

        const ownerCarIds = ownerCars.map(car => car._id);

        // Step 2: Find bookings that belong to these cars
        const bookings = await Booking.find({ car: { $in: ownerCarIds } }).select("_id");

        const bookingIds = bookings.map(b => b._id);

        // Step 3: Fetch feedbacks for those bookings
        const feedbacks = await Feedback.find({ booking: { $in: bookingIds } })
            .populate("user", "name email")
            .populate({
                path: "booking",
                populate: {
                    path: "car",
                    select: "brand model year category image",
                },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        console.error("Fetch Feedbacks Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
