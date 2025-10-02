import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import Car from '../models/Car.js';
import User from "../models/User.js";

// Generate JWT Token
const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

// Temporary store (in production use Redis/DB)
let otpStore = {};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ success: false, message: "Email required" });

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;

        // send email via nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}`,
        });

        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Reset Password with OTP
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!otpStore[email]) {
            return res.json({ success: false, message: "No OTP generated for this email" });
        }

        if (otpStore[email] !== otp) {
            return res.json({ success: false, message: "Invalid OTP, please enter a valid one" });
        }

        // ✅ Strong Password Validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.json({
                success: false,
                message:
                    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol (!@#$%^&*).",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        delete otpStore[email]; // clear OTP after success
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Fill all the fields' });
        }

        // ✅ Strong Password Validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.json({
                success: false,
                message:
                    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol (!@#$%^&*).",
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = generateToken(user._id.toString());
        res.json({ success: true, token });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// ✅ Update User Profile (Name + Image)
export const updateProfile = async (req, res) => {
    try {
        const { user } = req;
        const { name } = req.body;

        const updatedData = {};
        if (name) updatedData.name = name;

        if (req.file) {
            // ✅ Save full URL instead of relative path
            updatedData.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updatedData,
            { new: true }
        ).select("-password");

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
        const { user } = req;
        res.json({ success: true, user })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get All cars for the Frontend
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({ isAvaliable: true })
        res.json({ success: true, cars })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
