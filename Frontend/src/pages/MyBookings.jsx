import { motion } from 'motion/react'
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import FeedbackForm from "../components/FeedbackForm"
import Title from "../components/Title"
import { useAppContext } from "../context/AppContext"

const MyBookings = () => {
  const { axios, user, currency } = useAppContext()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const [showHistory, setShowHistory] = useState(false)

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/bookings/${id}`);
      if (data.success) {
        toast.success("Booking deleted");
        setBookings(prev => prev.filter((b) => b._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error deleting booking");
    }
  };

  const handleUpdate = (booking) => {
    navigate(`/update-booking/${booking._id}`, { state: { booking } })
  }

  const handleFeedback = (booking) => {
    setSelectedBooking(booking)
    setShowFeedback(true)
  }

  useEffect(() => {
    if (localStorage.getItem("feedbackSubmitted") === "true") {
      toast.success("Feedback submitted successfully ✅");
      localStorage.removeItem("feedbackSubmitted");
    }
  }, [])

  useEffect(() => {
    if (user) fetchMyBookings()
  }, [user])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingBookings = bookings.filter(b => {
    const returnDate = new Date(b.returnDate)
    return returnDate >= today
  })

  const historyBookings = bookings.filter(b => {
    const returnDate = new Date(b.returnDate)
    return returnDate < today
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-25 text-sm max-w-7xl">

      <div className="flex justify-between items-center">
        <Title 
          title={showHistory ? "Booking History" : "My Bookings"} 
          subTitle={showHistory ? "Your completed bookings" : "View and manage your car bookings"} 
          align="left" 
        />

        <button
          onClick={() => setShowHistory(prev => !prev)}
          className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
        >
          {showHistory ? "Back to Bookings" : "History"}
        </button>
      </div>

      <div>
        {(showHistory ? historyBookings : upcomingBookings).map((booking, index) => {

          // ⭐ NEW LOGIC → HIDE BUTTONS IF TODAY >= PICKUP DATE
          const pickup = new Date(booking.pickupDate)
          pickup.setHours(0, 0, 0, 0)
          const disableActions = today >= pickup

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              key={booking._id}
              className="relative grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12 z-10"
            >

              {/* Car Image */}
              <div className="md:col-span-1">
                <div className="rounded-md overflow-hidden mb-3">
                  <img
                    src={booking?.car?.image || assets.placeholder_car}
                    className="w-full h-auto aspect-video object-cover"
                    alt=""
                  />
                </div>
                <p className="text-lg font-medium mt-2">
                  {booking?.car?.brand} {booking?.car?.model}
                </p>
                <p className="text-gray-500">
                  {booking?.car?.year} • {booking?.car?.category} • {booking?.car?.location}
                </p>
              </div>

              {/* Booking Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <p className="px-3 py-1.5 bg-light rounded">Booking #{index + 1}</p>
                  <p className={`px-3 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-400/15 text-green-600'
                      : booking.status === 'pending'
                        ? 'bg-yellow-400/15 text-yellow-600'
                        : 'bg-red-400/15 text-red-600'
                  }`}>
                    {booking.status}
                  </p>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img src={assets.calendar_icon_colored} alt="" className="w-4 h-4 mt-1" />
                  <div>
                    <p className="text-gray-500">Rental Period</p>
                    <p>{booking.pickupDate?.split('T')[0]} To {booking.returnDate?.split('T')[0]}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img src={assets.location_icon_colored} alt="" className="w-4 h-4 mt-1" />
                  <div>
                    <p className="text-gray-500">Pick-up Location</p>
                    <p>{booking?.car?.location}</p>
                  </div>
                </div>

                {booking.withDriver && (
                  <div className="flex items-start gap-2 mt-3">
                    <img src={assets.driver_icon} alt="" className="w-4 h-4 mt-1" />
                    <div>
                      <p className="text-gray-500">Driver Service</p>
                      <p className="text-green-600">With Driver</p>
                      {booking.userAddress && (
                        <p className="text-xs text-gray-600 mt-1">
                          Address: {booking.userAddress}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Price + Actions */}
              <div className="md:col-span-1 flex flex-col justify-between gap-6">
                <div className="text-sm text-gray-500 text-right">
                  <p>Total Price</p>
                  <h1 className="text-2xl font-semibold text-primary">
                    {currency}{booking.displayPrice || booking.price}
                  </h1>
                  <p>Booked on {booking?.createdAt?.split('T')[0]}</p>

                  {booking.verificationCode && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Verification Code:</p>
                      <p className="font-mono font-bold text-blue-700">
                        {booking.verificationCode}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">

                  {/* ⭐ NEW CONDITION APPLIED HERE */}
                  {!showHistory && booking.status !== "cancelled" && !disableActions && (
                    <button
                      onClick={() => handleUpdate(booking)}
                      className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
                    >
                      Update Booking
                    </button>
                  )}

                  {!showHistory && !disableActions && (
                    <button
                      type="button"
                      onClick={() => handleDelete(booking._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                    >
                      Delete Booking
                    </button>
                  )}

                  {showHistory && (
                    <button
                      type="button"
                      onClick={() => handleFeedback(booking)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                    >
                      Feedback
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showFeedback && selectedBooking && (
        <FeedbackForm
          booking={selectedBooking}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </motion.div>
  )
}

export default MyBookings
