import pdf from 'html-pdf';
import nodemailer from 'nodemailer';
import path from "path";
import { fileURLToPath } from "url";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ MAIN OWNER EMAIL FROM .env
const MAIN_OWNER_EMAIL = process.env.MAIN_OWNER_EMAIL;

// Function to Check Availability of Car for a given Date
const checkAvailability = async (carId, pickupDate, returnDate, excludeBookingId = null) => {
    try {
        const query = {
            car: carId,
            $or: [
                {
                    pickupDate: { $lte: new Date(returnDate) },
                    returnDate: { $gte: new Date(pickupDate) }
                },
                {
                    pickupDate: { $lte: new Date(returnDate) },
                    returnDate: { $gte: new Date(pickupDate) }
                },
                {
                    pickupDate: { $gte: new Date(pickupDate) },
                    returnDate: { $lte: new Date(returnDate) }
                }
            ],
            status: { $in: ['pending', 'confirmed'] }
        };

        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId };
        }

        const bookings = await Booking.find(query);
        return bookings.length === 0;
    } catch (error) {
        console.error('Error in checkAvailability:', error);
        return false;
    }
};

// API to check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        if (!location || !pickupDate || !returnDate) {
            return res.json({
                success: false,
                message: "Location, pickup date and return date are required"
            });
        }

        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);

        if (pickup >= returnD) {
            return res.json({
                success: false,
                message: "Return date must be after pickup date"
            });
        }

        if (pickup < new Date().setHours(0, 0, 0, 0)) {
            return res.json({
                success: false,
                message: "Pickup date cannot be in the past"
            });
        }

        const cars = await Car.find({ location, isAvaliable: true });

        const availableCarPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
            return { ...car._doc, isAvailable };
        });

        let availableCars = await Promise.all(availableCarPromises);
        availableCars = availableCars.filter((car) => car.isAvailable === true);

        res.json({
            success: true,
            availableCars,
            message: `Found ${availableCars.length} available cars`
        });
    } catch (error) {
        console.log('Availability check error:', error.message);
        res.json({ success: false, message: error.message });
    }
};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate random verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (userEmail, verificationCode, carDetails, pickupDate) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Pickup Verification Code - Car Rental',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Car Rental Pickup Verification</h2>
          <p>Dear Customer,</p>
          <p>Your booking has been confirmed. Here are your pickup details:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            """,
            <p><strong>Car:</strong> ${carDetails.brand} ${carDetails.model}</p>
            <p><strong>Pickup Date:</strong> ${new Date(pickupDate).toLocaleDateString()}</p>
            <p><strong>Verification Code:</strong></p>
            <h1 style="color: #0ea5e9; font-size: 32px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
              ${verificationCode}
            </h1>
          </div>
          <p>Please present this code to the car owner during pickup for verification.</p>
          <p>Thank you for choosing our service!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

// Generate PDF Receipt
const generateReceiptPDF = async (booking, car, user) => {
    const pickup = new Date(booking.pickupDate).toLocaleDateString('en-IN');
    const ret = new Date(booking.returnDate).toLocaleDateString('en-IN');
    const days = Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)) + 1;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    h1 { color: #0ea5e9; text-align: center; }
    .info { margin: 15px 0; }
    .info strong { display: inline-block; width: 140px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #0ea5e9; color: white; }
    .total { font-weight: bold; font-size: 1.1em; background-color: #f0f9ff; }
    .footer { margin-top: 30px; font-size: 0.9em; color: #666; text-align: center; }
    .code { font-size: 28px; font-weight: bold; color: #0ea5e9; letter-spacing: 4px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Car Rental Receipt</h1>
    <div class="info"><strong>Booking ID:</strong> ${booking._id}</div>
    <div class="info"><strong>Customer:</strong> ${user.name}</div>
    <div class="info"><strong>Email:</strong> ${user.email}</div>
    <hr>
    <table>
      <tr><th>Item</th><th>Details</th></tr>
      <tr><td>Car</td><td>${car.brand} ${car.model}</td></tr>
      <tr><td>Pickup Date</td><td>${pickup}</td></tr>
      <tr><td>Return Date</td><td>${ret}</td></tr>
      <tr><td>Duration</td><td>${days} day(s)</td></tr>
      <tr><td>Driver</td><td>${booking.withDriver ? 'Yes (+₹999)' : 'No'}</td></tr>
      <tr><td>Base Price</td><td>₹${car.pricePerDay} × ${days} = ₹${car.pricePerDay * days}</td></tr>
      ${booking.withDriver ? `<tr><td>Driver Fee</td><td>₹999</td></tr>` : ''}
      <tr class="total"><td>Total Amount</td><td>₹${booking.price}</td></tr>
      <tr><td>Payment Mode</td><td>${booking.paymentMode.toUpperCase()}</td></tr>
    </table>
    <div class="code">${booking.verificationCode}</div>
    <p style="text-align:center; color:#666;">Present this code at pickup</p>
    <div class="footer">
      Thank you for choosing us!<br>
      Need help? Contact support at support@carrental.com
    </div>
  </div>
</body>
</html>
    `;

    return new Promise((resolve, reject) => {
        pdf.create(html, { format: 'A4', border: '10mm' }).toBuffer((err, buffer) => {
            if (err) return reject(err);
            resolve(buffer);
        });
    });
};

// Create Booking with Receipt
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate, withDriver, userAddress, userMobile, paymentMode, paymentId, orderId, signature } = req.body;

        if (!req.file) {
            return res.json({ success: false, message: "ID Proof is required" });
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available" });
        }

        const carData = await Car.findById(car).populate('owner');
        const userData = await User.findById(_id);
        const mainOwnerEmail = MAIN_OWNER_EMAIL;

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) + 1;

        let totalPrice = carData.pricePerDay * noOfDays;
        let commission = 0;

        if (withDriver === "true" || withDriver === true) {
            totalPrice += 999;
        }

        let ownerPrice = totalPrice;
        if (carData.owner.email !== mainOwnerEmail) {
            commission = totalPrice * 0.2;
            ownerPrice = totalPrice - commission;
        }

        const verificationCode = generateVerificationCode();

        const booking = await Booking.create({
            car,
            owner: carData.owner._id,
            user: _id,
            pickupDate,
            returnDate,
            price: totalPrice,
            ownerPrice,
            withDriver,
            userAddress: withDriver === "true" || withDriver === true ? userAddress : "",
            userMobile: withDriver === "true" || withDriver === true ? userMobile : "",
            idProof: `/uploads/${req.file.filename}`,
            commission,
            paymentMode: paymentMode || 'cash',
            paymentId,
            orderId,
            signature,
            verificationCode,
            status: paymentMode === 'online' ? 'confirmed' : 'pending'
        });

        // Send verification email
        try {
            await sendVerificationEmail(
                userData.email,
                verificationCode,
                { brand: carData.brand, model: carData.model },
                pickupDate
            );
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        // Generate and send receipt PDF
        let pdfBuffer;
        try {
            pdfBuffer = await generateReceiptPDF(booking, carData, userData);
        } catch (pdfError) {
            console.error('PDF generation failed:', pdfError);
        }

        const receiptMailOptions = {
            from: process.env.EMAIL_USER,
            to: userData.email,
            subject: `Booking Receipt - ${carData.brand} ${carData.model}`,
            html: `
                <p>Dear ${userData.name},</p>
                <p>Your car booking has been <strong>confirmed</strong>.</p>
                <p>Please find your <strong>detailed receipt attached</strong> as a PDF.</p>
                <p><strong>Verification Code:</strong> <span style="font-size:18px; font-weight:bold; color:#0ea5e9;">${verificationCode}</span></p>
                <p>Show this code to the owner at pickup time.</p>
                <p>Thank you for choosing us!</p>
            `,
            attachments: pdfBuffer ? [
                {
                    filename: `Receipt_${booking._id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ] : []
        };

        try {
            await transporter.sendMail(receiptMailOptions);
        } catch (receiptError) {
            console.error('Receipt email failed:', receiptError);
        }

        res.json({
            success: true,
            message: "Booking Created with ID Proof",
            verificationCode
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('car')
            .sort({ createdAt: -1 });

        const filteredBookings = bookings.filter(b => b.car !== null);

        const bookingsWithCorrectPrice = filteredBookings.map(booking => ({
            ...booking._doc,
            displayPrice: booking.price
        }));

        res.json({ success: true, bookings: bookingsWithCorrectPrice });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Owner Bookings
export const getOwnerBookings = async (req, res) => {
    try {
        const ownedCars = await Car.find({ owner: req.user._id });
        const ownedCarIds = ownedCars.map(car => car._id);

        const bookings = await Booking.find({ car: { $in: ownedCarIds } })
            .populate('car')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const bookingsWithCorrectPrice = bookings.map(booking => ({
            ...booking._doc,
            displayPrice: booking.ownerPrice
        }));

        res.json({ success: true, bookings: bookingsWithCorrectPrice });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete Booking
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        await booking.deleteOne();
        res.json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update booking
export const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { pickupDate, returnDate, status, withDriver, userAddress, userMobile } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this booking" });
        }

        const newPickup = pickupDate || booking.pickupDate;
        const newReturn = returnDate || booking.returnDate;

        const isAvailable = await checkAvailability(booking.car, newPickup, newReturn, bookingId);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available for the selected dates" });
        }

        if (pickupDate) booking.pickupDate = pickupDate;
        if (returnDate) booking.returnDate = returnDate;
        if (status) booking.status = status;

        if (withDriver !== undefined) {
            booking.withDriver = (withDriver === "true" || withDriver === true);
        }

        if (userAddress !== undefined) {
            booking.userAddress = booking.withDriver ? userAddress : "";
        } else if (!booking.withDriver) {
            booking.userAddress = "";
        }

        if (userMobile !== undefined) {
            booking.userMobile = booking.withDriver ? userMobile : "";
        } else if (!booking.withDriver) {
            booking.userMobile = "";
        }

        if (req.file) {
            booking.idProof = req.file.path;
        }

        const carData = await Car.findById(booking.car).populate('owner');

        const picked = new Date(booking.pickupDate);
        const returned = new Date(booking.returnDate);
        const noOfDays = Math.max(1, Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) + 1);

        let totalPrice = (carData?.pricePerDay || 0) * noOfDays;
        let commission = 0;

        if (booking.withDriver === true) {
            totalPrice += 999;
        }

        let ownerPrice = totalPrice;
        const mainOwnerEmail = MAIN_OWNER_EMAIL;
        if (carData?.owner && carData.owner.email !== mainOwnerEmail) {
            commission = totalPrice * 0.2;
            ownerPrice = totalPrice - commission;
        }

        booking.price = totalPrice;
        booking.ownerPrice = ownerPrice;
        booking.commission = commission;

        await booking.save();

        res.json({
            success: true,
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        console.error("Update booking error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};