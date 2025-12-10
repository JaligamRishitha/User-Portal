import { useNavigate } from 'react-router-dom';
import FadeInWhenVisible from '../components/FadeInWhenVisible';
import Icon from '../components/Icon';

const Home = () => {
    const navigate = useNavigate();
    const user = { firstName: "James" };

    return (
        <div className="space-y-8 pb-10">
            {/* Hero */}
            <FadeInWhenVisible>
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 sm:p-12 shadow-2xl border border-zinc-700 group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-[80px]"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-200 text-xs font-semibold mb-6 border border-white/5 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Operational
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">{user.firstName}</span>
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">Manage your property consents, track payments, and update your details.</p>
                    </div>
                </div>
            </FadeInWhenVisible>

            {/* Services Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FadeInWhenVisible delay={100}>
                    <div onClick={() => navigate('/details')} className="h-full group bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 group-hover:h-full transition-all duration-500"></div>
                        <div className="mb-4 inline-flex p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                            <Icon icon="lucide:user-cog" />
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 mb-2">View And Edit Details</h3>
                        <p className="text-sm text-zinc-500">Keep your personal information up to date.</p>
                    </div>
                </FadeInWhenVisible>

                <FadeInWhenVisible delay={200}>
                    <div onClick={() => navigate('/upcoming')} className="h-full group bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:h-full transition-all duration-500"></div>
                        <div className="mb-4 inline-flex p-3 rounded-xl bg-yellow-50 text-yellow-600 group-hover:scale-110 transition-transform">
                            <Icon icon="lucide:calendar-clock" />
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 mb-2">Upcoming Payments</h3>
                        <p className="text-sm text-zinc-500">Check scheduled wayleave and lease payments.</p>
                    </div>
                </FadeInWhenVisible>

                <FadeInWhenVisible delay={300}>
                    <div onClick={() => navigate('/history')} className="h-full group bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 group-hover:h-full transition-all duration-500"></div>
                        <div className="mb-4 inline-flex p-3 rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
                            <Icon icon="lucide:file-bar-chart-2" />
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 mb-2">Remittance Schedule</h3>
                        <p className="text-sm text-zinc-500">Generate and download payment reports.</p>
                    </div>
                </FadeInWhenVisible>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FadeInWhenVisible delay={400}>
                    <div className="h-full bg-zinc-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                            <Icon icon="lucide:phone" className="text-9xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Icon icon="lucide:phone-call" /> Call Us
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed max-w-sm">
                            Lines are open from Monday to Friday, 8:30am to 5.00pm.<br />
                            Free to call from a mobile or landline phone.
                        </p>
                        <a href="tel:08003163105" className="inline-flex items-center gap-2 text-orange-400 font-bold hover:text-orange-300 transition-colors">
                            0800 316 3105 <Icon icon="lucide:arrow-right" />
                        </a>
                    </div>
                </FadeInWhenVisible>

                <FadeInWhenVisible delay={500}>
                    <div className="h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                            <Icon icon="lucide:mail" className="text-9xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Icon icon="lucide:mail" /> Email Us
                        </h3>
                        <p className="text-orange-100 text-sm mb-6 leading-relaxed max-w-sm">
                            Our team will get back to you within 48 hours.<br />
                            We are here to help with any inquiries.
                        </p>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg">
                            Get in touch
                        </button>
                    </div>
                </FadeInWhenVisible>
            </div>
        </div>
    );
};

export default Home;
