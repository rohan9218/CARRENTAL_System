import { motion } from 'motion/react';
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaMoon, FaSun } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets, menuLinks } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
    const { setShowLogin, user, logout, isOwner, axios, setIsOwner, carSearchInput, setCarSearchInput, theme, toggleTheme } = useAppContext();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [hideListCars, setHideListCars] = useState(false);
    const navigate = useNavigate();
    const userMenuRef = useRef(null); // 👈 ref for dropdown

    const changeRole = async () => {
        try {
            const { data } = await axios.post('/api/owner/change-role');
            if (data.success) {
                setIsOwner(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // 🎤 Voice Search Handler
    const handleVoiceSearch = () => {
        if (!("webkitSpeechRecognition" in window)) {
            toast.error("Voice search not supported in this browser");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            let transcript = event.results[0][0].transcript.trim();
            setCarSearchInput(transcript);
            navigate(`/cars?search=${encodeURIComponent(transcript)}`);
        };

        recognition.onerror = (event) => {
            toast.error("Voice search error: " + event.error);
        };

        recognition.onend = () => {
            recognition.stop();
        };
    };

    // ✅ Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-borderColor transition-all 
            ${location.pathname === '/' ? "bg-light dark:bg-gray-900" : "bg-white dark:bg-gray-900"} text-gray-600 dark:text-gray-200`}
        >
            {/* Logo */}
            <Link to='/' onClick={() => { setOpen(false); setCarSearchInput("") }}>
                <motion.img whileHover={{ scale: 1.05 }} src={assets.logo} alt="logo" className="h-8" />
            </Link>

            {/* Mobile menu toggle */}
            <button onClick={() => setOpen(o => !o)} className="sm:hidden p-2" aria-label="menu toggle">
                {open ? "Close" : "Menu"}
            </button>

            {/* Menu Links */}
            <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === '/' ? "bg-light dark:bg-gray-900" : "bg-white dark:bg-gray-900"} ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
                {menuLinks.map((link, index) => (
                    <Link key={index} to={link.path} onClick={() => { setOpen(false); setCarSearchInput("") }}>
                        {link.name}
                    </Link>
                ))}

                <Link to="/contact" onClick={() => setOpen(false)}>Contact Us</Link>

                {/* Search bar */}
                <div className="hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56">
                    <input
                        type="text"
                        className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Search cars"
                        value={carSearchInput}
                        onChange={(e) => setCarSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                navigate(`/cars?search=${encodeURIComponent(carSearchInput)}`);
                            }
                        }}
                    />
                    <img
                        src={assets.mic_icon}
                        alt="Mic"
                        className="cursor-pointer w-5 h-5 ml-1"
                        onClick={handleVoiceSearch}
                    />
                </div>

                {/* Owner/Dashboard & User/Login */}
                <div className="flex max-sm:flex-col items-start sm:items-center gap-6 relative">
                    {!hideListCars && (
                        <button
                            onClick={() => {
                                if (!user) {
                                    setShowLogin(true);
                                    return;
                                }
                                if (isOwner) {
                                    navigate('/owner');
                                } else {
                                    if (window.confirm("Do you want to list your cars as an owner?")) {
                                        alert("You are the Owner now on this site");
                                        changeRole().then(() => {
                                            navigate('/owner/profile');
                                        });
                                    } else {
                                        alert("You are the Customer now on the site");
                                        setHideListCars(true);
                                    }
                                }
                            }}
                            className="cursor-pointer"
                        >
                            {isOwner ? 'Dashboard' : 'List cars'}
                        </button>
                    )}

                    {/* 🌙 Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full border border-borderColor hover:bg-primary hover:text-white transition"
                        aria-label="Toggle Theme"
                    >
                        {theme === "light" ? <FaMoon size={16} /> : <FaSun size={16} />}
                    </button>

                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <img
                                src={assets.user_icon}
                                alt="User"
                                className="w-8 h-8 cursor-pointer rounded-full border"
                                onClick={() => setShowUserMenu(prev => !prev)}
                            />
                            {showUserMenu && (
                                <div className="absolute sm:right-0 top-12 sm:top-10 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                                    <button
                                        onClick={() => {
                                            if (isOwner) {
                                                navigate('/owner/profile');
                                            } else {
                                                navigate('/profile');
                                            }
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => { logout(); setShowUserMenu(false); }}
                                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLogin(true)}
                            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>

            <button className="sm:hidden cursor-pointer" aria-label="Menu" onClick={() => setOpen(!open)}>
                <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
            </button>
        </motion.div>
    );
};

export default Navbar;
