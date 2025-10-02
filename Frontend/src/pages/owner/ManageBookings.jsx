import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";

const ManageBookings = () => {
  const { axios, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/owner");
      data.success ? setBookings(data.bookings) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post("/api/bookings/change-status", { bookingId, status });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Bookings"
        subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses"
      />

      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-gray-500">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Date Range</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium max-md:hidden">Payment</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking, index) => {
              const car = booking?.car; // safe check
              return (
                <tr key={index} className="border-t border-borderColor">
                  <td className="p-3 flex items-center gap-3">
                    {car ? (
                      <>
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className="h-12 w-12 aspect-square rounded-md object-cover"
                        />
                        <p className="font-medium max-md:hidden">
                          {car.brand} {car.model}
                        </p>
                      </>
                    ) : (
                      <p className="text-red-400 italic">Car Deleted</p>
                    )}
                  </td>

                  <td className="p-3 max-md:hidden">
                    {booking.pickupDate?.split("T")[0]} to {booking.returnDate?.split("T")[0]}
                  </td>

                  <td className="p-3">
                    {currency}
                    {booking.price}
                  </td>

                  <td className="p-3 max-md:hidden">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">offline</span>
                  </td>

                  <td className="p-3">
                    <select
                      onChange={(e) => changeBookingStatus(booking._id, e.target.value)}
                      value={booking.status || "pending"} // Default to "pending" if status is undefined
                      className="px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;