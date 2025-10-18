// Backend/routes/feedbackRoutes.js
import express from "express";
import { getAllFeedbacks, submitFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/submit", protect, submitFeedback);
router.get("/all", protect, getAllFeedbacks); 


export default router;
