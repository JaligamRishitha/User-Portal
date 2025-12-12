import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import ukpnLogo from '../assets/images/ukpn-logo.png';
import { authAPI } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!email || !password) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter both email address and password',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        setLoading(true);

        try {
            // Check if admin login
            if (email === 'admin@ukpn.com' && password === 'Admin@123') {
                localStorage.setItem('token', 'admin-token');
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('user', JSON.stringify({ name: 'Administrator', email: 'admin@ukpn.com' }));

                Swal.fire({
                    title: 'Success!',
                    text: 'Admin login successful',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/admin');
                });
                setLoading(false);
                return;
            }

            const response = await authAPI.login(email, password);

            if (response.success) {
                // Store token and user info
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('vendorId', response.user.id);
                localStorage.removeItem('isAdmin');

                Swal.fire({
                    title: 'Success!',
                    text: 'Login successful',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/');
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Login Failed',
                text: error.message || 'Invalid email address or password',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-zinc-50 via-orange-50/20 to-zinc-50">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <svg className="absolute w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#f97316" strokeWidth="0.5" className="animate-dash" strokeDasharray="5,5"></path>
                    <path d="M0,30 Q25,80 50,30 T100,80" fill="none" stroke="#ea580c" strokeWidth="0.5" className="animate-dash" strokeDasharray="10,10"></path>
                </svg>
                <div className="absolute top-20 right-20 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl animate-pulse-glow"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-2xl relative z-10 mt-10 ">
                <div className="glass-panel rounded-2xl shadow-2xl border-t-4 border-orange-500 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 px-8 py-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-white p-2 shadow-lg">
                                <img src={ukpnLogo} alt="UKPN Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl font-bold tracking-tight">UKPN Power Portal</h1>
                                <p className="text-orange-100 text-sm">Sign in to your account</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8 flex justify-center">
                        <div className="w-full max-w-md">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Username Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-zinc-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                            <MdEmail className="text-xl" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-zinc-900"
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-zinc-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                            <MdLock className="text-xl" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-zinc-900"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-orange-600 transition-colors"
                                        >
                                            {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-zinc-300 rounded"
                                        />
                                        <span className="text-zinc-600 group-hover:text-zinc-900 transition-colors">Remember me</span>
                                    </label>
                                    <a href="#" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            {/* Contact Info */}
                            <div className="mt-5 pt-5 border-t border-zinc-200 text-center">
                                <p className="text-sm text-zinc-600">
                                    Need help? Call us at <a href="tel:08003163105" className="text-orange-600 font-bold hover:text-orange-700">0800 316 3105</a>
                                </p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Monday to Friday, 8:30am to 5:00pm
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-500">
                        © 2023 UK Power Networks. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
