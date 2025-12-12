const Footer = () => (
    <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-sm mt-auto flex-shrink-0 h-16 sm:h-20">
        <div className="w-full px-2 sm:px-4 h-full">
            <div className="flex items-center justify-between h-full">
                <span className="text-xs sm:text-sm text-zinc-500">2025@ UK Power Networks</span>
                <div className="flex items-center gap-3 sm:gap-6">
                    <a href="https://www.ukpowernetworks.co.uk/help-and-contact" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-zinc-500 hover:text-orange-600 transition-colors">Contact Us</a>
                    <a href="https://www.ukpowernetworks.co.uk/privacy-notice" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-zinc-500 hover:text-orange-600 transition-colors">Privacy Policy</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
