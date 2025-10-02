import { useInView } from "framer-motion";
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from "react";
import { assets, cityList } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Hero = () => {
    const [pickupLocation, setPickupLocation] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const { navigate, user, setShowLogin, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext();
    const headingRef = useRef(null);
    const isInView = useInView(headingRef, { once: true, margin: "-100px" });
    // Array of car images
    const carImages = [
        "/NicePng_lamborghini-png_34804.png",
        "/car4.png",
        "/car2.png",
        "/main_car.png"
    ];

    // Auto slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [carImages.length]);

    const handleSearch = (e) => {
        e.preventDefault();

        // ✅ if user is not logged in, show login modal instead of navigating
        if (!user) {
            setShowLogin(true);
            return;
        }

        navigate(
            `/cars?pickupLocation=${pickupLocation}&pickupDate=${pickupDate}&returnDate=${returnDate}`
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-screen flex flex-col items-center justify-center gap-8 bg-light text-center"
        >
            <div className="flex flex-col items-center mt-25">
                <motion.h1
                    ref={headingRef}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.05, // delay between letters
                            },
                        },
                    }}
                    className="text-4xl md:text-5xl font-semibold flex gap-1"
                >
                    {"Luxury cars on Rent".split("").map((char, index) => (
                        <motion.span
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.4 }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.h1>

                <motion.form
                    initial={{ scale: 0.95, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    onSubmit={handleSearch}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] mt-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8">
                        {/* Pickup Location */}
                        <div className="flex flex-col items-start gap-2">
                            <select
                                required
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                className="bg-transparent text-gray-700 dark:text-gray-200"
                            >
                                <option value="">Pickup Location</option>
                                {cityList.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <p className="px-1 text-sm text-gray-500 dark:text-gray-300">
                                {pickupLocation || "Please select location"}
                            </p>
                        </div>

                        {/* Pickup Date */}
                        <div className="flex flex-col items-start gap-2">
                            <label htmlFor="pickup-date" className="text-gray-700 dark:text-gray-200">Pick-up Date</label>
                            <input
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                type="date"
                                id="pickup-date"
                                min={new Date().toISOString().split("T")[0]}
                                className="text-sm text-gray-700 dark:text-gray-200 bg-transparent"
                                required
                            />
                        </div>

                        {/* Return Date */}
                        <div className="flex flex-col items-start gap-2">
                            <label htmlFor="return-date" className="text-gray-700 dark:text-gray-200">Return Date</label>
                            <input
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                type="date"
                                id="return-date"
                                min={pickupDate || new Date().toISOString().split("T")[0]}
                                className="text-sm text-gray-700 dark:text-gray-200 bg-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Search Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer ml-4"
                    >
                        <img
                            src={assets.search_icon}
                            alt="Search"
                            className="brightness-300"
                        />
                        Search
                    </motion.button>
                </motion.form>
            </div>

            {/* Car Images Slider */}
            <div className="relative w-full max-w-4xl h-64 md:h-96 flex items-center justify-center overflow-hidden">
                {carImages.map((image, index) => (
                    <motion.img
                        key={index}
                        initial={{ opacity: 0, x: `${(index - currentSlide) * 100}%` }}
                        animate={{
                            opacity: index === currentSlide ? 1 : 0,
                            x: `${(index - currentSlide) * 100}%`,
                            scale: index === currentSlide ? 1 : 0.9
                        }}
                        transition={{ duration: 0.8 }}
                        src={image}
                        alt={`car-${index}`}
                        className={`absolute max-h-full object-contain transition-opacity duration-500 ${index === currentSlide ? 'z-10' : 'z-0'}`}
                    />
                ))}
            </div>

            {/* Slider Indicators */}
            <div className="flex gap-2">
                {carImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-primary' : 'bg-gray-300'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default Hero;
