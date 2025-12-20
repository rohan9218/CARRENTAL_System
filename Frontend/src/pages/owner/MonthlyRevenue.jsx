import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";

const MonthlyRevenue = () => {
    const { axios, currency } = useAppContext();
    const [revenueData, setRevenueData] = useState([]);
    const [monthlyBookings, setMonthlyBookings] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchRevenueData = async () => {
        try {
            const { data: res } = await axios.get(
                `/api/owner/revenue-stats?month=${month}&year=${year}`
            );

            if (res.success && res.revenueData) {
                setRevenueData(res.revenueData);
            } else {
                toast.error("No revenue data found for selected month.");
            }
        } catch (error) {
            console.error(error.message);
            toast.error("Failed to load revenue graph data.");
        }
    };

    const fetchMonthlyBookings = async () => {
        try {
            const { data: res } = await axios.get(
                `/api/owner/monthly-bookings?month=${month}&year=${year}`
            );

            if (res.success && res.bookings) {
                setMonthlyBookings(res.bookings);
            } else {
                setMonthlyBookings([]);
            }
        } catch (error) {
            console.error("Failed to fetch monthly bookings:", error.message);
            setMonthlyBookings([]);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchRevenueData(), fetchMonthlyBookings()]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [month, year]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'confirmed': { color: 'bg-green-400/15 text-green-600', text: 'Confirmed' },
            'pending': { color: 'bg-yellow-400/15 text-yellow-600', text: 'Pending' },
            'cancelled': { color: 'bg-red-400/15 text-red-600', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getPaymentModeBadge = (paymentMode) => {
        const modeConfig = {
            'online': { color: 'bg-blue-400/15 text-blue-600', text: 'Online' },
            'cash': { color: 'bg-gray-400/15 text-gray-600', text: 'Cash' }
        };

        const config = modeConfig[paymentMode] || modeConfig.cash;
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <div className="px-4 pt-10 md:px-10 flex-1">
            <Title
                title="Monthly Revenue (Daily View)"
                subTitle="View revenue breakdown and user bookings for selected month"
            />

            {/* Month & Year Selector */}
            <div className="flex gap-4 justify-center mb-6">
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="border px-3 py-2 rounded-md"
                    disabled={loading}
                >
                    {[
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    ].map((m, i) => (
                        <option key={i + 1} value={i + 1}>
                            {m}
                        </option>
                    ))}
                </select>

                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="border px-3 py-2 rounded-md"
                    disabled={loading}
                >
                    {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <button
                    onClick={loadData}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {/* Revenue Graph */}
            <div className="border border-borderColor rounded-md p-6 w-full max-w-4xl mx-auto bg-white mb-8">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", dy: 10 }} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${currency}${value}`} />
                        <Bar dataKey="revenue" fill="#3b82f6" barSize={25} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Monthly Bookings List */}
            <div className="max-w-6xl mx-auto">
                <div className="bg-white border border-borderColor rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            User Bookings for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({monthlyBookings.length} bookings)
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-gray-500 mt-2">Loading bookings...</p>
                        </div>
                    ) : monthlyBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-borderColor">
                                        <th className="text-left p-3 font-medium text-gray-700">User Name</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Car</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Booking Dates</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Price</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Status</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Payment Mode</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Payment ID</th>
                                        {/* <th className="text-left p-3 font-medium text-gray-700">Action</th>*/}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyBookings.map((booking) => (
                                        <tr key={booking._id} className="border-b border-borderColor hover:bg-gray-50">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {booking.user?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {booking.user?.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <p className="font-medium">
                                                    {booking.car?.brand} {booking.car?.model}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {booking.car?.category}
                                                </p>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="text-sm">
                                                        {new Date(booking.pickupDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        to {new Date(booking.returnDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <p className="font-semibold text-primary">
                                                    {currency}{booking.ownerPrice || booking.price}
                                                </p>
                                            </td>
                                            <td className="p-3">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="p-3">
                                                {getPaymentModeBadge(booking.paymentMode)}
                                            </td>
                                            <td className="p-3">
                                                <p className="text-xs font-mono text-gray-600 max-w-32 truncate">
                                                    {booking.paymentId || 'N/A'}
                                                </p>
                                            </td>
                                            {/*  <td className="p-3">
                                                <span className="text-xs text-green-600 font-medium">
                                                    Active Booking
                                                </span>
                                            </td>
                                            */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No bookings found for selected month</p>
                            <p className="text-gray-400 text-sm mt-2">
                                There are no user bookings for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default MonthlyRevenue;