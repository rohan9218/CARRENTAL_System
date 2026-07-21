import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import connectDB from './configs/db.js';
import bookingRouter from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import feedbackRoutes from "./routes/feedbackRoutes.js";
import newsletterRouter from './routes/newsletterRouter.js';
import ownerRouter from './routes/ownerRoutes.js';
import paymentRouter from "./routes/paymentRouter.js";
import userRouter from './routes/userRoutes.js';

// Initialise Express App
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database initially
try {
    await connectDB();
} catch (e) {
    console.warn("Initial DB connection warning:", e.message);
}

// Ensure DB connection on every request (crucial for serverless environments)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Database connection failed: " + err.message + ". Please ensure MONGODB_URI is configured in environment variables." 
        });
    }
});

const allowedOrigins = [
    "http://localhost:5173",
    "https://carrental-management-system.vercel.app"
];


app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

app.use(express.json());

app.get('/', (req, res) => res.send("Server is running"));

app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);
app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
