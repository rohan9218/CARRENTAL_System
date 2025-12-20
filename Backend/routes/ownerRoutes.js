import express from "express";
import {
    addCar,
    changeRoleToOwner,
    deleteCar,
    deleteCarByAdmin,
    getAllBookings,
    getCarById,
    getCarsByOwnerId,
    getCommissionStats,
    getConfirmedBookings,
    getDashboardData,
    getDashboardDataById,
    getLoggedInOwner,
    getMonthlyBookings,
    getMonthlyRevenueStats,
    getOwnerCars,
    getOwnerCustomers,
    getPendingBookings,
    toggleCarAvailability,
    updateCar,
    updateUserImage
} from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);

ownerRouter.get("/car/:id", protect, getCarById);

// ✅ Updated to handle multiple files
ownerRouter.post("/add-car", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'insurancePaper', maxCount: 1 }
]), protect, addCar);

// ✅ Updated to handle multiple files
ownerRouter.put("/update-car/:id", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'insurancePaper', maxCount: 1 }
]), protect, updateCar);

ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);

// ✅ Get cars by owner ID (for main owner)
ownerRouter.get("/cars/:ownerId", protect, getCarsByOwnerId);
// ✅ Delete car by admin
ownerRouter.post("/delete-car-by-admin", protect, deleteCarByAdmin);

ownerRouter.get("/dashboard", protect, getDashboardData);
ownerRouter.post("/update-image", upload.single("image"), protect, updateUserImage);

// ✅ Other booking routes remain the same
ownerRouter.get("/bookings", protect, getAllBookings);
ownerRouter.get("/bookings/pending", protect, getPendingBookings);
ownerRouter.get("/bookings/confirmed", protect, getConfirmedBookings);
ownerRouter.get("/revenue-stats", protect, getMonthlyRevenueStats);
ownerRouter.get("/commission-stats", protect, getCommissionStats);
ownerRouter.get('/monthly-bookings', protect, getMonthlyBookings);

ownerRouter.get("/dashboard/:ownerId", protect, getDashboardDataById);
ownerRouter.get("/customers", protect, getOwnerCustomers);

ownerRouter.get("/me", protect, getLoggedInOwner);

export default ownerRouter;