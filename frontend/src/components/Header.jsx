import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Icon from './Icon';
import NavItem from './NavItem';
import ukpnLogo from '../assets/images/ukpn-logo.png';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get user email from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserEmail(user.email || '');
    }, []);

    const menuItems = [
        { id: '/', label: 'Home', icon: 'lucide:layout-dashboard' },
        { id: '/details', label: 'User Details', icon: 'lucide:user' },
        { id: '/bank', label: 'Bank Details', icon: 'lucide:landmark' },
        { id: '/history', label: 'Payment History', icon: 'lucide:history' },
        { id: '/upcoming', label: 'Upcoming Payments', icon: 'lucide:calendar' },
        { id: '/pandc', label: 'P & C', icon: 'lucide:zap' },
        { id: '/moving', label: 'Moving House', icon: 'lucide:truck' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
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

    return (
        <header className="sticky top-0 z-50 glass-panel border-b border-orange-200/40 shadow-[0_4px_20px_-10px_rgba(249,115,22,0.1)]">
            <div className="w-full px-2 sm:px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Left aligned with minimal margin */}
                    <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => handleNavigate('/')}>
                        <img src={ukpnLogo} alt="UKPN Logo" className="h-12 w-auto object-contain" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-zinc-900 leading-none">UKPN</span>
                            <span className="text-xs font-semibold tracking-wide text-orange-600 uppercase">User Portal</span>
                        </div>
                    </div>

                    {/* Desktop Nav - Centered */}
                    <nav className="hidden lg:flex items-center ml-20 absolute left-1/2 transform -translate-x-1/2">
                        {menuItems.map(item => (
                            <NavItem
                                key={item.id}
                                item={item}
                                active={location.pathname === item.id}
                                onClick={handleNavigate}
                            />
                        ))}
                    </nav>

                    {/* Right Actions - Right aligned with minimal margin */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-3">
                            <button
                                onClick={() => handleNavigate('/profile')}
                                className="flex items-center gap-2 px-3 py-2"
                            >
                                <Icon icon="lucide:user" className="text-zinc-400 group-hover:text-orange-600 transition-colors" />
                                <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors max-w-[150px] truncate">{userEmail}</span>
                            </button>

                        </div>

                        {/* Mobile Menu Button */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Icon icon={mobileMenuOpen ? "lucide:x" : "lucide:menu"} className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-orange-100 bg-white/95 backdrop-blur-xl absolute w-full left-0 shadow-xl">
                    <div className="p-4 space-y-2">
                        {menuItems.map(item => (
                            <NavItem
                                key={item.id}
                                item={item}
                                active={location.pathname === item.id}
                                onClick={handleNavigate}
                                mobile={true}
                            />
                        ))}
                        <div className="border-t border-zinc-100 pt-3 mt-3 space-y-2">
                            <button
                                onClick={() => handleNavigate('/profile')}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
                            >
                                <Icon icon="lucide:user" className="text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-700 truncate">{userEmail}</span>
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
