import express from "express";
import { forgotPassword, getCars, getUserData, loginUser, registerUser, resetPassword, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

userRouter.get('/data',protect,getUserData)
userRouter.get('/cars',getCars)

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

userRouter.put('/update-profile', protect, upload.single("image"), updateProfile);
export default userRouter;