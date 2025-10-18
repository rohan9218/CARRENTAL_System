import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import connectDB from './configs/db.js';
import bookingRouter from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import feedbackRoutes from "./routes/feedbackRoutes.js";
import ownerRouter from './routes/ownerRoutes.js';
import paymentRouter from "./routes/paymentRouter.js";
import userRouter from './routes/userRoutes.js';
// Initialise Express App
const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Connect Database
await connectDB()

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => res.send("Server is running"))
app.use('/api/user',userRouter)
app.use('/api/owner',ownerRouter)
app.use('/api/bookings',bookingRouter)
app.use("/api/contact", contactRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api/payments", paymentRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} `))