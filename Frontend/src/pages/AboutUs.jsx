import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 text-gray-800">
            {/* Hero Section */}
            <section
                className="relative bg-cover bg-center h-[80vh] flex items-center justify-center mt-18"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative text-center text-white px-6"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
                        About Us
                    </h1>
                    <p className="text-lg md:text-2xl max-w-2xl mx-auto text-gray-200">
                        Driving innovation and redefining the car rental experience with
                        trust, luxury, and technology.
                    </p>
                </motion.div>
            </section>

            {/* Journey Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-100 relative">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold text-center text-primary mb-16"
                    >
                        Our Journey
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                year: "2020",
                                title: "Founded",
                                desc: "It all started with a dream to make car rentals effortless and trustworthy.",
                                img: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80",
                            },
                            {
                                year: "2021",
                                title: "Tech Integration",
                                desc: "We brought cutting-edge technology to bookings, making rentals smoother.",
                                img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
                            },
                            {
                                year: "2023",
                                title: "Expanding Horizons",
                                desc: "Now operating in 50+ cities, we’re on the road to becoming global.",
                                img: "https://images.unsplash.com/photo-1502872364588-894d7d6ddfab?auto=format&fit=crop&w=800&q=80",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition"
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="h-48 w-full object-cover"
                                />
                                <div className="p-6">
                                    <span className="text-sm text-gray-500 font-semibold">
                                        {item.year}
                                    </span>
                                    <h3 className="text-2xl font-bold mt-2">{item.title}</h3>
                                    <p className="mt-3 text-gray-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-gradient-to-r from-primary to-indigo-600 text-white py-20 relative">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center relative z-10">
                    {[
                        { number: "10,000+", label: "Happy Customers" },
                        { number: "300+", label: "Luxury Cars" },
                        { number: "50+", label: "Cities Served" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.2 }}
                        >
                            <h3 className="text-5xl font-extrabold">{stat.number}</h3>
                            <p className="text-gray-200 mt-3 text-lg">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Founder */}
            <section className="py-20 bg-white text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="max-w-3xl mx-auto"
                >
                    <img
                        src="/Founder.jpeg"
                        alt="Founder"
                        className="w-50 h-50 mx-auto mb-6 rounded-full object-cover shadow-2xl border-4 border-primary"
                    />
                    <h3 className="text-3xl font-bold text-primary">Rohan Desai</h3>
                    <p className="text-gray-600 font-medium">Founder & CEO</p>
                    <p className="mt-4 text-gray-700 leading-relaxed italic">
                        “We don’t just rent cars — we create experiences worth remembering,
                        with innovation at the heart of every journey.”
                    </p>
                </motion.div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-20 text-center relative">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold text-gray-900 mb-6"
                >
                    Drive Into the Future With Us
                </motion.h2>
                <p className="max-w-xl mx-auto text-gray-800 mb-8">
                    Choose your dream ride today and let us make your journey unforgettable.
                </p>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/cars")}
                    className="bg-black text-white font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-gray-800 transition relative"
                >
                    🚗 Book Now
                    <span className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 blur-xl animate-pulse"></span>
                </motion.button>
            </section>
        </div>
    );
};

export default AboutUs;
