import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const Owners = () => {
    const { axios, currency } = useAppContext();
    const [owners, setOwners] = useState([]);
    const [revenues, setRevenues] = useState({});
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [ownerCars, setOwnerCars] = useState([]);
    const [showCarsModal, setShowCarsModal] = useState(false);
    const [loadingCars, setLoadingCars] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState("Your car papers are not clear");
    const [deletingCar, setDeletingCar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch all owners (only if main owner)
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get("/api/owner/me");

                if (Array.isArray(data)) {
                    setOwners(data);
                } else if (data) {
                    setOwners([data]);
                } else {
                    setOwners([]);
                }
                setError("");
            } catch (error) {
                console.error("Error fetching owners:", error);
                setError("Failed to load vendors. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, [axios]);

    // Fetch each owner's real monthly revenue separately
    useEffect(() => {
        const fetchRevenues = async () => {
            try {
                const revenueData = {};

                await Promise.all(
                    owners.map(async (owner) => {
                        try {
                            const { data } = await axios.get(`/api/owner/dashboard/${owner._id}`);

                            if (data?.dashboardData?.monthlyRevenue !== undefined) {
                                revenueData[owner._id] = data.dashboardData.monthlyRevenue;
                            } else {
                                revenueData[owner._id] = 0;
                            }
                        } catch (err) {
                            console.error(`Error fetching revenue for ${owner.name}:`, err);
                            revenueData[owner._id] = 0;
                        }
                    })
                );

                setRevenues(revenueData);
            } catch (error) {
                console.error("Error fetching all revenues:", error);
            }
        };

        if (owners.length > 0) fetchRevenues();
    }, [owners, axios]);

    // Fetch owner's cars using the new backend API
    const fetchOwnerCars = async (owner) => {
        setLoadingCars(true);
        setSelectedOwner(owner);

        try {
            const { data } = await axios.get(`/api/owner/cars/${owner._id}`);

            if (data.success) {
                setOwnerCars(data.cars);
                setShowCarsModal(true);
            } else {
                console.error("Failed to fetch owner cars:", data.message);
                setOwnerCars([]);
            }
        } catch (error) {
            console.error("Error fetching owner cars:", error);
            setOwnerCars([]);
        } finally {
            setLoadingCars(false);
        }
    };

    // Close cars modal
    const closeCarsModal = () => {
        setShowCarsModal(false);
        setSelectedOwner(null);
        setOwnerCars([]);
    };

    // Open delete confirmation modal
    const openDeleteModal = (car) => {
        setCarToDelete(car);
        setDeleteReason("Your car papers are not clear");
        setShowDeleteModal(true);
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCarToDelete(null);
        setDeleteReason("Your car papers are not clear");
    };

    // Delete car function
    const deleteCar = async () => {
        if (!carToDelete) return;

        setDeletingCar(true);
        try {
            const { data } = await axios.post("/api/owner/delete-car-by-admin", {
                carId: carToDelete._id,
                reason: deleteReason
            });

            if (data.success) {
                toast.success("Car deleted successfully and notification sent to owner");

                // Remove the car from the local state
                setOwnerCars(prevCars => prevCars.filter(car => car._id !== carToDelete._id));

                closeDeleteModal();
            } else {
                toast.error(data.message || "Failed to delete car");
            }
        } catch (error) {
            console.error("Error deleting car:", error);
            toast.error(error.response?.data?.message || "Failed to delete car");
        } finally {
            setDeletingCar(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 w-full">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-6 w-full">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 w-full">
            {/* Header Section */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor List</h2>
                <p className="text-gray-600 mt-2 text-sm md:text-base">
                    Manage all registered vendors and their cars
                </p>
            </div>

            {owners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
                    <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">No vendors found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        No vendors have registered yet. They will appear here once they sign up.
                    </p>
                </div>
            ) : (
                <>
                    {/* Mobile/Tablet View - Card Layout */}
                    <div className="block md:hidden space-y-4">
                        {owners.map((owner, index) => (
                            <div
                                key={owner._id || index}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-primary font-semibold text-lg">
                                                {owner.name ? owner.name.charAt(0).toUpperCase() : 'V'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-base truncate">
                                                    {owner.name || 'Unnamed Vendor'}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1 truncate">
                                                    {owner.email || 'No email provided'}
                                                </p>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                Vendor
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Monthly Income:</span>
                                                <span className="font-semibold text-primary">
                                                    {currency}{revenues[owner._id] !== undefined ? revenues[owner._id].toLocaleString() : "0"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <button
                                                onClick={() => fetchOwnerCars(owner)}
                                                disabled={loadingCars && selectedOwner?._id === owner._id}
                                                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
                                            >
                                                {loadingCars && selectedOwner?._id === owner._id ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Loading...
                                                    </span>
                                                ) : "View Cars"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View - Table Layout */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Monthly Income
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {owners.map((owner, index) => (
                                        <tr
                                            key={owner._id || index}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <span className="text-primary font-semibold">
                                                            {owner.name ? owner.name.charAt(0).toUpperCase() : 'V'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {owner.name || 'Unnamed Vendor'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Registered Vendor
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{owner.email || 'No email provided'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-primary">
                                                    {currency}{revenues[owner._id] !== undefined ? revenues[owner._id].toLocaleString() : "0"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Current month
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => fetchOwnerCars(owner)}
                                                    disabled={loadingCars && selectedOwner?._id === owner._id}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {loadingCars && selectedOwner?._id === owner._id ? "Loading..." : "View Cars"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600">
                        <div className="mb-2 sm:mb-0">
                            <span className="font-medium text-gray-900">{owners.length}</span>
                            <span className="ml-1">vendor{owners.length !== 1 ? 's' : ''} • </span>
                            {/* <span className="text-primary font-medium">
                                Total Income: {currency}
                                {Object.values(revenues).reduce((sum, revenue) => sum + (revenue || 0), 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Data updates in real-time
                        </div>*/}
                        </div>
                    </div>
                </>
            )}

            {/* Owner Cars Modal (Responsive) */}
            {showCarsModal && selectedOwner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden mx-2 md:mx-0">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-semibold text-sm md:text-base">
                                        {selectedOwner.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold text-gray-800">
                                        {selectedOwner.name}'s Cars
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600 truncate max-w-xs">
                                        {selectedOwner.email} • {ownerCars.length} car{ownerCars.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeCarsModal}
                                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-3 md:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {ownerCars.length > 0 ? (
                                <>
                                    {/* Mobile/Tablet View - Cards */}
                                    <div className="block lg:hidden space-y-4">
                                        {ownerCars.map((car) => (
                                            <div key={car._id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-start space-x-3">
                                                    <img
                                                        src={car.image}
                                                        alt={`${car.brand} ${car.model}`}
                                                        className="w-16 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-sm">
                                                                    {car.brand} {car.model}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">{car.year} • {car.category}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded text-xs ${car.isAvaliable
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {car.isAvaliable ? 'Available' : 'Booked'}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-xs">
                                                                <span className="font-medium">Price:</span>
                                                                <span className="text-primary font-semibold ml-1">
                                                                    {currency}{car.pricePerDay}/day
                                                                </span>
                                                            </div>
                                                            <div className="text-xs">
                                                                <span className="font-medium">Transmission:</span> {car.transmission}
                                                            </div>
                                                            <div className="text-xs">
                                                                <span className="font-medium">Fuel:</span> {car.fuel_type}
                                                            </div>
                                                            <div className="text-xs">
                                                                <span className="font-medium">Seats:</span> {car.seating_capacity}
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                                            {car.insurancePaper ? (
                                                                <a
                                                                    href={car.insurancePaper}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 text-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors"
                                                                >
                                                                    View Insurance
                                                                </a>
                                                            ) : (
                                                                <span className="flex-1 text-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                                                                    No Insurance
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => openDeleteModal(car)}
                                                                className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs hover:bg-red-100 transition-colors"
                                                            >
                                                                Delete Car
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop View - Table */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="w-full border">
                                            <thead>
                                                <tr className="bg-gray-100 text-gray-700">
                                                    <th className="border p-3 text-left">Car Image</th>
                                                    <th className="border p-3 text-left">Brand & Model</th>
                                                    <th className="border p-3 text-left">Details</th>
                                                    <th className="border p-3 text-left">Price/Day</th>
                                                    <th className="border p-3 text-left">Status</th>
                                                    <th className="border p-3 text-left">Insurance</th>
                                                    <th className="border p-3 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ownerCars.map((car) => (
                                                    <tr key={car._id} className="hover:bg-gray-50">
                                                        <td className="border p-3">
                                                            <img
                                                                src={car.image}
                                                                alt={`${car.brand} ${car.model}`}
                                                                className="w-16 h-12 object-cover rounded"
                                                            />
                                                        </td>
                                                        <td className="border p-3">
                                                            <div className="font-semibold">{car.brand} {car.model}</div>
                                                            <div className="text-sm text-gray-500">{car.year} • {car.category}</div>
                                                        </td>
                                                        <td className="border p-3">
                                                            <div className="text-sm space-y-1">
                                                                <div><span className="font-medium">Transmission:</span> {car.transmission}</div>
                                                                <div><span className="font-medium">Fuel:</span> {car.fuel_type}</div>
                                                                <div><span className="font-medium">Seating:</span> {car.seating_capacity} persons</div>
                                                                <div><span className="font-medium">Location:</span> {car.location}</div>
                                                            </div>
                                                        </td>
                                                        <td className="border p-3 font-semibold text-primary text-center">
                                                            {currency}{car.pricePerDay}
                                                        </td>
                                                        <td className="border p-3 text-center">
                                                            <span className={`px-2 py-1 rounded text-xs ${car.isAvaliable
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {car.isAvaliable ? 'Available' : 'Not Available'}
                                                            </span>
                                                        </td>
                                                        <td className="border p-3 text-center">
                                                            {car.insurancePaper ? (
                                                                <a
                                                                    href={car.insurancePaper}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                                                >
                                                                    View Document
                                                                </a>
                                                            ) : (
                                                                <span className="text-red-600 text-sm">Not Uploaded</span>
                                                            )}
                                                        </td>
                                                        <td className="border p-3 text-center">
                                                            <button
                                                                onClick={() => openDeleteModal(car)}
                                                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">No cars found for this vendor</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {selectedOwner.name} hasn't listed any cars yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between items-center p-3 md:p-4 border-t bg-gray-50">
                            <div className="text-xs md:text-sm text-gray-600">
                                Showing {ownerCars.length} car{ownerCars.length !== 1 ? 's' : ''} for {selectedOwner.name}
                            </div>
                            <button
                                onClick={closeCarsModal}
                                className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal (Responsive) */}
            {showDeleteModal && carToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="p-4 md:p-6">
                            {/* Modal Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Car</h3>
                                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                                </div>
                            </div>

                            {/* Car Info */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src={carToDelete.image}
                                        alt={`${carToDelete.brand} ${carToDelete.model}`}
                                        className="w-12 h-10 object-cover rounded flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <div className="font-semibold truncate">{carToDelete.brand} {carToDelete.model}</div>
                                        <div className="text-sm text-gray-500 truncate">Owner: {selectedOwner?.name}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Reason */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for deletion:
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                                    placeholder="Enter reason for deletion..."
                                />
                            </div>

                            {/* Warning Message */}
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> This will delete the car and all associated bookings.
                                    A notification with the reason above will be sent to the car owner.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    onClick={closeDeleteModal}
                                    disabled={deletingCar}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteCar}
                                    disabled={deletingCar}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deletingCar ? "Deleting..." : "Delete Car"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Owners;