import axios from "axios"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

const FeedbackForm = ({ booking, onClose }) => {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [carCondition, setCarCondition] = useState("")
    const [serviceQuality, setServiceQuality] = useState("")
    const [driverBehavior, setDriverBehavior] = useState("")
    const [comments, setComments] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating || !carCondition || !serviceQuality) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            const token = localStorage.getItem("token"); // ✅ get token stored after login

            await axios.post(
                "/api/feedback/submit",
                {
                    booking: booking._id,
                    rating,
                    carCondition,
                    serviceQuality,
                    driverBehavior,
                    comments,
                },
                {
                    headers: {
                        Authorization: token, // ✅ send token
                    },
                }
            );

            // ✅ Set localStorage flag for refresh
            localStorage.setItem("feedbackSubmitted", "true");

            toast.success("Feedback submitted successfully ✅");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg"
            >
                <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white ">
                    Car Rental Feedback
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ⭐ Overall Rating */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Overall Rating *</label>
                        <div className="flex gap-2">
                            {[...Array(5)].map((_, i) => {
                                const value = i + 1
                                return (
                                    <Star
                                        key={i}
                                        size={28}
                                        onClick={() => setRating(value)}
                                        onMouseEnter={() => setHover(value)}
                                        onMouseLeave={() => setHover(0)}
                                        className={`cursor-pointer transition ${value <= (hover || rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    {/* 🚗 Car Condition */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Car Condition *</label>
                        <select
                            value={carCondition}
                            onChange={(e) => setCarCondition(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                        >
                            <option value="">Select</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>

                    {/* 🛠 Service Quality */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Service Quality *</label>
                        <select
                            value={serviceQuality}
                            onChange={(e) => setServiceQuality(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                        >
                            <option value="">Select</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>

                    {/* 👨‍✈️ Driver Behavior (if with driver) */}
                    {booking?.withDriver && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Driver Experience</label>
                            <select
                                value={driverBehavior}
                                onChange={(e) => setDriverBehavior(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                            >
                                <option value="">Select</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Average">Average</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    )}

                    {/* 📝 Comments */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Additional Comments</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows="3"
                            placeholder="Write your feedback..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default FeedbackForm