import mongoose from "mongoose";

const CLOUD_MONGO_URI = "mongodb+srv://rohandesai9218:rohan123@cluster0.ww1xrd0.mongodb.net/carrental";

const connectDB = async () => {
    // Reuse existing connection if already connected
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    let mongoUri = process.env.MONGODB_URI;
    // In cloud/serverless, ignore localhost URIs and fallback to MongoDB Atlas
    if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
        mongoUri = CLOUD_MONGO_URI;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Database Connected to MongoDB");
    } catch (error) {
        console.error("❌ Database Connection Error:", error.message);
        // Fall back to cloud URI if custom URI failed
        if (mongoUri !== CLOUD_MONGO_URI) {
            try {
                await mongoose.connect(CLOUD_MONGO_URI, {
                    serverSelectionTimeoutMS: 5000,
                });
                console.log("✅ Database Connected via Cloud MongoDB Fallback");
            } catch (fallbackErr) {
                console.error("❌ Fallback DB Error:", fallbackErr.message);
            }
        }
    }
};

export default connectDB;
