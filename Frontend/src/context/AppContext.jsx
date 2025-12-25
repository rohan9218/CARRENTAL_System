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
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    // ✅ SAFE FETCH USER (NO TOAST EVER)
    const fetchUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get('/api/user/data');
            if (data.success) {
                setUser(data.user);
                setIsOwner(data.user.role === 'owner');
            } else {
                setUser(null);
                setIsOwner(false);
            }
        } catch {
            // ❌ DO NOT SHOW TOAST
            setUser(null);
            setIsOwner(false);
        } finally {
            setLoading(false);
        }
    };

    // ✅ PUBLIC API
    const fetchCars = async () => {
        try {
            const { data } = await axios.get('/api/user/cars');
            if (data.success) setCars(data.cars);
        } catch {
            // silent
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

    // ✅ INITIAL LOAD (ONCE)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = storedToken;
        }

        fetchCars();
        fetchUser();

        document.documentElement.setAttribute("data-theme", theme);
    }, []);

    // ✅ TOKEN CHANGE (ONLY IF REAL TOKEN)
    useEffect(() => {
        if (!token) return;
        axios.defaults.headers.common['Authorization'] = token;
        fetchUser();
    }, [token]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const value = {
        navigate,
        currency,
        axios,
        user,
        setUser,
        token,
        setToken,
        isOwner,
        setIsOwner,
        showLogin,
        setShowLogin,
        logout,
        cars,
        fetchCars,
        loading,
        theme,
        toggleTheme: () => {
            const t = theme === "light" ? "dark" : "light";
            setTheme(t);
            localStorage.setItem("theme", t);
        }
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
