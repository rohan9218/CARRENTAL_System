import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        const mongoUri = process.env.MONGODB_URI || "mongodb+srv://rohandesai9218:rohan123@cluster0.ww1xrd0.mongodb.net/carrental";
        await mongoose.connect(mongoUri);
    } catch (error) {
        console.log("Database Connection Error:", error.message);
    }
}

export default connectDB;
