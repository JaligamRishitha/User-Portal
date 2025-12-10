import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import NavItem from './NavItem';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const user = { firstName: "James", lastName: "Anderson" };

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

    return (
        <header className="sticky top-0 z-50 glass-panel border-b border-orange-200/40 shadow-[0_4px_20px_-10px_rgba(249,115,22,0.1)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
                        <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-200">
                            <Icon icon="lucide:zap" />
                            <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tighter text-zinc-900 leading-none">UKPN</span>
                            <span className="text-[10px] font-semibold tracking-wide text-orange-600 uppercase">Power Portal</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {menuItems.map(item => (
                            <NavItem
                                key={item.id}
                                item={item}
                                active={location.pathname === item.id}
                                onClick={handleNavigate}
                            />
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-zinc-200/60">
                            <div className="flex flex-col text-right">
                                <span className="text-xs font-bold text-zinc-800">{user.firstName} {user.lastName.charAt(0)}.</span>
                                <span className="text-[10px] text-zinc-400">ID: 10094822</span>
                            </div>
                            <button onClick={() => handleNavigate('/details')} className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-100 to-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 hover:text-orange-600 hover:border-orange-300 transition-all">
                                <Icon icon="lucide:user" />
                            </button>
                            <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-100 to-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-300 transition-all">
                                <Icon icon="lucide:log-out" />
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
                        <div className="border-t border-zinc-100 pt-3 mt-3 flex justify-between items-center px-4">
                            <span className="text-sm font-bold text-zinc-600">Profile Actions</span>
                            <div className="flex gap-4">
                                <button onClick={() => handleNavigate('/details')} className="text-zinc-500"><Icon icon="lucide:user" /></button>
                                <button className="text-red-500"><Icon icon="lucide:log-out" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
