// src/controllers/ownerController.js
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

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
        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars',
        });

        // Optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' },
                { format: 'webp' },
            ],
        });

        const image = optimizedImageUrl;
        await Car.create({ ...car, owner: _id, image });

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
        if (email === "rohandesai9218@gmail.com") {
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
                        "carOwner.email": { $ne: "rohandesai9218@gmail.com" }
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

        const carData = JSON.parse(req.body.carData); // from frontend formData
        let updateFields = { ...carData };

        // ✅ If image uploaded → upload to ImageKit instead of local
        if (req.file) {
            const fileBuffer = fs.readFileSync(req.file.path);

            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: req.file.originalname,
                folder: "/cars",
            });

            // Optimization through ImageKit URL transformation
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

        if (email === "rohandesai9218@gmail.com") {
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

        if (email === "rohandesai9218@gmail.com") {
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

        if (email === "rohandesai9218@gmail.com") {
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
                        "carOwner.email": { $ne: "rohandesai9218@gmail.com" },
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
