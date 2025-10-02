import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ResetPassword = () => {
    const { axios } = useAppContext();
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`http://localhost:4000/api/user/reset-password/${token}`, { password });

            if (data.success) {
                toast.success("Password reset successful");
                navigate("/login");
            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={onSubmitHandler} className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
                <p className="text-gray-500 text-sm mt-2 text-center">Enter your new password</p>

                <div className="mt-6">
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 outline-primary"
                    />
                </div>

                <button type="submit" disabled={loading} className="w-full mt-6 py-3 bg-green-500 text-white rounded-lg hover:opacity-90 transition">
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
