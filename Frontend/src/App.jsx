import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import ContactUs from "./components/ContactUs";
import FeedbackForm from "./components/FeedbackForm";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import { useAppContext } from "./context/AppContext";
import AboutUs from "./pages/AboutUs";
import CarDetails from "./pages/CarDetails";
import Cars from "./pages/Cars";
import Home from "./pages/Home";
import MyBookings from "./pages/MyBookings";
import AddCar from "./pages/owner/AddCar";
import BookingsList from "./pages/owner/BookingsList";
import CarsList from "./pages/owner/CarsList";
import ConfirmedList from "./pages/owner/ConfirmedList";
import CustomerList from "./pages/owner/CustomerList";
import Dashboard from "./pages/owner/Dashboard";
import Layout from "./pages/owner/Layout";
import ManageBookings from "./pages/owner/ManageBookings";
import ManageCars from "./pages/owner/ManageCars";
import OwnerFeedbacks from "./pages/owner/OwnerFeedbacks";
import Owners from "./pages/owner/Owners";
import PendingList from "./pages/owner/PendingList";
import Profile from "./pages/Profile"; // ✅ Import Profile
import UpdateBooking from "./pages/UpdateBooking";
import HelpCenter from "./resources/HelpCenter";
import TeamService from "./resources/TeamService";

const App = () => {
  const { showLogin } = useAppContext();
  const isOwnerPath = useLocation().pathname.startsWith("/owner");

  return (
    <>
      <Toaster />
      {showLogin && <Login />}

      {!isOwnerPath && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="*" element={<MyBookings />} />
        <Route path="/update-booking/:id" element={<UpdateBooking />} /> {/* ✅ Fixed */}

        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
      
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/owner/feedbacks" element={<OwnerFeedbacks />} />

        {/* ✅ Customer Profile Route Added */}
        <Route path="/profile" element={<Profile />} />

        {/* Resources */}
        <Route path="/helpcenter" element={<HelpCenter />} />
        <Route path="/teamservice" element={<TeamService />} />

        <Route path="/owner" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* Default route for /owner */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="add-car" element={<AddCar />} />
          <Route path="/owner/add-car/:id" element={<AddCar />} />
          <Route path="manage-cars" element={<ManageCars />} />
          <Route path="manage-bookings" element={<ManageBookings />} />
          <Route path="cars" element={<CarsList />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="bookings/pending" element={<PendingList />} />
          <Route path="bookings/confirmed" element={<ConfirmedList />} />

          {/* ✅ New Routes */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="owners" element={<Owners />} />
        </Route>
      </Routes>

      {!isOwnerPath && <Footer />}
    </>
  );
};

export default App;
