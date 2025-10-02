import nodemailer from 'nodemailer';
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

// Function to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate, excludeBookingId = null) => {
    const query = {
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    };

    // ✅ Exclude the current booking when updating
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const bookings = await Booking.find(query);
    return bookings.length === 0;
};


// API to check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        // fetch all available cars for the given location
        const cars = await Car.find({ location, isAvaliable: true });

        // fetch car availability for the given date range
        const availableCarPromises = cars.map(async (car) => {
            const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate);
            return { ...car._doc, isAvaliable: isAvaliable };
        });

        let availableCars = await Promise.all(availableCarPromises);
        availableCars = availableCars.filter((car) => car.isAvaliable === true);

        res.json({ success: true, availableCars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};



// send email via nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to generate random verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send verification email
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

export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate, withDriver, userAddress, paymentMode, paymentId, orderId, signature } = req.body;

        // ID proof is required
        if (!req.file) {
            return res.json({ success: false, message: "ID Proof is required" });
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available" });
        }

        const carData = await Car.findById(car).populate('owner');
        const userData = await User.findById(_id);
        const mainOwnerEmail = "rohandesai9218@gmail.com";

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) + 1;

        // Calculate base price
        let totalPrice = carData.pricePerDay * noOfDays;
        let commission = 0;

        if (withDriver === "true" || withDriver === true) {
            const driverFeePerDay = 500; // or 999 per your frontend
            totalPrice += driverFeePerDay * noOfDays;
        }

        // Commission for non-main owners
        let ownerPrice = totalPrice;
        if (carData.owner.email !== mainOwnerEmail) {
            commission = totalPrice * 0.2; // 20%
            ownerPrice = totalPrice - commission;
        }

        // Generate verification code
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
            userAddress: withDriver === "true" || withDriver === true ? userAddress : "", // ✅ Store address only if withDriver
            idProof: `/uploads/${req.file.filename}`,
            commission,
            paymentMode: paymentMode || 'cash',
            paymentId,
            orderId,
            signature,
            verificationCode,
            status: paymentMode === 'online' ? 'confirmed' : 'pending'
        });

        // Send email (optional)
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

        // For user, show the original price
        const bookingsWithCorrectPrice = filteredBookings.map(booking => ({
            ...booking._doc,
            displayPrice: booking.price // Use original price for user's view
        }));

        res.json({ success: true, bookings: bookingsWithCorrectPrice });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Get Owner Bookings - Only show bookings for cars owned by the current owner
export const getOwnerBookings = async (req, res) => {
    try {
        // Find all cars owned by the current user
        const ownedCars = await Car.find({ owner: req.user._id });
        const ownedCarIds = ownedCars.map(car => car._id);

        // Find bookings only for cars owned by the current user
        const bookings = await Booking.find({ car: { $in: ownedCarIds } })
            .populate('car')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // For owner, show the price after commission
        const bookingsWithCorrectPrice = bookings.map(booking => ({
            ...booking._doc,
            displayPrice: booking.ownerPrice // Use ownerPrice for owner's view
        }));

        res.json({ success: true, bookings: bookingsWithCorrectPrice });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Api to change booking status
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

// Api to Delete Booking
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

// ✅ Update booking (replace existing updateBooking in bookingController.js)
export const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { pickupDate, returnDate, status, withDriver, userAddress } = req.body;

        // Find booking by ID
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Only the booking owner can update it
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this booking" });
        }

        // Determine new date-range to check availability (use existing if not provided)
        const newPickup = pickupDate || booking.pickupDate;
        const newReturn = returnDate || booking.returnDate;

        // Check availability excluding current booking (so user can keep the same slot)
        const isAvailable = await checkAvailability(booking.car, newPickup, newReturn, bookingId);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available for the selected dates" });
        }

        // Update basic fields if provided
        if (pickupDate) booking.pickupDate = pickupDate;
        if (returnDate) booking.returnDate = returnDate;
        if (status) booking.status = status;

        // Update driver option (accept "true"/true/"false"/false)
        if (withDriver !== undefined) {
            booking.withDriver = (withDriver === "true" || withDriver === true);
        }

        // Update userAddress (only keep when withDriver is true)
        if (userAddress !== undefined) {
            booking.userAddress = booking.withDriver ? userAddress : "";
        } else if (!booking.withDriver) {
            // ensure address cleared if switched to without driver
            booking.userAddress = "";
        }

        // If a new ID proof is uploaded, update path (multer stores file)
        if (req.file) {
            booking.idProof = req.file.path;
        }

        // Recalculate pricing (keep same logic as createBooking)
        // Fetch car + owner to compute commission/ownerPrice
        const carData = await Car.findById(booking.car).populate('owner');

        const picked = new Date(booking.pickupDate);
        const returned = new Date(booking.returnDate);
        const noOfDays = Math.max(1, Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) + 1); 

        let totalPrice = (carData?.pricePerDay || 0) * noOfDays;
        let commission = 0;

        if (booking.withDriver === true) {
            const driverFeePerDay = 500; // same driver fee used in createBooking
            totalPrice += driverFeePerDay * noOfDays;
        }

        let ownerPrice = totalPrice;
        const mainOwnerEmail = "rohandesai9218@gmail.com";
        if (carData?.owner && carData.owner.email !== mainOwnerEmail) {
            commission = totalPrice * 0.2; // 20% commission
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

// ✅ Get single booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // ✅ Only allow user/owner of booking to access
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
