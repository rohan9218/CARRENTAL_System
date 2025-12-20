import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'

const CarDetails = () => {
    const { id } = useParams()
    const location = useLocation()

    const {
        cars,
        axios,
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate,
        token,
        setShowLogin,
        user
    } = useAppContext()

    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [driverOption, setDriverOption] = useState('without')
    const [showDriverModal, setShowDriverModal] = useState(false)
    const [idProof, setIdProof] = useState(null)
    const [editingBooking, setEditingBooking] = useState(null)
    const [paymentMode, setPaymentMode] = useState('cash')
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [userAddress, setUserAddress] = useState('')
    const [userMobile, setUserMobile] = useState('')
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
    const [isCarAvailable, setIsCarAvailable] = useState(true)
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
    const currency = import.meta.env.VITE_CURRENCY

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const computeNoOfDays = () => {
        if (!pickupDate || !returnDate) return 0;
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const days = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? days : 0;
    };

    // ✅ Total price calculation
    const computeTotalPrice = () => {
        const days = computeNoOfDays();
        if (!car || days === 0) return 0;
        let total = days * car.pricePerDay;
        if (driverOption === 'with') total += 999;
        return total;
    };

    // ✅ Check car availability
    const checkCarAvailability = async () => {
        if (!pickupDate || !returnDate || !car) {
            setIsCarAvailable(true);
            return;
        }

        setIsCheckingAvailability(true);
        try {
            const response = await axios.post('/api/bookings/check-availability', {
                location: car.location,
                pickupDate,
                returnDate
            });

            if (response.data.success) {
                // Check if the current car is available in the response
                const availableCar = response.data.availableCars.find(availableCar =>
                    availableCar._id === car._id
                );
                const available = !!availableCar;
                setIsCarAvailable(available);

                if (!available) {
                    setShowAvailabilityModal(true);
                }
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            // If check fails, assume car is available but show warning
            setIsCarAvailable(true);
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!token) {
            setShowLogin(true)
            return
        }

        // Check availability before proceeding
        if (!isCarAvailable) {
            setShowAvailabilityModal(true);
            return;
        }

        if (!editingBooking && !idProof) {
            toast.error("Please upload a valid ID proof")
            return
        }

        // Check if address and mobile are required for driver option
        if (driverOption === 'with') {
            if (!userAddress.trim()) {
                toast.error("Please enter your address for driver service")
                return
            }
            if (!userMobile.trim()) {
                toast.error("Please enter your mobile number for driver service")
                return
            }
            // Validate mobile number format
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(userMobile.replace(/\D/g, ''))) {
                toast.error("Please enter a valid 10-digit mobile number")
                return
            }
        }

        if (editingBooking) {
            try {
                const formData = new FormData()
                formData.append("car", id)
                formData.append("pickupDate", pickupDate)
                formData.append("returnDate", returnDate)
                formData.append("withDriver", driverOption === 'with')
                if (driverOption === 'with') {
                    formData.append("userAddress", userAddress)
                    formData.append("userMobile", userMobile)
                }
                if (idProof) formData.append("idProof", idProof)

                const response = await axios.put(`/api/bookings/${editingBooking._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                })

                if (response.data.success || response.data.message === "Booking updated successfully") {
                    toast.success("Booking updated successfully ✅")
                    navigate("/my-bookings")
                } else {
                    toast.error(response.data.message || "Failed to update booking")
                }
            } catch (error) {
                console.error(error)
                toast.error("Something went wrong, please try again")
            }
            return;
        }

        if (paymentMode === 'cash') {
            try {
                const formData = new FormData()
                formData.append("car", id)
                formData.append("pickupDate", pickupDate)
                formData.append("returnDate", returnDate)
                formData.append("withDriver", driverOption === 'with')
                if (driverOption === 'with') {
                    formData.append("userAddress", userAddress)
                    formData.append("userMobile", userMobile)
                }
                formData.append("paymentMode", "cash")
                if (idProof) formData.append("idProof", idProof)

                const response = await axios.post('/api/bookings/create', formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                })

                if (response.data.success) {
                    // Show verification code modal
                    setVerificationCode(response.data.verificationCode)
                    setShowVerificationModal(true)
                } else {
                    toast.error(response.data.message || "Failed to create booking")
                }
            } catch (error) {
                console.error(error)
                toast.error("Something went wrong, please try again")
            }
        } else {
            if (!pickupDate || !returnDate) {
                toast.error("Please select pickup and return dates")
                return;
            }
            if (!idProof) {
                toast.error("Please upload a valid ID proof before paying")
                return;
            }
            if (driverOption === 'with') {
                if (!userAddress.trim()) {
                    toast.error("Please enter your address for driver service")
                    return;
                }
                if (!userMobile.trim()) {
                    toast.error("Please enter your mobile number for driver service")
                    return;
                }
                const mobileRegex = /^[0-9]{10}$/;
                if (!mobileRegex.test(userMobile.replace(/\D/g, ''))) {
                    toast.error("Please enter a valid 10-digit mobile number")
                    return;
                }
            }

            try {
                const loaded = await loadRazorpayScript();
                if (!loaded) {
                    toast.error("Razorpay SDK failed to load. Check your internet connection.");
                    return;
                }

                const { data } = await axios.post('/api/payments/create-order', {
                    carId: id,
                    pickupDate,
                    returnDate,
                    withDriver: driverOption === 'with'
                });

                if (!data?.success) {
                    toast.error(data?.message || "Failed to initiate payment");
                    return;
                }

                const { order } = data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency || "INR",
                    name: "Car Rental",
                    description: "Car booking payment",
                    order_id: order.id,
                    prefill: {
                        name: user?.name || "",
                        email: user?.email || "",
                        contact: userMobile || user?.phone || ""
                    },
                    notes: {
                        carId: id,
                        pickupDate,
                        returnDate,
                        withDriver: driverOption === 'with' ? "true" : "false",
                        userAddress: driverOption === 'with' ? userAddress : "",
                        userMobile: driverOption === 'with' ? userMobile : ""
                    },
                    theme: { color: "#0ea5e9" },
                    handler: async function (response) {
                        try {
                            const verifyRes = await axios.post('/api/payments/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (!verifyRes?.data?.success) {
                                toast.error("Payment verification failed");
                                return;
                            }

                            const formData = new FormData();
                            formData.append("car", id);
                            formData.append("pickupDate", pickupDate);
                            formData.append("returnDate", returnDate);
                            formData.append("withDriver", driverOption === 'with');
                            if (driverOption === 'with') {
                                formData.append("userAddress", userAddress);
                                formData.append("userMobile", userMobile);
                            }
                            formData.append("paymentMode", "online");
                            formData.append("paymentId", response.razorpay_payment_id);
                            formData.append("orderId", response.razorpay_order_id);
                            formData.append("signature", response.razorpay_signature);
                            if (idProof) formData.append("idProof", idProof);

                            const createRes = await axios.post('/api/bookings/create', formData, {
                                headers: { "Content-Type": "multipart/form-data" }
                            });

                            if (createRes.data.success) {
                                // Show verification code modal for online payment
                                setVerificationCode(createRes.data.verificationCode)
                                setShowVerificationModal(true)
                            } else {
                                toast.error(createRes.data.message || "Payment done but booking failed");
                            }
                        } catch (err) {
                            console.error(err);
                            toast.error("Payment succeeded but something went wrong while creating booking");
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            toast("Payment cancelled");
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error(err);
                toast.error("Payment initialization failed");
            }
        }
    }

    const handleVerificationModalClose = () => {
        setShowVerificationModal(false)
        navigate("/my-bookings")
    }

    useEffect(() => {
        const foundCar = cars.find(c => c._id === id)
        if (foundCar) {
            setCar(foundCar)
        }
    }, [cars, id])

    useEffect(() => {
        if (location.state?.booking) {
            const booking = location.state.booking
            setEditingBooking(booking)
            setPickupDate(booking.pickupDate.split('T')[0])
            setReturnDate(booking.returnDate.split('T')[0])
            setDriverOption(booking.withDriver ? 'with' : 'without')
            setUserAddress(booking.userAddress || '')
            setUserMobile(booking.userMobile || '')
            setCar(booking.car)
        }
    }, [location.state, setPickupDate, setReturnDate])

    // ✅ Check availability when dates change
    useEffect(() => {
        if (pickupDate && returnDate && car) {
            const timer = setTimeout(() => {
                checkCarAvailability();
            }, 500); // Debounce to avoid too many API calls

            return () => clearTimeout(timer);
        }
    }, [pickupDate, returnDate, car]);

    const handleDriverChange = (option) => {
        if (option === 'with') {
            setShowDriverModal(true)
        } else {
            setDriverOption('without')
            setUserAddress('') // Clear address when switching to without driver
            setUserMobile('') // Clear mobile when switching to without driver
        }
    }

    const confirmDriverCharges = () => {
        setDriverOption('with')
        setShowDriverModal(false)
        toast.success("Driver Charges ₹999 added")
    }

    const handleMobileChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setUserMobile(value);
    }

    const days = computeNoOfDays();
    const totalPrice = computeTotalPrice();

    return car ? (
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
            <button
                onClick={() => navigate(-1)}
                className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer mt-25'
            >
                <img
                    src={assets.arrow_icon}
                    alt=''
                    className='rotate-180 opacity-65'
                />
                Back to all cars
            </button>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='lg:col-span-2'
                >
                    <motion.img
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        src={car.image}
                        alt=''
                        className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md'
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className='space-y-6'
                    >
                        <div>
                            <h1 className='text-3xl font-bold'>
                                {car.brand} {car.model}
                            </h1>
                            <p className='text-gray-500 text-lg'>
                                {car.category} • {car.year}
                            </p>
                        </div>
                        <hr className='border-borderColor my-6' />

                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                            {[
                                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                                { icon: assets.fuel_icon, text: car.fuel_type },
                                { icon: assets.car_icon, text: car.transmission },
                                { icon: assets.location_icon, text: car.location }
                            ].map(({ icon, text }) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    key={text}
                                    className='flex flex-col items-center bg-light p-4 rounded-lg'
                                >
                                    <img src={icon} alt='' className='h-5 mb-2' />
                                    {text}
                                </motion.div>
                            ))}
                        </div>

                        <div>
                            <h1 className='text-xl font-medium mb-3'>Description</h1>
                            <p className='text-gray-500'>{car.description}</p>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    onSubmit={handleSubmit}
                    className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'
                >
                    <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
                        {currency} {driverOption === 'with' ? car.pricePerDay + 999 : car.pricePerDay}
                        <span className='text-base text-gray-400 font-normal'> per day</span>
                    </p>
                    {days > 0 && (
                        <>
                            <p className='text-sm text-gray-600'>
                                Selected: {days} day(s)
                            </p>
                            <p className='text-sm text-gray-600 font-medium'>
                                Total Price: {currency} {totalPrice}
                            </p>

                            {/* ✅ Availability Status */}
                            {isCheckingAvailability ? (
                                <div className="flex items-center gap-2 text-blue-600 text-sm">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Checking availability...
                                </div>
                            ) : !isCarAvailable ? (
                                <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded-lg">
                                    ❌ This car is not available for selected dates
                                </div>
                            ) : (
                                <div className="text-green-600 text-sm font-medium bg-green-50 p-2 rounded-lg">
                                    ✅ Car is available for selected dates
                                </div>
                            )}
                        </>
                    )}
                    <hr className='border-borderColor my-6' />

                    <div className='flex flex-col gap-2'>
                        <label htmlFor='pickup-date'>Pickup Date</label>
                        <input
                            value={pickupDate}
                            onChange={e => setPickupDate(e.target.value)}
                            type='date'
                            className='border border-borderColor px-3 py-2 rounded-lg'
                            required
                            id='pickup-date'
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor='return-date'>Return Date</label>
                        <input
                            value={returnDate}
                            onChange={e => setReturnDate(e.target.value)}
                            type='date'
                            className='border border-borderColor px-3 py-2 rounded-lg'
                            required
                            min={pickupDate || new Date().toISOString().split('T')[0]}
                            id='return-date'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-500 font-medium'>Driver Option</label>
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='driverOption'
                                    value='with'
                                    checked={driverOption === 'with'}
                                    onChange={() => handleDriverChange('with')}
                                    className='w-4 h-4'
                                />
                                With Driver
                            </label>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='driverOption'
                                    value='without'
                                    checked={driverOption === 'without'}
                                    onChange={() => handleDriverChange('without')}
                                    className='w-4 h-4'
                                />
                                Without Driver
                            </label>
                        </div>
                    </div>

                    {/* Address and Mobile Fields - Only show when driver option is selected */}
                    {driverOption === 'with' && (
                        <>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='user-address' className='text-gray-500 font-medium'>
                                    Your Address for Driver Pickup *
                                </label>
                                <textarea
                                    value={userAddress}
                                    onChange={e => setUserAddress(e.target.value)}
                                    placeholder='Enter your complete address where the driver should pick you up'
                                    className='border border-borderColor px-3 py-2 rounded-lg resize-none h-20'
                                    required
                                    id='user-address'
                                />
                            </div>

                            <div className='flex flex-col gap-2'>
                                <label htmlFor='user-mobile' className='text-gray-500 font-medium'>
                                    Your Mobile Number *
                                </label>
                                <input
                                    type='tel'
                                    value={userMobile}
                                    onChange={handleMobileChange}
                                    placeholder='Enter your 10-digit mobile number'
                                    className='border border-borderColor px-3 py-2 rounded-lg'
                                    required
                                    id='user-mobile'
                                    maxLength={10}
                                />
                                <p className='text-xs text-gray-400'>
                                    The driver will contact you on this number for pickup coordination
                                </p>
                            </div>
                        </>
                    )}

                    <div className='flex flex-col gap-2'>
                        <label htmlFor='id-proof'>Upload Valid ID Proof</label>
                        <input
                            type='file'
                            id='id-proof'
                            accept='image/*,application/pdf'
                            onChange={(e) => setIdProof(e.target.files[0])}
                            className='border border-borderColor px-3 py-2 rounded-lg'
                            required={!editingBooking}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-500 font-medium'>Payment Mode</label>
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='paymentMode'
                                    value='cash'
                                    checked={paymentMode === 'cash'}
                                    onChange={() => setPaymentMode('cash')}
                                    className='w-4 h-4'
                                />
                                Cash (Pay at pickup)
                            </label>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='paymentMode'
                                    value='online'
                                    checked={paymentMode === 'online'}
                                    onChange={() => setPaymentMode('online')}
                                    className='w-4 h-4'
                                />
                                Online (Razorpay / UPI)
                            </label>
                        </div>
                    </div>

                    <button
                        className={`w-full transition-all py-3 font-medium text-white rounded-xl cursor-pointer ${!isCarAvailable
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-dull'
                            }`}
                        disabled={!isCarAvailable || isCheckingAvailability}
                    >
                        {isCheckingAvailability ? "Checking Availability..." :
                            editingBooking ? "Update Booking" :
                                (paymentMode === 'online' ? "Pay & Book" : "Book Now")}
                    </button>

                    <p className='text-center text-sm'>
                        No credit card required to reserve
                    </p>
                </motion.form>
            </div>

            {/* Driver Charges Modal */}
            {showDriverModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                        <h2 className='text-xl font-bold mb-4'>Driver Charges</h2>
                        <p className='text-gray-600 mb-6'>Extra ₹999 will be added for driver service.</p>
                        <div className='flex justify-center gap-4'>
                            <button
                                onClick={confirmDriverCharges}
                                className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull'
                            >
                                OK
                            </button>
                            <button
                                onClick={() => setShowDriverModal(false)}
                                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Car Not Available Modal */}
            {showAvailabilityModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 text-center'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>

                        <h2 className='text-xl font-bold mb-4 text-red-600'>Car Not Available</h2>
                        <p className='text-gray-600 mb-4'>
                            This car is already booked for the selected dates:
                        </p>
                        <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                            <p className='font-medium'>{car.brand} {car.model}</p>
                            <p className='text-sm text-gray-600'>
                                Pickup: {new Date(pickupDate).toLocaleDateString()}
                            </p>
                            <p className='text-sm text-gray-600'>
                                Return: {new Date(returnDate).toLocaleDateString()}
                            </p>
                        </div>
                        <p className='text-gray-600 mb-6'>
                            Please select different dates to proceed with booking.
                        </p>
                        <button
                            onClick={() => setShowAvailabilityModal(false)}
                            className='w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dull transition-all font-medium'
                        >
                            OK, Select Different Dates
                        </button>
                    </div>
                </div>
            )}

            {/* Booking Confirmed Modal */}
            {showVerificationModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
                    <div className='bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center'>
                        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>

                        <h2 className='text-2xl font-bold mb-2'>Booking Confirmed! 🎉</h2>
                        <p className='text-gray-600 mb-6'>You will receive a pickup verification code via email</p>

                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                            <p className='text-sm text-gray-600 mb-2'>Your Pickup Verification Code:</p>
                            <div className='text-3xl font-bold text-blue-700 tracking-widest'>
                                {verificationCode}
                            </div>
                            <p className='text-xs text-gray-500 mt-2'>
                                Present this code to the car owner during pickup
                            </p>
                        </div>

                        <p className='text-sm text-gray-500 mb-4'>
                            A confirmation email with this code has been sent to <strong>{user?.email}</strong>
                        </p>

                        <button
                            onClick={handleVerificationModalClose}
                            className='w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dull transition-all font-medium'
                        >
                            Go to My Bookings
                        </button>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <Loader />
    )
}

export default CarDetails