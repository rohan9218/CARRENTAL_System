import express from "express";
import {
    addCar,
    changeRoleToOwner,
    deleteCar,
    getAllBookings,
    getCarById,
    getCommissionStats,
    getConfirmedBookings,
    getDashboardData,
    getLoggedInOwner,
    getMonthlyRevenueStats,
    getOwnerCars,
    getOwnerCustomers,
    getPendingBookings,
    toggleCarAvailability, // ✅ added
    updateCar, // ✅ added,
    updateUserImage
} from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);

ownerRouter.get("/car/:id", protect, getCarById); // ✅ added protect for security

ownerRouter.post("/add-car", upload.single("image"), protect, addCar);

ownerRouter.put("/update-car/:id", upload.single("image"), protect, updateCar); // ✅ fixed router -> ownerRouter

ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);

ownerRouter.get("/dashboard", protect, getDashboardData);
ownerRouter.post("/update-image", upload.single("image"), protect, updateUserImage);

// ✅ New booking routes
ownerRouter.get("/bookings", protect, getAllBookings);
ownerRouter.get("/bookings/pending", protect, getPendingBookings);
ownerRouter.get("/bookings/confirmed", protect, getConfirmedBookings);
ownerRouter.get("/revenue-stats", protect, getMonthlyRevenueStats);
ownerRouter.get("/commission-stats", protect, getCommissionStats);


ownerRouter.get("/customers", protect, getOwnerCustomers);

// ✅ Get logged-in owner details
ownerRouter.get("/me", protect, getLoggedInOwner);
export default ownerRouter;
