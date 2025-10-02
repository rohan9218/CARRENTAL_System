import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast"; // ✅ import toast
import { FiLock, FiMail } from "react-icons/fi"; // ✅ added icons
import { useAppContext } from "../context/AppContext";

const Login = () => {
    const { setShowLogin, axios, setToken, navigate } = useAppContext();

    const [state, setState] = useState("login"); // login | register | forgot | verifyOtp
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // ✅ error messages for password
    const [passwordError, setPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");

    // ✅ Password validation function
    const validatePassword = (pwd) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!pwd) return "";
        if (!passwordRegex.test(pwd)) {
            return "Must be 8+ chars, include A-Z, a-z, 0-9 & symbol (!@#$%^&*)";
        }
        return "";
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        // Prevent submit if password invalid
        if (state === "register" && passwordError) return;
        if (state === "verifyOtp" && newPasswordError) return;

        try {
            if (state === "forgot") {
                const { data } = await axios.post("/api/user/forgot-password", { email });
                if (data.success) {
                    toast.success(data.message); // ✅ show popup when OTP sent
                    setState("verifyOtp");
                }
                return;
            }

            if (state === "verifyOtp") {
                const { data } = await axios.post("/api/user/reset-password", {
                    email,
                    otp,
                    newPassword,
                });
                if (data.success) {
                    setState("login");
                    setEmail("");
                    setPassword("");
                    setOtp("");
                    setNewPassword("");
                    toast.success(data.message); // ✅ show popup when password reset
                }
                return;
            }

            const { data } = await axios.post(`/api/user/${state}`, {
                name: state === "register" ? name : undefined,
                email,
                password,
            });

            if (data.success) {
                setToken(data.token);
                localStorage.setItem("token", data.token);
                navigate("/");
                setShowLogin(false);
                toast.success("Login successful"); // ✅ success popup
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            onClick={() => setShowLogin(false)}
            className="fixed top-0 bottom-0 left-0 right-0 z-[100] flex items-center justify-center bg-black/50"
        >
            <AnimatePresence>
                <motion.form
                    key={state}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onSubmit={onSubmitHandler}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white shadow-lg"
                >
                    <h1 className="text-gray-900 text-3xl mt-10 font-medium">
                        {state === "login"
                            ? "Login"
                            : state === "register"
                            ? "Sign Up"
                            : state === "forgot"
                            ? "Forgot Password"
                            : "Reset Password"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        {state === "login"
                            ? "Please sign in to continue"
                            : state === "register"
                            ? "Create a new account"
                            : state === "forgot"
                            ? "Enter your email to reset password"
                            : "Enter OTP and new password"}
                    </p>

                    {state === "register" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center w-full mt-10 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6"
                        >
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                required
                            />
                        </motion.div>
                    )}

                    {(state === "login" || state === "register" || state === "forgot" || state === "verifyOtp") && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex items-center w-full mt-6 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2"
                        >
                            {/* ✅ Email Icon */}
                            <FiMail className="text-gray-400 text-lg" />
                            <input
                                type="email"
                                placeholder="Email id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                required
                            />
                        </motion.div>
                    )}

                    {(state === "login" || state === "register") && (
                        <div className="mt-4 w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2"
                            >
                                {/* ✅ Password Icon */}
                                <FiLock className="text-gray-400 text-lg" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError(validatePassword(e.target.value));
                                    }}
                                    className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                    required
                                />
                            </motion.div>
                            {state === "register" && passwordError && (
                                <p className="text-red-500 text-xs text-left mt-1">{passwordError}</p>
                            )}
                        </div>
                    )}

                    {state === "verifyOtp" && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                    required
                                />
                            </motion.div>
                            <div className="mt-4 w-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2"
                                >
                                    {/* ✅ Password Icon */}
                                    <FiLock className="text-gray-400 text-lg" />
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setNewPasswordError(validatePassword(e.target.value));
                                        }}
                                        className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                        required
                                    />
                                </motion.div>
                                {newPasswordError && (
                                    <p className="text-red-500 text-xs text-left mt-1">{newPasswordError}</p>
                                )}
                            </div>
                        </>
                    )}

                    {state === "login" && (
                        <div className="mt-5 text-left text-primary">
                            <span
                                className="text-sm cursor-pointer"
                                onClick={() => setState("forgot")}
                            >
                                Forgot password?
                            </span>
                        </div>
                    )}

                    {state === "register" ? (
                        <p className="text-gray-500 text-sm mt-3 mb-11">
                            Already have an account?{" "}
                            <span
                                className="text-primary cursor-pointer"
                                onClick={() => setState("login")}
                            >
                                Login
                            </span>
                        </p>
                    ) : state === "login" ? (
                        <p className="text-gray-500 text-sm mt-3 mb-11">
                            Don’t have an account?{" "}
                            <span
                                className="text-primary cursor-pointer"
                                onClick={() => setState("register")}
                            >
                                Sign up
                            </span>
                        </p>
                    ) : null}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="mt-2 w-full h-11 rounded-full text-white bg-primary hover:opacity-90 transition-opacity mb-10"
                    >
                        {state === "register"
                            ? "Create Account"
                            : state === "login"
                            ? "Login"
                            : state === "forgot"
                            ? "Send OTP"
                            : "Reset Password"}
                    </motion.button>
                </motion.form>
            </AnimatePresence>
        </div>
    );
};

export default Login;
