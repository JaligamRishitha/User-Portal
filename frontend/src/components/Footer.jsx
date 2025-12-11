import ukpnLogo from '../assets/images/ukpn-logo.png';

const Footer = () => (
    <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3">

                        <div className="flex flex-col">
                            <span className="text-sm tracking-tight text-sm text-zinc-500">UKPN@All rights reserved</span>

                        </div>
                    </div>
                </div>

                <div>

                    <ul className="space-y-2 text-sm text-zinc-500">
                        <li><a href="#" className="hover:text-orange-600 transition-colors">Contact Us</a></li>
                    </ul>
                </div>
                <div>

                    <ul className="space-y-2 text-sm text-zinc-500">
                        <li><a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>

        </div>
    </footer>
);

export default Footer;
