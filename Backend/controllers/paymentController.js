import crypto from "crypto";
import Razorpay from "razorpay";
import Car from "../models/Car.js";

const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_ABC123456789",
    key_secret: process.env.VITE_RAZORPAY_KEY_SECRET || "ABC123456789XYZ"
});

// ✅ Create Razorpay order
export const createOrder = async (req, res) => {
    try {
        const { carId, pickupDate, returnDate, withDriver } = req.body;

        const car = await Car.findById(carId);
        if (!car) return res.json({ success: false, message: "Car not found" });

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1;

        let amount = car.pricePerDay * noOfDays;
        if (withDriver === "true" || withDriver === true) amount += 999;

        const options = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order, amount: options.amount });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

// ✅ Verify Razorpay payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.VITE_RAZORPAY_KEY_SECRET || "ABC123456789XYZ")
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
