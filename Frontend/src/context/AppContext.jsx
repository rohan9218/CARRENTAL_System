import axios from 'axios';
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY;

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [cars, setCars] = useState([]);
    const [carSearchInput, setCarSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // ✅ theme state

    const fetchUser = async (showError = false) => {
        try {
            const { data } = await axios.get('/api/user/data');
            if (data.success) {
                setUser(data.user);
                setIsOwner(data.user.role === 'owner');
            } else {
                setUser(null);
                setIsOwner(false);
            }
        } catch (error) {
            if (showError) toast.error(error.message);
            setUser(null);
            setIsOwner(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchCars = async (showError = false) => {
        try {
            const { data } = await axios.get('/api/user/cars');
            data.success ? setCars(data.cars) : (showError && toast.error(data.message));
        } catch (error) {
            if (showError) toast.error(error.message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        axios.defaults.headers.common['Authorization'] = '';
        toast.success('You have been logged out');
    };

    // ✅ Theme toggler
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `${storedToken}`;
            fetchUser(false);
        } else {
            setLoading(false);
        }
        fetchCars(false);

        // ✅ apply theme on startup
        document.documentElement.setAttribute("data-theme", theme);
    }, []);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `${token}`;
            fetchUser(false);
        }
    }, [token]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner,
        fetchUser, showLogin, setShowLogin,
        logout, fetchCars, cars, setCars,
        pickupDate, setPickupDate, returnDate, setReturnDate,
        carSearchInput, setCarSearchInput,
        loading,
        theme, toggleTheme // ✅ added theme controls
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
