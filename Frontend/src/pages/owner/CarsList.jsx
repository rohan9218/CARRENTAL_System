import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const CarsList = () => {
    const { axios, currency } = useAppContext();
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const { data } = await axios.get("/api/owner/cars");
                if (data.success) {
                    setCars(data.cars);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchCars();
    }, [axios]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">All Cars</h1>

            {cars.length === 0 ? (
                <p className="text-gray-500">No cars available</p>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-gray-50 transition duration-300 bg-white flex flex-col"
                        >
                            {/* Car Image */}
                            <img
                                src={car.image || "https://via.placeholder.com/300x150?text=Car+Image"}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-40 object-cover rounded-md mb-4"
                            />

                            {/* Car Info */}
                            <p className="text-lg font-semibold text-gray-700">
                                {car.brand} {car.model}
                            </p>

                            <p className="mt-1 text-gray-600">
                                <span className="font-medium">Price:</span>{" "}
                                <span className="text-primary font-bold">{currency}{car.pricePerDay}/day</span>
                            </p>

                            {car.year && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Year:</span> {car.year}
                                </p>
                            )}

                            {car.type && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Type:</span> {car.type}
                                </p>
                            )}

                            {car.seats && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Seats:</span> {car.seats}
                                </p>
                            )}

                            {car.fuel && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Fuel:</span> {car.fuel}
                                </p>
                            )}

                            {car.transmission && (
                                <p className="mt-1 text-gray-600">
                                    <span className="font-medium">Transmission:</span> {car.transmission}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CarsList;