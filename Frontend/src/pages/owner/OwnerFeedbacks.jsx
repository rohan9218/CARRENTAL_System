import axios from "axios";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OwnerFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const { data } = await axios.get("/api/feedback/all");
            if (data.success) {
                setFeedbacks(data.feedbacks);
            } else {
                toast.error("Failed to fetch feedbacks");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-600 dark:text-gray-300 text-lg">Loading feedbacks...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-6xl mx-auto"
        >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
                User Feedbacks
            </h2>

            {feedbacks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center text-lg mt-20">
                    No feedbacks submitted yet.
                </p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {feedbacks.map((fb) => (
                        <motion.div
                            key={fb._id}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-900 border border-gray-200 dark:border-gray-600"
                        >
                            {/* Header with user info */}
                            <div className="p-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-lg">
                                        {fb.user?.name || "Anonymous User"}
                                    </p>
                                    <p className="text-sm">
                                        Booking ID: {fb.booking?._id || "N/A"}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={
                                                i < fb.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-white/50"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Feedback details */}
                            <div className="p-4 space-y-3 dark:bg-gray-800">
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                                        Car Condition: {fb.carCondition}
                                    </span>
                                    <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-sm">
                                        Service Quality: {fb.serviceQuality}
                                    </span>
                                    {fb.driverBehavior && (
                                        <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-sm">
                                            Driver Behavior: {fb.driverBehavior}
                                        </span>
                                    )}
                                </div>

                                {fb.comments && (
                                    <p className="text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-400 pl-3 mt-2">
                                        "{fb.comments}"
                                    </p>
                                )}

                                <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
                                    Submitted on {new Date(fb.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default OwnerFeedbacks;