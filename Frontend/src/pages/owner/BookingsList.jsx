// src/pages/BookingsList.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

// Backend base URL (use environment variable in production)
const BACKEND_URL = import.meta.env.VITE_BASE_URL;


const BookingsList = () => {
    const { axios, isOwner, currency } = useAppContext();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/owner/bookings");
            if (data.success) {
                // Filter out bookings where the car is null or undefined AND
                // filter out bookings where return date has passed
                const currentDate = new Date();
                const filteredBookings = data.bookings.filter((booking) => {
                    // Check if car exists
                    if (!booking.car) return false;
                    
                    // Check if return date has passed
                    const returnDate = new Date(booking.returnDate);
                    return returnDate >= currentDate;
                });
                setBookings(filteredBookings);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Fetch bookings error:", error.message);
            toast.error("Failed to load bookings. Check server connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOwner) {
            fetchBookings();
        }
    }, [isOwner]);

    // Refresh on navigation (e.g., after deleting a car)
    useEffect(() => {
        const handleRouteChange = () => {
            if (window.location.pathname === "/owner/bookings") {
                fetchBookings();
            }
        };
        window.addEventListener("popstate", handleRouteChange);
        return () => window.removeEventListener("popstate", handleRouteChange);
    }, []);

    // Current date in IST
    const today = new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
        hour12: true,
    });

    if (loading) return <div className="px-4 pt-10 md:px-10">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Active Bookings</h1>

            {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No active bookings available.</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 transition duration-300 bg-white flex flex-col"
                        >
                            {/* Car Image */}
                            <img
                                src={booking.car?.image || "https://via.placeholder.com/300x150?text=Car+Image"}
                                alt={`${booking.car?.brand} ${booking.car?.model}`}
                                className="w-full h-40 object-cover rounded-md mb-4"
                            />

                            {/* Car Info */}
                            <p className="text-lg font-semibold text-gray-700">
                                {booking.car?.brand} {booking.car?.model}
                            </p>

                            {/* User Info */}
                            {booking.user?.name && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Booked By:</span> {booking.user.name}
                                </p>
                            )}

                            {/* User Address if driver selected */}
                            {booking.withDriver && booking.userAddress && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Pickup Address:</span> {booking.userAddress}
                                </p>
                            )}

                            {/* Booking Dates */}
                            {booking.pickupDate && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Pickup:</span>{" "}
                                    {new Date(booking.pickupDate).toLocaleDateString()}
                                </p>
                            )}

                            {booking.returnDate && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Return:</span>{" "}
                                    {new Date(booking.returnDate).toLocaleDateString()}
                                </p>
                            )}

                            {booking.createdAt && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Booking Date:</span>{" "}
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                            )}

                            <p className="mt-1 text-gray-600">
                                <span className="font-medium">Price:</span>{" "}
                                <span className="text-primary font-bold">{currency}{booking.price}</span>
                            </p>

                            {booking.car?.year && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Year:</span> {booking.car.year}
                                </p>
                            )}

                            {booking.car?.type && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Type:</span> {booking.car.type}
                                </p>
                            )}

                            {booking.car?.seating_capacity && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Seats:</span> {booking.car.seating_capacity}
                                </p>
                            )}

                            {booking.car?.fuel && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Fuel:</span> {booking.car.fuel}
                                </p>
                            )}

                            {booking.car?.transmission && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Transmission:</span> {booking.car.transmission}
                                </p>
                            )}

                            {/* Today's date below Transmission */}
                            <p className="mt-1 text-gray-600 font-medium">
                                <span className="font-semibold">Today:</span> {today}
                            </p>

                            <p className="mt-1 text-gray-600">
                                <span className="font-medium">Status:</span>{" "}
                                <span className="text-primary font-semibold">{booking.status}</span>
                            </p>

                            {/* View ID Proof */}
                            {booking.idProof && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">ID Proof:</span>{" "}
                                    <a
                                        href={`${BACKEND_URL}${booking.idProof}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        View File
                                    </a>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingsList;