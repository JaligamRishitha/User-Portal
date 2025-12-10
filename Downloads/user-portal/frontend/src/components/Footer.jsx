import Icon from './Icon';

const Footer = () => (
    <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md">
                            <Icon icon="lucide:zap" />
                        </div>
                        <span className="font-bold text-zinc-900">UKPN Power Portal</span>
                    </div>
                    <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                        Empowering property owners with seamless consent management and payment tracking.
                    </p>
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
