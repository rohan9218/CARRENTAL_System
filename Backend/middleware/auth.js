import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).end(); // ✅ silent 401
        }

        const userId = jwt.decode(token, process.env.JWT_SECRET);

        if (!userId) {
            return res.status(401).end(); // ✅ silent 401
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).end(); // ✅ silent 401
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).end(); // ✅ silent 401
    }
};
