import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const ConfirmedList = () => {
    const { axios, currency } = useAppContext();
    const [confirmed, setConfirmed] = useState([]);

    useEffect(() => {
        const fetchConfirmed = async () => {
            try {
                const { data } = await axios.get("/api/bookings/owner");
                if (data.success) {
                    // Filter confirmed bookings and ensure car exists
                    const filteredBookings = data.bookings.filter(
                        (booking) => booking.car && booking.status === 'confirmed'
                    );
                    setConfirmed(filteredBookings);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchConfirmed();
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
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Confirmed Bookings</h1>

            {confirmed.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No confirmed bookings</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {confirmed.map((booking, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 transition duration-300 bg-white flex flex-col"
                        >
                            {/* Car Image */}
                            <img
                                src={booking.car?.image || "/images/car-placeholder.png"}
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
                                    <p>
                                        <span className="font-medium">Email:</span>{" "}
                                        {booking.user.email}
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
                                <span className="text-primary font-bold">{currency}{booking.displayPrice || booking.price}</span>
                            </p>

                            {booking.car?.year && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Year:</span> {booking.car.year}
                                </p>
                            )}

                            {booking.car?.seating_capacity && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Seats:</span> {booking.car.seating_capacity}
                                </p>
                            )}

                            {booking.car?.fuel_type && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Fuel:</span> {booking.car.fuel_type}
                                </p>
                            )}

                            {booking.car?.transmission && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Transmission:</span> {booking.car.transmission}
                                </p>
                            )}

                            {/* Driver Option */}
                            <p className="mt-1 text-gray-600">
                                <span className="font-medium">Driver:</span>{" "}
                                {booking.withDriver ? 'Yes' : 'No'}
                            </p>

                            {/* Pickup Address */}
                            {booking.withDriver && booking.userAddress && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Pickup Address:</span> {booking.userAddress}
                                </p>
                            )}


                            {/* ✅ Verification Code Display */}
                            {booking.verificationCode && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium mb-1">
                                        Pickup Verification Code:
                                    </p>
                                    <div className="text-2xl font-bold text-blue-700 tracking-widest text-center">
                                        {booking.verificationCode}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Customer must present this code during pickup
                                    </p>
                                </div>
                            )}

                            {/* Payment Mode */}
                            <p className="mt-1 text-gray-600">
                                <span className="font-medium">Payment:</span>{" "}
                                <span className="capitalize">{booking.paymentMode}</span>
                            </p>

                            <p className="mt-1 text-gray-600">
                                <span className="font-medium">Status:</span>{" "}
                                <span className="text-green-600 font-semibold capitalize">{booking.status}</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConfirmedList;