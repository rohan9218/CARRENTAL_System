import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, required: true },
    carCondition: { type: String, required: true },
    serviceQuality: { type: String, required: true },
    driverBehavior: { type: String },
    comments: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);
