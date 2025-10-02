import axios from "axios";
import { motion } from "framer-motion";
import { LogOut, Mail, Settings, User } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Profile = () => {
    const { user, logout, setIsOwner, setUser } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50">
                <h2 className="text-3xl font-bold text-gray-800">You are not logged in</h2>
                <p className="text-gray-500 mt-2">Please login to view your profile.</p>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("email", formData.email);
            if (image) fd.append("image", image);

            const res = await axios.put("/api/user/update-profile", fd, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            setUser(res.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex justify-center items-center px-4 py-8 sm:px-6 sm:py-12">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:gap-10 border border-gray-100"
            >
                {/* LEFT SIDE */}
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6"
                >
                    <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-md overflow-hidden">
                        {user.image ? (
                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0).toUpperCase()
                        )}
                    </div>

                    <h1 className="mt-4 text-2xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500 text-sm">{user.email}</p>

                    <span
                        className={`mt-3 inline-block px-4 py-1 rounded-full text-sm font-semibold ${user.isOwner
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                            }`}
                    >
                        {user.isOwner ? "Owner" : "Customer"}
                    </span>
                </motion.div>

                {/* RIGHT SIDE */}
                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1"
                >
                    {!isEditing ? (
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            {[{ label: "Full Name", value: user.name, icon: User },
                            { label: "Email Address", value: user.email, icon: Mail },
                                /*     { label: "Role", value: user.isOwner ? "Owner" : "Customer", icon: Crown }]*/
                            ].map((info, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="p-4 sm:p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition flex flex-col gap-1"
                                >
                                    <info.icon className="w-5 h-5 text-indigo-600" />
                                    <p className="text-xs sm:text-sm text-gray-500">{info.label}</p>
                                    <p className="text-sm sm:text-lg font-semibold text-gray-900">{info.value}</p>
                                </motion.div>
                            ))}

                            <div className="col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end mt-4 sm:mt-6">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
                                >
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOwner(false);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
                                >
                                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs sm:text-sm text-gray-500">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs sm:text-sm text-gray-500">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-xs sm:text-sm text-gray-500">Profile Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    className="border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5"
                                />
                            </div>

                            <div className="col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end mt-4 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Profile;
