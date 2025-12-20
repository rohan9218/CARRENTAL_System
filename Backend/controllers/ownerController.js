// src/controllers/ownerController.js
import fs from "fs";
import { sendEmail } from "../configs/email.js"; // or wherever your email.js is located
import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

// ✅ MAIN OWNER EMAIL FROM .env
const MAIN_OWNER_EMAIL = process.env.MAIN_OWNER_EMAIL;

export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" });
        res.json({ success: true, message: "Now you can list cars" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
// Api to list Car
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.files?.image?.[0]; // ✅ Updated for multiple files
        const insuranceFile = req.files?.insurancePaper?.[0]; // ✅ Added insurance file

        // Validate required files
        if (!imageFile || !insuranceFile) {
            return res.status(400).json({ success: false, message: "Car image and insurance paper are required" });
        }

        // Upload Car Image to ImageKit
        const imageBuffer = fs.readFileSync(imageFile.path);
        const imageResponse = await imagekit.upload({
            file: imageBuffer,
            fileName: imageFile.originalname,
            folder: '/cars',
        });

        // Upload Insurance Paper to ImageKit
        const insuranceBuffer = fs.readFileSync(insuranceFile.path);
        const insuranceResponse = await imagekit.upload({
            file: insuranceBuffer,
            fileName: insuranceFile.originalname,
            folder: '/insurance',
        });

        // Optimization through imagekit URL transformation for car image
        const optimizedImageUrl = imagekit.url({
            path: imageResponse.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' },
                { format: 'webp' },
            ],
        });

        // Insurance document URL (no transformation for documents)
        const insuranceUrl = insuranceResponse.url;

        const image = optimizedImageUrl;
        const insurancePaper = insuranceUrl; // ✅ Added insurance paper URL
        
        await Car.create({ ...car, owner: _id, image, insurancePaper });

        res.json({ success: true, message: "Car Added" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
// API to List Owner Cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id });
        res.json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ success: false, message: "Car not found" });

        if (car.owner.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        car.isAvaliable = !car.isAvaliable; // Matches current schema
        await car.save();
        res.json({ success: true, message: "Availability toggled" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to Delete a Car
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ success: false, message: "Car not found" });

        if (car.owner.toString() !== _id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Delete all bookings associated with the car
        const deletedBookings = await Booking.deleteMany({ car: carId });
        console.log(`Deleted ${deletedBookings.deletedCount} bookings for car ${carId}`);

        // Delete the car
        await Car.findByIdAndDelete(carId);
        console.log(`Deleted car ${carId}`);

        res.json({ success: true, message: "Car and associated bookings deleted successfully" });
    } catch (error) {
        console.log(`Error deleting car ${carId}: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get Dashboard Data - Fixed to show only owner's data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role, email } = req.user;

        if (role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Find all cars owned by the current owner
        const ownedCars = await Car.find({ owner: _id });
        const ownedCarIds = ownedCars.map(car => car._id);

        // Get bookings only for owner's cars
        const bookings = await Booking.find({ car: { $in: ownedCarIds } })
            .populate('car')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Filter out bookings where car is null (deleted cars)
        const filteredBookings = bookings.filter(b => b.car !== null);

        // Calculate metrics using filtered bookings
        const totalBookings = filteredBookings.length;
        const pendingBookings = filteredBookings.filter(b => b.status && b.status.toLowerCase() === 'pending').length;
        const completedBookings = filteredBookings.filter(b => b.status && b.status.toLowerCase() === 'confirmed').length;

        // Calculate monthly revenue for the current month (using ownerPrice)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = filteredBookings
            .filter(b => {
                const bookingDate = new Date(b.createdAt);
                return b.status === 'confirmed' &&
                    bookingDate.getMonth() === currentMonth &&
                    bookingDate.getFullYear() === currentYear;
            })
            .reduce((acc, booking) => acc + (booking.ownerPrice || booking.price || 0), 0);

        // Calculate commission for main owner only - FIXED COMMISSION LOGIC
        let commission = 0;
        if (email === MAIN_OWNER_EMAIL) {
            // Calculate commission from all bookings where car owner is NOT rohandesai9218@gmail.com
            const commissionData = await Booking.aggregate([
                {
                    $lookup: {
                        from: "cars",
                        localField: "car",
                        foreignField: "_id",
                        as: "carDetails"
                    }
                },
                {
                    $unwind: "$carDetails"
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "carDetails.owner",
                        foreignField: "_id",
                        as: "carOwner"
                    }
                },
                {
                    $unwind: "$carOwner"
                },
                {
                    $match: {
                        status: "confirmed",
                        "carOwner.email": { $ne: MAIN_OWNER_EMAIL }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCommission: { $sum: "$commission" }
                    }
                }
            ]);

            commission = commissionData.length > 0 ? parseFloat(commissionData[0].totalCommission.toFixed(1)) : 0;
        }

        // Get recent bookings (up to 5)
        const recentBookings = filteredBookings.slice(0, 5);

        // Total cars owned by the user
        const totalCars = ownedCars.length;

        const dashboardData = {
            totalCars,
            totalBookings,
            pendingBookings,
            completedBookings,
            recentBookings,
            monthlyRevenue,
            commission
        };

        res.json({ success: true, dashboardData });
    } catch (error) {
        console.log(`Error getting dashboard data for owner ${_id}: ${error.message}`);
        res.json({ success: false, message: error.message });
    }
};

// API to update user image
export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users',
        });

        // Optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '400' },
                { quality: 'auto' },
                { format: 'webp' },
            ],
        });
        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, { image });
        res.json({ success: true, message: "Image Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ owner: _id })
            .populate("car")
            .populate("user", "name email") // ✅ added
            .sort({ createdAt: -1 })
            .exec();
        const filteredBookings = bookings.filter(b => b.car !== null);
        res.json({ success: true, bookings: filteredBookings });
    } catch (error) {
        console.log(`Error fetching all bookings for owner ${_id}: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get pending bookings
export const getPendingBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ owner: _id, status: "pending" })
            .populate("car")
            .populate("user", "name email") // ✅ added
            .sort({ createdAt: -1 })
            .exec();
        const filteredBookings = bookings.filter(b => b.car !== null);
        res.json({ success: true, bookings: filteredBookings });
    } catch (error) {
        console.log(`Error fetching pending bookings for owner ${_id}: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get confirmed bookings
export const getConfirmedBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ owner: _id, status: "confirmed" })
            .populate("car")
            .populate("user", "name email") // ✅ added
            .sort({ createdAt: -1 })
            .exec();
        const filteredBookings = bookings.filter(b => b.car !== null);
        res.json({ success: true, bookings: filteredBookings });
    } catch (error) {
        console.log(`Error fetching confirmed bookings for owner ${_id}: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get single car by ID
export const getCarById = async (req, res) => {
    try {
        const { id } = req.params;
        const car = await Car.findById(id);
        if (!car) {
            return res.json({ success: false, message: "Car not found" });
        }
        res.json({ success: true, car });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Update existing car
export const updateCar = async (req, res) => {
    try {
        const { id } = req.params;

        const carData = JSON.parse(req.body.carData);
        let updateFields = { ...carData };

        // ✅ If image uploaded → upload to ImageKit
        if (req.files?.image?.[0]) {
            const fileBuffer = fs.readFileSync(req.files.image[0].path);

            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: req.files.image[0].originalname,
                folder: "/cars",
            });

            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: "1280" },
                    { quality: "auto" },
                    { format: "webp" },
                ],
            });

            updateFields.image = optimizedImageUrl;
        }

        // ✅ If insurance paper uploaded → upload to ImageKit
        if (req.files?.insurancePaper?.[0]) {
            const fileBuffer = fs.readFileSync(req.files.insurancePaper[0].path);

            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: req.files.insurancePaper[0].originalname,
                folder: "/insurance",
            });

            updateFields.insurancePaper = response.url;
        }

        const updatedCar = await Car.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedCar) {
            return res.json({ success: false, message: "Car not found or update failed" });
        }

        res.json({ success: true, message: "Car updated successfully", car: updatedCar });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get all customers for an owner (role based)
export const getOwnerCustomers = async (req, res) => {
    try {
        const { _id, role, email } = req.user;

        if (role !== "owner") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        let customers = [];

        if (email === MAIN_OWNER_EMAIL) {
            // 🔑 Main Owner → get all customers from all owners
            const bookings = await Booking.find()
                .populate("user", "name email role")
                .exec();

            const customersMap = new Map();
            bookings.forEach(b => {
                if (b.user && b.user.role === "user") {
                    customersMap.set(b.user._id.toString(), b.user);
                }
            });
            customers = Array.from(customersMap.values());
        } else {
            // 🔑 Normal Owner → get only his customers
            const bookings = await Booking.find({ owner: _id })
                .populate("user", "name email role")
                .exec();

            const customersMap = new Map();
            bookings.forEach(b => {
                if (b.user && b.user.role === "user") {
                    customersMap.set(b.user._id.toString(), b.user);
                }
            });
            customers = Array.from(customersMap.values());
        }

        res.json(customers);
    } catch (error) {
        console.error("Error fetching customers", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get logged-in owner details (with Main Owner access to all owners)
export const getLoggedInOwner = async (req, res) => {
    try {
        const { _id, role, email } = req.user;

        if (role !== "owner") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (email === MAIN_OWNER_EMAIL) {
            // 🔑 Main Owner → return all owners list
            const owners = await User.find({ role: "owner" }).select("name email role image");
            return res.json(owners);
        }

        // 🔑 Normal Owner → return only his details
        const owner = await User.findById(_id).select("name email role image");

        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        res.json(owner);
    } catch (error) {
        console.error("Error fetching logged-in owner", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ✅ Daily Revenue Stats for a Selected Month
export const getMonthlyRevenueStats = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { month, year } = req.query; // e.g., month=10&year=2025

        if (role !== "owner" && role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const targetMonth = parseInt(month) - 1; // JS months are 0-based
        const targetYear = parseInt(year);

        // Start and end of the month
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        const ownedCars = await Car.find({ owner: _id });
        const ownedCarIds = ownedCars.map(car => car._id);

        const bookings = await Booking.find({
            car: { $in: ownedCarIds },
            status: "confirmed",
            createdAt: { $gte: startDate, $lte: endDate },
        }).sort({ createdAt: 1 });

        // Initialize daily revenue
        const daysInMonth = endDate.getDate();
        const dailyRevenue = Array(daysInMonth).fill(0);

        bookings.forEach((booking) => {
            const day = new Date(booking.createdAt).getDate();
            const revenue = booking.ownerPrice || booking.price || 0;
            dailyRevenue[day - 1] += revenue;
        });

        const revenueData = dailyRevenue.map((rev, i) => ({
            day: i + 1,
            revenue: parseFloat(rev.toFixed(2)),
        }));

        res.json({ success: true, revenueData });
    } catch (error) {
        console.error("Error fetching daily revenue stats:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Daily Commission Stats (Fixed for Main Owner)
export const getCommissionStats = async (req, res) => {
    try {
        const { _id, role, email } = req.user;
        const { month, year } = req.query;

        if (role !== "owner" && role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const targetMonth = parseInt(month) - 1; // 0-indexed
        const targetYear = parseInt(year);
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        let bookings = [];

        if (email === MAIN_OWNER_EMAIL) {
            // 🔑 Main Owner: commission from all confirmed bookings not owned by main owner
            bookings = await Booking.aggregate([
                {
                    $lookup: {
                        from: "cars",
                        localField: "car",
                        foreignField: "_id",
                        as: "carDetails"
                    }
                },
                { $unwind: "$carDetails" },
                {
                    $lookup: {
                        from: "users",
                        localField: "carDetails.owner",
                        foreignField: "_id",
                        as: "carOwner"
                    }
                },
                { $unwind: "$carOwner" },
                {
                    $match: {
                        status: "confirmed",
                        "carOwner.email": { $ne: MAIN_OWNER_EMAIL },
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $project: {
                        createdAt: 1,
                        commission: { $ifNull: ["$commission", { $multiply: ["$price", 0.1] }] }
                    }
                }
            ]);
        } else {
            // 🔑 Normal Owner: show commission for their own bookings
            const ownedCars = await Car.find({ owner: _id }).select("_id");
            const ownedCarIds = ownedCars.map(car => car._id);

            bookings = await Booking.find({
                car: { $in: ownedCarIds },
                status: "confirmed",
                createdAt: { $gte: startDate, $lte: endDate },
            }).select("createdAt price adminCommission");
        }

        // ✅ Build daily commission chart
        const daysInMonth = endDate.getDate();
        const dailyCommission = Array(daysInMonth).fill(0);

        bookings.forEach(b => {
            const date = new Date(b.createdAt);
            const day = date.getDate();
            const commission = b.commission || b.adminCommission || (b.price * 0.1);
            dailyCommission[day - 1] += commission;
        });

        const commissionData = dailyCommission.map((val, i) => ({
            day: i + 1,
            commission: parseFloat(val.toFixed(2)),
        }));

        res.json({ success: true, commissionData });
    } catch (error) {
        console.error("Error fetching commission stats:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch commission stats" });
    }
};


// ✅ Get Dashboard Data for Any Owner (used by Main Owner)
export const getDashboardDataById = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { email } = req.user;

        // Allow only main owner to view other owners’ data
        if (email !== MAIN_OWNER_EMAIL) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Find the target owner
        const owner = await User.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // Get all cars owned by that owner
        const ownedCars = await Car.find({ owner: owner._id });
        const ownedCarIds = ownedCars.map(car => car._id);

        // Get bookings only for that owner’s cars
        const bookings = await Booking.find({ car: { $in: ownedCarIds } })
            .populate("car")
            .sort({ createdAt: -1 });

        const filteredBookings = bookings.filter(b => b.car !== null);

        // Calculate current month's revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = filteredBookings
            .filter(b => {
                const d = new Date(b.createdAt);
                return (
                    b.status === "confirmed" &&
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear
                );
            })
            .reduce((acc, b) => acc + (b.ownerPrice || b.price || 0), 0);

        res.json({
            success: true,
            dashboardData: {
                ownerName: owner.name,
                ownerEmail: owner.email,
                monthlyRevenue,
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard data for owner:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ✅ Get Monthly Bookings for Owner (Include deleted bookings)
export const getMonthlyBookings = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { month, year } = req.query;

        if (role !== "owner" && role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const targetMonth = parseInt(month) - 1;
        const targetYear = parseInt(year);

        // Start and end of the month
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        // Find all cars owned by the current owner
        const ownedCars = await Car.find({ owner: _id });
        const ownedCarIds = ownedCars.map(car => car._id);

        // Get ALL bookings for owner's cars within the selected month (including deleted ones)
        const bookings = await Booking.find({
            car: { $in: ownedCarIds },
            createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate('car', 'brand model category')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

        // Filter out any null bookings (in case of deletion issues)
        const validBookings = bookings.filter(booking => 
            booking !== null && booking.car !== null && booking.user !== null
        );

        res.json({ 
            success: true, 
            bookings: validBookings,
            message: `Found ${validBookings.length} bookings for selected month`
        });
    } catch (error) {
        console.error("Error fetching monthly bookings:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get cars by owner ID (for main owner to view other owners' cars)
export const getCarsByOwnerId = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { email } = req.user;

        // Allow only main owner to view other owners' cars
        if (email !== MAIN_OWNER_EMAIL) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Verify if the target owner exists
        const owner = await User.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // Get all cars owned by the specified owner
        const cars = await Car.find({ owner: ownerId })
            .populate('owner', 'name email') // Populate owner details
            .sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            cars,
            ownerInfo: {
                name: owner.name,
                email: owner.email,
                totalCars: cars.length
            }
        });
    } catch (error) {
        console.error("Error fetching cars by owner ID:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ✅ Delete car by admin with REAL-TIME EMAIL NOTIFICATION + IMAGE
export const deleteCarByAdmin = async (req, res) => {
    try {
        const { carId, reason } = req.body;
        const { email } = req.user;

        // Only main admin can delete
        if (email !== MAIN_OWNER_EMAIL) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const car = await Car.findById(carId).populate('owner', 'name email');
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        const ownerEmail = car.owner.email;
        const ownerName = car.owner.name;
        const carBrand = car.brand;
        const carModel = car.model;
        const carImage = car.image; // Image URL from ImageKit
        const deleteReason = reason && reason.trim() ? reason : "Your car papers are not clear";

        // Delete bookings & car
        await Booking.deleteMany({ car: carId });
        await Car.findByIdAndDelete(carId);

        // ✅ SEND EMAIL WITH IMAGE TO VENDOR
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #d32f2f;">Your Car Has Been Removed</h2>
                <p>Dear <strong>${ownerName}</strong>,</p>
                <p>Unfortunately, your listed car has been removed from the platform by the admin.</p>
                
                <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin:20px 0;">
                    <h3 style="margin:0 0 10px 0;">${carBrand} ${carModel}</h3>
                    <img src="${carImage}" alt="${carBrand} ${carModel}" style="width:100%; max-width:500px; height:auto; border-radius:8px;" />
                </div>
                
                <div style="background:#fff3cd; padding:15px; border-left:5px solid #ffc107; margin:20px 0;">
                    <p style="margin:0; color:#856404; font-weight:bold;">Reason for deletion:</p>
                    <p style="margin:10px 0 0 0; color:#856404;">${deleteReason.replace(/\n/g, '<br>')}</p>
                </div>
                
                <p>If you have any questions, please contact support.</p>
                <p>Thank you,<br><strong>Car Rental Admin Team</strong></p>
            </div>
        `;

        await sendEmail(
            ownerEmail,
            `Your car "${carBrand} ${carModel}" has been removed`,
            html
        );

        res.json({
            success: true,
            message: "Car deleted successfully and notification email sent to owner",
        });
    } catch (error) {
        console.error("Error deleting car by admin:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};