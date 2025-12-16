import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdDocumentScanner, MdViewList } from 'react-icons/md';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('vendorId');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    const isHomePage = location.pathname === '/admin';

    return (
        <div className="text-zinc-600 font-sans relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-zinc-50 via-orange-50/20 to-zinc-50">
            {/* Animated Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <svg className="absolute w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#f97316" strokeWidth="0.5" className="animate-dash" strokeDasharray="5,5"></path>
                    <path d="M0,30 Q25,80 50,30 T100,80" fill="none" stroke="#ea580c" strokeWidth="0.5" className="animate-dash" strokeDasharray="10,10"></path>
                </svg>
                <div className="absolute top-20 right-20 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl animate-pulse-glow"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-zinc-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo - Click to go home */}
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-3 hover:opacity-80 transition-all group"
                        >
                            <img
                                src="/src/assets/images/ukpn-logo.png"
                                alt="UKPN Logo"
                                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold tracking-tight text-zinc-900">UKPN</span>
                                <span className="text-[10px] font-medium text-orange-600 uppercase tracking-wide">Admin Portal</span>
                            </div>
                        </button>

                        {/* Right Side with Navigation Tabs */}
                        <div className="flex items-center gap-4">
                            {/* Navigation Tabs */}
                            <nav className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/admin')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${location.pathname === '/admin'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                >
                                    <MdHome className="text-base" />
                                    Home
                                </button>
                                <button
                                    onClick={() => navigate('/admin/ocr')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${location.pathname === '/admin/ocr'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                >
                                    <MdDocumentScanner className="text-base" />
                                    OCR Scanner
                                </button>
                                <button
                                    onClick={() => navigate('/admin/console')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${location.pathname === '/admin/console'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                >
                                    <MdViewList className="text-base" />
                                    Request Console
                                </button>
                            </nav>
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-zinc-600">Admin</span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200/50 bg-white/70 backdrop-blur-md flex-shrink-0 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="h-full flex items-center justify-between">
                        <span className="text-xs text-zinc-500">2025@ UK Power Networks</span>
                        <div className="flex items-center gap-6">
                            <a href="https://www.ukpowernetworks.co.uk/help-and-contact" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-orange-600 transition-colors">Contact Us</a>
                            <a href="https://www.ukpowernetworks.co.uk/privacy-notice" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-orange-600 transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;
