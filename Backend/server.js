import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./configs/db.js";

import bookingRouter from "./routes/bookingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import newsletterRouter from "./routes/newsletterRouter.js";
import ownerRouter from "./routes/ownerRoutes.js";
import paymentRouter from "./routes/paymentRouter.js";
import userRouter from "./routes/userRoutes.js";

// Initialise Express App
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   DATABASE CONNECTION
========================= */
connectDB();

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://carrental-system.vercel.app" // frontend prod URL
    ],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   ROUTES
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running on Vercel 🚀");
});

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   ❌ DO NOT LISTEN ON PORT
   ✅ EXPORT APP FOR VERCEL
========================= */
export default app;
