import { useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
    const { user, axios, fetchUser } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [image, setImage] = useState('');
    const [showInsurancePopup, setShowInsurancePopup] = useState(false);

    // ✅ MAIN OWNER EMAIL FROM .env
    const MAIN_OWNER_EMAIL = import.meta.env.VITE_MAIN_OWNER_EMAIL;

    const updateImage = async () => {
        try {
            const formData = new FormData();
            formData.append('image', image);

            const { data } = await axios.post('api/owner/update-image', formData);

            if (data.success) {
                fetchUser();
                toast.success(data.message);
                setImage('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAddCarClick = (e, link) => {
        if (link.name === "Add car") {
            e.preventDefault();
            setShowInsurancePopup(true);
        }
    };

    const confirmAddCar = () => {
        setShowInsurancePopup(false);
        navigate('/owner/add-car');
    };

    const cancelAddCar = () => {
        setShowInsurancePopup(false);
    };

    return (
        <>
            {showInsurancePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Important Notice</h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-3">
                                <strong>Before adding your car, please note:</strong>
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Your car must have <strong>full comprehensive insurance</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 mt-1">✗</span>
                                    <span>Cars without proper insurance will be <strong>rejected by admin</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">ℹ</span>
                                    <span>You'll need to upload insurance documents during the car listing process</span>
                                </li>
                            </ul>
                            <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-200">
                                <strong>Note:</strong> This is to ensure the safety and protection of both car owners and renters.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelAddCar}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAddCar}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                            >
                                I Understand, Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm'>
                <div className='group relative'>
                    <label htmlFor="image">
                        <img 
                            src={image ? URL.createObjectURL(image) : user?.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300"} 
                            alt="profile"
                            className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto' 
                        />
                        <input 
                            type="file" 
                            id='image' 
                            accept='image/*' 
                            hidden 
                            onChange={e => setImage(e.target.files[0])} 
                        />
                        <div className='absolute hidden top-0 right-0 left-0 bottom-0 bg-black/10 rounded-full group-hover:flex items-center justify-between cursor-pointer'>
                            <img src={assets.edit_icon} alt="edit" className="w-4 h-4" />
                        </div>
                    </label>
                </div>

                {image && (
                    <button 
                        className='absolute top-0 right-0 flex p-2 gap-1 bg-primary/10 text-primary cursor-pointer' 
                        onClick={updateImage}
                    >
                        Save <img src={assets.check_icon} width={13} alt="check" />
                    </button>
                )}

                <p className='mt-2 text-base max-md:hidden'>{user?.name}</p>

                <div className='w-full'>
                    {ownerMenuLinks
                        .filter(link => {
                            if (
                                (link.name === "Vendor" || link.name === "Contact Us") &&
                                user?.email !== MAIN_OWNER_EMAIL
                            ) {
                                return false;
                            }
                            return true;
                        })
                        .map((link, index) => (
                            <NavLink 
                                key={index} 
                                to={link.path} 
                                onClick={(e) => handleAddCarClick(e, link)}
                                className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${
                                    link.path === location.pathname 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-gray-600'
                                }`}
                            >
                                <img 
                                    src={link.path === location.pathname ? link.coloredIcon || link.icon : link.icon} 
                                    alt={link.name + " icon"} 
                                    className="w-5 h-5" 
                                />
                                <span className='max-md:hidden'>{link.name}</span>
                                <div 
                                    className={`${link.path === location.pathname && 'bg-primary'} w-1.5 h-8 rounded-l right-0 absolute`}
                                ></div>
                            </NavLink>
                        ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
