import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { axios, isOwner, currency, user, loading } = useAppContext();
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
    commission: 0,
  });

  const dashboardCards = [
    { key: "cars", title: "Total Cars", value: data.totalCars, icon: assets.carIconColored, path: "/owner/cars" },
    { key: "bookings", title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored, path: "/owner/bookings" },
    { key: "pending", title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored, path: "/owner/bookings/pending" },
    { key: "confirmed", title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored, path: "/owner/bookings/confirmed" },
  ];

  const fetchDashboardData = async () => {
    try {
      const { data: res } = await axios.get("/api/owner/dashboard");
      if (res.success) {
        const filteredRecentBookings = res.dashboardData.recentBookings.filter(
          (booking) => booking.car
        );
        setData({
          ...res.dashboardData,
          recentBookings: filteredRecentBookings,
        });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Fetch dashboard error:", error.message);
      toast.error("Failed to load dashboard data. Check server connection.");
    }
  };

  useEffect(() => {
    if (!loading && !isOwner) {
      navigate("/"); // ✅ only redirect after loading is complete
    }
  }, [loading, isOwner, navigate]);

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData();
    }
  }, [isOwner]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>; // ✅ prevent flicker redirect
  }

  return (
    <div className="px-4 pt-10 md:px-10 flex-1">
      <Title
        title="Admin Dashboard"
        subTitle="Monitor overall platform performance including total cars, booking, revenue, and recent activities"
      />

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}
            className="cursor-pointer flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor hover:shadow-md transition"
          >
            <div>
              <h1 className="text-xs text-gray-500">{card.title}</h1>
              <p className="text-lg font-semibold">{card.value}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <img src={card.icon} alt="" className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6 mb-8 w-full">
        {/* Recent bookings */}
        <div className="p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full">
          <h1 className="text-lg font-medium">Recent Bookings</h1>
          <p className="text-gray-500">Latest customer bookings</p>

          {data.recentBookings.length === 0 && (
            <p className="text-sm text-gray-400 mt-4">No recent bookings</p>
          )}

          {data.recentBookings.map((booking, index) => (
            <div key={index} className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <img src={assets.listIconColored} alt="" className="h-5 w-5" />
                </div>
                <div>
                  <p>{booking.car?.brand || "Unknown"} {booking.car?.model || ""}</p>
                  <p className="text-sm text-gray-500">
                    {booking.createdAt ? booking.createdAt.split("T")[0] : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <p className="text-sm text-gray-500">{currency}{booking.price}</p>
                <p className="px-3 py-0.5 border border-borderColor rounded-full text-sm">
                  {booking.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly revenue + Commission */}
        <div className="flex flex-col gap-6 w-full md:max-w-xs">
          {/* Monthly revenue */}
          <div className="p-4 md:p-6 border border-borderColor rounded-md">
            <h1 className="text-lg font-medium">Monthly Revenue</h1>
            <p className="text-gray-500">Revenue for current month</p>
            <p className="text-3xl mt-6 font-semibold text-primary">
              {currency}{data.monthlyRevenue}
            </p>
          </div>

          {/* Commission Box only for specific owner */}
          {user?.email === "rohandesai9218@gmail.com" && (
            <div className="p-4 md:p-6 border border-borderColor rounded-md">
              <h1 className="text-lg font-medium">Commission</h1>
              <p className="text-gray-500">Your earned commission</p>
              <p className="text-3xl mt-6 font-semibold text-primary">
                {currency}{parseFloat(data.commission).toFixed(1)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;