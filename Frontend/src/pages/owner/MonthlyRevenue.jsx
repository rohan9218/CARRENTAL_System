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
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
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

    useEffect(() => {
        fetchRevenueData();
    }, [month, year]);

    return (
        <div className="px-4 pt-10 md:px-10 flex-1">
            <Title
                title="Monthly Revenue (Daily View)"
                subTitle="View revenue breakdown for selected month"
            />

            {/* Month & Year Selector */}
            <div className="flex gap-4 justify-center mb-6">
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="border px-3 py-2 rounded-md"
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
                >
                    {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <button
                    onClick={fetchRevenueData}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                >
                    Refresh
                </button>
            </div>

            {/* Revenue Graph */}
            <div className="border border-borderColor rounded-md p-6 w-full max-w-4xl mx-auto bg-white">
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

            <div className="flex justify-center mt-6">
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
