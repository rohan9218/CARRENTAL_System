import { motion } from 'motion/react';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import CarCard from "../components/CarCard";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";

const Cars = () => {
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const { cars, axios, carSearchInput, setCarSearchInput } = useAppContext();
  
  const isSearchData = pickupLocation && pickupDate && returnDate;

  const [filteredCars, setFilteredCars] = useState([]);
  const [allAvailableCars, setAllAvailableCars] = useState([]);
  const [input, setInput] = useState(carSearchInput || ""); // local input for live search

  // --- helpers to normalize search text (handles "A6" vs "a 6" vs "a six") ---
  const wordsToDigits = (str = "") =>
    str.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, (m) => {
      const map = { one:"1", two:"2", three:"3", four:"4", five:"5", six:"6", seven:"7", eight:"8", nine:"9", ten:"10" };
      return map[m.toLowerCase()] || m;
    });

  const normalize = (str = "") =>
    wordsToDigits(String(str))
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")  // drop punctuation
      .replace(/\s+/g, " ")          // collapse spaces
      .trim();

  const matchesQuery = (haystack, needle) => {
    const h = normalize(haystack);
    const n = normalize(needle);
    if (!n) return true;
    // also compare compact versions to match "a6" vs "a 6"
    const hc = h.replace(/\s+/g, "");
    const nc = n.replace(/\s+/g, "");
    return h.includes(n) || hc.includes(nc);
  };
  // ---------------------------------------------------------------------------

  // Apply search filter
  const applyFilter = (value) => {
    if (!value) {
      setFilteredCars(allAvailableCars || []);
      return;
    }

    const filtered = (allAvailableCars || []).filter((car) => {
      const brand = car?.brand ?? "";
      const model = car?.model ?? "";
      const category = car?.category ?? "";
      const transmission = car?.transmission ?? "";
      const location = car?.location ?? "";

      // single searchable blob improves matching for phrases like "Audi A6"
      const blob = `${brand} ${model} ${category} ${transmission} ${location}`;
      return matchesQuery(blob, value);
    });

    setFilteredCars(filtered);
  };

  // Fetch available cars
  const searchCarAvailability = async () => {
    try {
      const { data } = await axios.post("/api/bookings/check-availability", {
        location: pickupLocation,
        pickupDate,
        returnDate,
      });

      if (data.success) {
        const list = data.availableCars || [];
        setAllAvailableCars(list);
        setFilteredCars(list);
        if (list.length === 0) {
          toast("No cars available");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Initialize cars on page load
  useEffect(() => { 
    if (isSearchData) {
      searchCarAvailability();
    } else {
      setAllAvailableCars(cars || []);
      setFilteredCars(cars || []);
    }
    setInput(carSearchInput || ""); // reset local input when page loads
  }, [cars, pickupLocation, pickupDate, returnDate]);

  // Apply filter when input or list changes
  useEffect(() => {
    applyFilter(input);
    setCarSearchInput(input); // update context so Navbar shows current value
  }, [input, allAvailableCars]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center py-20 bg-light max-md:px-4 mt-18"
      >
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles available for your next adventure"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow"
        >
          <img src={assets.search_icon} className="w-4.5 h-4.5 mr-2" alt="" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search by make, model, or features"
            className="w-full h-full outline-none text-gray-500"
          />
          <img src={assets.filter_icon} className="w-4.5 h-4.5 ml-2" alt="" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10"
      >
        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
          Showing {filteredCars.length} Cars
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
          {filteredCars.map((car, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              key={index}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Cars;
