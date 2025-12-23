import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiLock, FiMail, FiRefreshCw } from "react-icons/fi";
import { useAppContext } from "../context/AppContext";

const Login = () => {
    const { setShowLogin, axios, setToken, navigate } = useAppContext();

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [signupOtp, setSignupOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [showOtpField, setShowOtpField] = useState(false);

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

    // ✅ Send OTP for email verification during signup
    const sendSignupOtp = async () => {
        if (!name || !email) {
            toast.error("Please enter both name and email");
            return;
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSendingOtp(true);
        try {
            const { data } = await axios.post("/api/user/send-signup-otp", { 
                email, 
                name 
            });
            
            if (data.success) {
                toast.success("OTP sent to your email");
                setShowOtpField(true);
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // ✅ Verify OTP for signup
    const verifySignupOtp = async () => {
        if (!signupOtp || signupOtp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            const { data } = await axios.post("/api/user/verify-signup-otp", { 
                email, 
                otp: signupOtp 
            });
            
            if (data.success) {
                toast.success("Email verified successfully!");
                setIsOtpVerified(true);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to verify OTP");
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (state === "register") {
            if (!isOtpVerified) {
                // First verify OTP
                await verifySignupOtp();
                return;
            }

            if (passwordError) return;
            
            // Create account after OTP verification
            try {
                const { data } = await axios.post(`/api/user/register`, {
                    name,
                    email,
                    password,
                });

                if (data.success) {
                    setToken(data.token);
                    localStorage.setItem("token", data.token);
                    navigate("/");
                    setShowLogin(false);
                    toast.success("Account created successfully!");
                } else {
                    toast.error(data.message || "Failed to create account");
                }
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong, please try again later");
            }
            return;
        }

        if (state === "verifyOtp" && newPasswordError) return;

        try {
            if (state === "forgot") {
                const { data } = await axios.post("/api/user/forgot-password", { email });
                if (data.success) {
                    toast.success(data.message);
                    setState("verifyOtp");
                } else {
                    toast.error(data.message || "Something went wrong");
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
                    toast.success(data.message);
                } else {
                    toast.error(data.message || "Invalid OTP or password");
                }
                return;
            }

            // Login
            const { data } = await axios.post(`/api/user/login`, {
                email,
                password,
            });

            if (data.success) {
                setToken(data.token);
                localStorage.setItem("token", data.token);
                navigate("/");
                setShowLogin(false);
                toast.success("Login successful");
            } else {
                toast.error(data.message || "Invalid credentials, please try again");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, please try again later");
        }
    };

    // ✅ Reset signup form
    const resetSignupForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setSignupOtp("");
        setIsOtpVerified(false);
        setShowOtpField(false);
        setPasswordError("");
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
                        <>
                            {/* Name Field */}
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
                                    disabled={isOtpVerified}
                                />
                            </motion.div>

                            {/* Email Field */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="flex items-center w-full mt-6 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2"
                            >
                                <FiMail className="text-gray-400 text-lg" />
                                <input
                                    type="email"
                                    placeholder="Email id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                    required
                                    disabled={isOtpVerified}
                                />
                            </motion.div>

                            {/* Send OTP Button - Only show if OTP not verified */}
                            {!isOtpVerified && (
                                <button
                                    type="button"
                                    onClick={sendSignupOtp}
                                    disabled={isSendingOtp || !name || !email || showOtpField}
                                    className={`mt-4 w-full h-11 rounded-full text-white ${isSendingOtp || !name || !email || showOtpField ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-90'} transition-opacity flex items-center justify-center gap-2`}
                                >
                                    {isSendingOtp ? (
                                        <>
                                            <FiRefreshCw className="animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </button>
                            )}

                            {/* OTP Input Field - Show after Send OTP is clicked */}
                            {!isOtpVerified && showOtpField && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mt-4 w-full"
                                    >
                                        <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6">
                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                value={signupOtp}
                                                onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="bg-transparent text-gray-500 outline-none text-sm w-full h-full text-center tracking-widest"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <p className="text-gray-500 text-xs mt-2 text-center">
                                            OTP sent to {email}
                                        </p>
                                    </motion.div>

                                    {/* Resend OTP Link */}
                                    <div className="mt-2 text-center">
                                        <span
                                            className="text-primary text-sm cursor-pointer"
                                            onClick={sendSignupOtp}
                                        >
                                            Resend OTP
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Password Field - Only shown after OTP verification */}
                            {isOtpVerified && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mt-6 w-full"
                                    >
                                        <div className="flex items-center w-full bg-white border border-green-500/50 h-12 rounded-full overflow-hidden pl-6 gap-2">
                                            <FiLock className="text-green-500 text-lg" />
                                            <input
                                                type="password"
                                                placeholder="Create Password"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    setPasswordError(validatePassword(e.target.value));
                                                }}
                                                className="bg-transparent text-gray-500 outline-none text-sm w-full h-full"
                                                required
                                            />
                                        </div>
                                        {passwordError && (
                                            <p className="text-red-500 text-xs text-left mt-1 ml-6">{passwordError}</p>
                                        )}
                                        <p className="text-green-600 text-xs mt-2 text-left ml-6 flex items-center gap-1">
                                            <span className="text-green-500">✓</span> Email verified successfully
                                        </p>
                                    </motion.div>

                                    {/* Edit Email Link */}
                                    <div className="mt-2 text-center">
                                        <span
                                            className="text-primary text-sm cursor-pointer"
                                            onClick={() => {
                                                setIsOtpVerified(false);
                                                setShowOtpField(false);
                                                setSignupOtp("");
                                            }}
                                        >
                                            Use different email
                                        </span>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {(state === "login" || state === "forgot" || state === "verifyOtp") && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex items-center w-full mt-6 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2"
                        >
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

                    {state === "login" && (
                        <div className="mt-4 w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2"
                            >
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
                                onClick={() => {
                                    setState("login");
                                    resetSignupForm();
                                }}
                            >
                                Login
                            </span>
                        </p>
                    ) : state === "login" ? (
                        <p className="text-gray-500 text-sm mt-3 mb-11">
                            Don't have an account?{" "}
                            <span
                                className="text-primary cursor-pointer"
                                onClick={() => {
                                    setState("register");
                                    resetSignupForm();
                                }}
                            >
                                Sign up
                            </span>
                        </p>
                    ) : null}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className={`mt-2 w-full h-11 rounded-full text-white ${state === "register" && !isOtpVerified && signupOtp.length !== 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:opacity-90'} transition-opacity mb-10`}
                        disabled={state === "register" && !isOtpVerified && signupOtp.length !== 6}
                    >
                        {state === "register"
                            ? isOtpVerified ? "Create Account" : "Verify OTP"
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