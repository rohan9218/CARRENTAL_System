import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const navigate = useNavigate();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-18 transition-all duration-500 bg-gradient-to-br from-indigo-100 via-white to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-black">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-4xl bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-10"
            >


                {/* ✨ Header */}
                <div className="text-center mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3"
                    >
                        Privacy Policy
                    </motion.h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm">
                        Your privacy matters to us. Learn how we handle, use, and protect your data.
                    </p>
                </div>

                {/* 🧾 Policy Content */}
                <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {[
                        {
                            title: "1. Overview",
                            text: "At CarRental, we value your privacy and are committed to protecting your personal information. This policy explains how we handle your data when you use our services.",
                        },
                        {
                            title: "2. Information We Collect",
                            text: "We collect details such as your name, contact number, email address, driver’s license, and payment information. This helps us process your car rental bookings safely and effectively.",
                        },
                        {
                            title: "3. Data Usage",
                            text: "Your data is used to confirm bookings, send updates, provide customer support, and improve our services. We never sell or share your data without consent.",
                        },
                        {
                            title: "4. Cookies",
                            text: "Our website uses cookies to enhance user experience by remembering your preferences and login sessions. You can manage or disable cookies in your browser settings.",
                        },
                        {
                            title: "5. Data Security",
                            text: "We use encryption and security measures to protect your information from unauthorized access or disclosure.",
                        },
                        {
                            title: "6. Your Rights",
                            text: "You can access, update, or delete your data anytime by contacting our support team. We respond promptly to all requests.",
                        },
                    ].map((section, i) => (
                        <motion.section
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-gray-100/60 dark:bg-gray-800/40 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
                        >
                            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                                {section.title}
                            </h3>
                            <p>{section.text}</p>
                        </motion.section>
                    ))}
                </div>

               

               
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
