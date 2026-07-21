import mongoose from "mongoose";

const connectDB = async () => {
    // Reuse existing connection if already connected
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_rental";

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Database Connected to MongoDB");
    } catch (error) {
        console.error("❌ Database Connection Error:", error.message);
        throw error;
    }
};

export default connectDB;
