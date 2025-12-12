import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FadeInWhenVisible from '../components/FadeInWhenVisible';
import Icon from '../components/Icon';
import { userAPI } from '../services/api';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        grantorNumber: "",
        name: "",
        email: "",
        mobile: "",
        telephone: "",
        address: ""
    });
    const navigate = useNavigate();
    const vendorId = localStorage.getItem('vendorId') || '5000000061';

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getDetails(vendorId);
            if (response.success) {
                setUserData(response.data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load profile data',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('vendorId');

                Swal.fire({
                    title: 'Logged Out',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/login');
                });
            }
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-zinc-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-40">
            <FadeInWhenVisible>
                <div className="max-w-2xl mx-auto">
                    {/* Profile Header Card */}
                    <div className="glass-panel rounded-xl shadow-lg border-t-4 border-orange-500 overflow-hidden">
                        {/* Header Background */}
                        <div className="relative h-20 bg-gradient-to-br from-orange-500 to-red-600 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* Profile Content */}
                        <div className="relative px-4 pb-4">
                            {/* Profile Picture Circle */}
                            <div className="flex justify-center -mt-10 mb-2">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white">
                                        {getInitials(userData.name)}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                                </div>
                            </div>

                            {/* User Name & Email */}
                            <div className="text-center mb-3">
                                <h1 className="text-lg font-bold text-zinc-900 mb-0.5">{userData.name}</h1>
                                <p className="text-xs text-zinc-500 mb-1.5">{userData.email}</p>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">
                                    <Icon icon="lucide:shield-check" className="text-xs" />
                                    Grantor ID: {userData.grantorNumber}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">

                                <button
                                    onClick={handleLogout}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                                >
                                    <Icon icon="lucide:power" className="text-sm" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </FadeInWhenVisible>
        </div>
    );
};

export default Profile;
