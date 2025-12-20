import { motion } from "motion/react";
import { useState } from "react";

const Newsletter = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Use backend base URL from .env (fallback to localhost)
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

        try {
            const res = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // ✅ If backend not reachable
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();

            // ✅ Show popup with server message
            if (data.success) {
                alert(`✅ ${data.message}`);
                setEmail("");
            } else {
                alert(`⚠️ ${data.message}`);
            }
        } catch (err) {
            console.error("Newsletter error:", err);
            alert("❌ Failed to connect to the server. Please try again later.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-center justify-center text-center space-y-2 max-md:px-4 my-10 mb-40"
        >
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.5 }}
                className="md:text-4xl text-2xl font-semibold"
            >
                Never Miss a Deal!
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:text-lg text-gray-500/70 pb-8"
            >
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </motion.p>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12"
            >
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
                    type="email"
                    placeholder="Enter your email id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none"
                >
                    Subscribe
                </button>
            </motion.form>
        </motion.div>
    );
};

export default Newsletter;
