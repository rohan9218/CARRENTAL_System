import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sending...");

        try {
            const response = await fetch("http://localhost:3000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus("✅ Message sent successfully!");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setStatus("❌ Failed to send message.");
            }
        } catch (error) {
            setStatus("⚠️ Server error. Try again later.");
        }
    };

    return (
        <div 
            className="relative flex items-center justify-center min-h-screen overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80')" }}  // ✅ Add your car image path here
        >

            {/* 🔵 Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/50 z-0"></div>

            {/* 🔵 Animated Background Circles */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="absolute top-20 left-20 w-40 h-40 rounded-full bg-white/20 blur-3xl z-0"
            ></motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 8 }}
                className="absolute bottom-20 right-20 w-56 h-56 rounded-full bg-yellow-300/20 blur-3xl z-0"
            ></motion.div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-10 flex flex-col lg:flex-row gap-10 border border-white/20"
            >
                {/* Left Section - Info */}
                <div className="flex-1 space-y-6 text-white">
                    <motion.h2
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl font-bold"
                    >
                        Contact <span className="text-yellow-300">Us</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="text-gray-200"
                    >
                        We’d love to hear from you! Whether it’s questions about car rentals,
                        partnerships, or feedback — drop us a message 🚗✨
                    </motion.p>

                    <div className="space-y-5">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex items-center gap-3"
                        >
                            <Phone className="text-yellow-300 w-6 h-6" /> <span>+1 234 567 890</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="flex items-center gap-3"
                        >
                            <Mail className="text-yellow-300 w-6 h-6" /> <span>support@carrental.com</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="flex items-center gap-3"
                        >
                            <MapPin className="text-yellow-300 w-6 h-6" /> <span>123 Main St, New York</span>
                        </motion.div>
                    </div>
                </div>

                {/* Right Section - Form */}
                <form onSubmit={handleSubmit} className="flex-1 space-y-5">
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-yellow-300"
                    />
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-yellow-300"
                    />
                    <motion.textarea
                        whileFocus={{ scale: 1.02 }}
                        name="message"
                        placeholder="Your Message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 outline-none focus:ring-2 focus:ring-yellow-300"
                    ></motion.textarea>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold shadow-lg hover:bg-yellow-500 transition-all"
                    >
                        Send Message 🚀
                    </motion.button>

                    {status && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-100 font-medium"
                        >
                            {status}
                        </motion.p>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default ContactUs;
