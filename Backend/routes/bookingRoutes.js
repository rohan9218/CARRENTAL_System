import express from "express";
import {
    changeBookingStatus,
    checkAvailabilityOfCar,
    createBooking,
    deleteBooking,
    getBookingById, getOwnerBookings,
    getUserBookings,
    updateBooking
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar);
bookingRouter.post('/create', protect, upload.single("idProof"), createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, changeBookingStatus);
// ✅ Get booking by ID
bookingRouter.get("/:id", protect, getBookingById);

// ✅ Update booking
bookingRouter.put("/:id", protect, upload.single("idProof"), updateBooking);

// ✅ Delete booking
bookingRouter.delete("/:id", protect, deleteBooking);


export default bookingRouter;
