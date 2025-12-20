import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: "Car", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: "pending" },
    price: { type: Number, required: true },
    ownerPrice: { type: Number, required: true },
    withDriver: { type: Boolean, default: false },
    userAddress: { type: String, default: "" },
    userMobile: { type: String, default: "" }, // ✅ Added mobile number field
    idProof: { type: String },
    commission: { type: Number, default: 0 },
    paymentMode: { type: String, enum: ['cash', 'online'], default: 'cash' },
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    verificationCode: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;