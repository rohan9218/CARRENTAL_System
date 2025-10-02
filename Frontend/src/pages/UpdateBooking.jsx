import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const UpdateBooking = () => {
    const { axios } = useAppContext();
    const { id } = useParams();
    const navigate = useNavigate();

    const [pickupDate, setPickupDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [withDriver, setWithDriver] = useState(false);
    const [userAddress, setUserAddress] = useState("");
    const [idProof, setIdProof] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);

    // ✅ Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Fetch booking details
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get(`/api/bookings/${id}`);
                if (res.data) {
                    setBooking(res.data);
                    setPickupDate(res.data.pickupDate?.slice(0, 10)); // format YYYY-MM-DD
                    setReturnDate(res.data.returnDate?.slice(0, 10));
                    setWithDriver(res.data.withDriver || false);
                    setUserAddress(res.data.userAddress || "");
                } else {
                    toast.error("Booking not found");
                    navigate("/my-bookings");
                }
            } catch (error) {
                toast.error("Booking not found");
                navigate("/my-bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [axios, id, navigate]);

    // Handle update booking
    const handleUpdate = async () => {
        if (!pickupDate || !returnDate) {
            toast.error("Please select both dates");
            return;
        }

        if (new Date(returnDate) <= new Date(pickupDate)) {
            toast.error("Return date must be after pickup date");
            return;
        }

        if (withDriver && !userAddress.trim()) {
            toast.error("Please enter your address for driver service");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("pickupDate", pickupDate);
            formData.append("returnDate", returnDate);
            formData.append("withDriver", withDriver);
            if (withDriver) formData.append("userAddress", userAddress);
            if (idProof) formData.append("idProof", idProof);

            const res = await axios.put(`/api/bookings/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                toast.success("Booking updated successfully");
                navigate("/my-bookings");
            } else {
                toast.error(res.data.message || "Failed to update booking");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating booking");
        }
    };

    const handleDriverChange = (value) => {
        setWithDriver(value);
        if (!value) {
            setUserAddress(""); // Clear address when switching to without driver
        }
    };

    if (loading) return <p className="text-center mt-10">Loading booking...</p>;

    return (
        <div className="max-w-lg mx-auto p-6 mt-23">
            <h2 className="text-2xl font-bold mb-6">Update Booking</h2>
            
            {/* Car Info 
            {booking?.car && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-lg">
                        {booking.car.brand} {booking.car.model}
                    </h3>
                    <p className="text-gray-600">
                        {booking.car.year} • {booking.car.category} • {booking.car.location}
                    </p>
                </div>
            )}
                */}

            <div className="space-y-4">
                <div>
                    <label className="block mb-2 font-medium">Pickup Date</label>
                    <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={today}
                        className="w-full border border-gray-300 p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Return Date</label>
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || today}
                        className="w-full border border-gray-300 p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Driver Option</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="driverOption"
                                value="with"
                                checked={withDriver}
                                onChange={() => handleDriverChange(true)}
                                className="w-4 h-4"
                            />
                            With Driver
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="driverOption"
                                value="without"
                                checked={!withDriver}
                                onChange={() => handleDriverChange(false)}
                                className="w-4 h-4"
                            />
                            Without Driver
                        </label>
                    </div>
                </div>

                {withDriver && (
                    <div>
                        <label className="block mb-2 font-medium">Your Address for Driver Pickup *</label>
                        <textarea
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                            placeholder="Enter your complete address where the driver should pick you up"
                            className="w-full border border-gray-300 p-3 rounded-lg resize-none h-20"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block mb-2 font-medium">Update ID Proof (Optional)</label>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setIdProof(e.target.files[0])}
                        className="w-full border border-gray-300 p-3 rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Leave empty to keep current ID proof
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleUpdate}
                        className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dull transition font-medium"
                    >
                        Update Booking
                    </button>
                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateBooking;