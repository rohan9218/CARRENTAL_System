import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const PendingList = () => {
    const { axios, currency } = useAppContext();
    const [pending, setPending] = useState([]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const { data } = await axios.get("/api/owner/bookings/pending");
                if (data.success) {
                    // Filter out bookings where the car is null or undefined AND return date hasn't passed
                    const currentDate = new Date();
                    const filteredBookings = data.bookings.filter(
                        (booking) => 
                            booking.car && 
                            new Date(booking.returnDate) >= currentDate
                    );
                    setPending(filteredBookings);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchPending();
    }, [axios]);

    const today = new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
        hour12: true,
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Active Pending Bookings</h1>

            {pending.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No active pending bookings</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pending.map((booking, index) => (
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

                            {/* ✅ User Info */}
                            {booking.user && (
                                <div className="mt-2 text-gray-600">
                                    <p>
                                        <span className="font-medium">Booked By:</span>{" "}
                                        {booking.user.name}
                                    </p>
                                </div>
                            )}

                            {/* Booking Dates */}
                            <div className="mt-2 text-gray-600">
                                <p>
                                    <span className="font-medium">Pickup:</span>{" "}
                                    {new Date(booking.pickupDate).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className="font-medium">Return:</span>{" "}
                                    {new Date(booking.returnDate).toLocaleDateString()}
                                </p>
                            </div>

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

                            {booking.car?.seats && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Seats:</span> {booking.car.seats}
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
                                <span className="text-primary font-semibold">Pending</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingList;