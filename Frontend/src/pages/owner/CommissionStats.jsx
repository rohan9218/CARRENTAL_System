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

const CommissionStats = () => {
    const { axios, currency } = useAppContext();
    const navigate = useNavigate();

    // ✅ Set default to current month and year
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [commissionData, setCommissionData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCommissionData = async () => {
        try {
            setLoading(true);
            const { data: res } = await axios.get(
                `/api/owner/commission-stats?month=${month}&year=${year}`
            );

            if (res.success && res.commissionData?.length) {
                setCommissionData(res.commissionData);
            } else {
                setCommissionData([]);
                toast.error("No commission data found for this month.");
            }
        } catch (error) {
            console.error("Error fetching commission:", error.message);
            toast.error("Failed to load commission graph data.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Automatically fetch data for the current month on mount
    useEffect(() => {
        fetchCommissionData();
    }, []);

    // ✅ Fetch again when user changes month or year
    useEffect(() => {
        fetchCommissionData();
    }, [month, year]);

    return (
        <div className="px-4 pt-10 md:px-10 flex-1">
            <Title
                title="Monthly Commission (Daily View)"
                subTitle="View your commission earnings for selected month"
            />

            {/* Month & Year Selector */}
            <div className="flex gap-4 justify-center mb-6">
                <p className="px-0 py-2">Select Month</p>
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
                    <p className="px-0 py-2">Select Year</p>
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

                {/*  <button
                    onClick={fetchCommissionData}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                >
                    Refresh
                </button>*/}
            </div>

            {/* Commission Graph */}
            <div className="border border-borderColor rounded-md p-6 w-full max-w-4xl mx-auto bg-white">
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={commissionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", dy: 10 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => `${currency}${value}`} />
                            <Bar dataKey="commission" fill="#10b981" barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
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

export default CommissionStats;
