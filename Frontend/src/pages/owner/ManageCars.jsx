// src/pages/owner/ManageCars.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets"; // Ensure this path is correct
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";

const ManageCars = () => {
  const { isOwner, axios, currency } = useAppContext();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);

  const fetchOwnerCars = async () => {
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

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post("/api/owner/toggle-car", { carId });
      if (data.success) {
        toast.success("Car availability updated");
        await fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle availability.");
    }
  };

  const removeCar = async (carId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this car?");
    if (!confirmDelete) return;

    try {
      const { data } = await axios.post("/api/owner/delete-car", { carId });
      if (data.success) {
        toast.success("Car deleted successfully");
        await fetchOwnerCars();
        navigate("/owner/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete car.");
    }
  };

  const updateCar = (carId) => {
    navigate(`/owner/add-car/${carId}`); // ✅ Go to update form
  };

  useEffect(() => {
    if (isOwner) fetchOwnerCars();
  }, [isOwner]);

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Cars"
        subTitle="View all listed cars, update their details, or remove them from the booking platform"
      />
      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index} className="border-t border-borderColor">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={car.image}
                    alt=""
                    className="h-12 w-12 aspect-square rounded-md object-cover"
                  />
                  <div className="max-md:hidden">
                    <p className="font-medium">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {car.seating_capacity} • {car.transmission}
                    </p>
                  </div>
                </td>
                <td className="p-3 max-md:hidden">{car.category}</td>
                <td className="p-3">
                  {currency}
                  {car.pricePerDay}
                </td>
                <td className="p-3 max-md:hidden">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      car.isAvaliable
                        ? "bg-green-100 text-green-500"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {car.isAvaliable ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="flex items-center p-3 gap-3">
                  {/* Toggle availability */}
                  <img
                    onClick={() => toggleAvailability(car._id)}
                    src={assets.eye_close_icon || assets.eye_icon || "/default-eye-icon.png"}
                    className="cursor-pointer w-8 h-8"
                    alt="toggle"
                  />
                  {/* Update car */}
                  <img
                    onClick={() => updateCar(car._id)}
                    src={assets.edit_icon_1}
                    className="cursor-pointer w-8 h-8"
                    alt="update"
                  />
                  {/* Delete car */}
                  <img
                    onClick={() => removeCar(car._id)}
                    src={assets.delete_icon || "/default-delete-icon.png"}
                    className="cursor-pointer w-8 h-8"
                    alt="delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCars;
