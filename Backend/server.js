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

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   SAFE DATABASE CONNECTION
========================= */
let isDBConnected = false;
const connectDatabase = async () => {
  if (!isDBConnected) {
    await connectDB();
    isDBConnected = true;
  }
};

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://carrental-system.vercel.app"
    ],
    credentials: true
  })
);

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/", async (req, res) => {
  try {
    await connectDatabase();
    res.send("Backend is running on Vercel 🚀");
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).send("Database connection failed");
  }
});

/* =========================
   ROUTES (UNCHANGED)
========================= */
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   EXPORT FOR VERCEL
========================= */
export default app;
