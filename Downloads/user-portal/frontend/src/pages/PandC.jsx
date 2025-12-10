import Icon from '../components/Icon';

const PandC = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-6">
        <div onClick={() => window.open('https://www.ukpowernetworks.co.uk/', '_blank')} className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden cursor-pointer group hover:border-orange-400 transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
            <div className="p-8">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon icon="lucide:book-open" className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3 group-hover:text-orange-700 transition-colors">Rights & Equipment</h2>
                <h3 className="text-lg font-medium text-zinc-700 mb-4">Do you have electricity equipment on your land?</h3>
                <p className="text-zinc-500 leading-relaxed mb-6">
                    Do you want to know more about this, whether you are entitled to a payment, wayleaves, or lease payments?
                    Click here to visit our main site for comprehensive guides and legal information.
                </p>
                <div className="flex items-center text-orange-600 font-bold text-sm uppercase tracking-wide">
                    Learn More <Icon icon="lucide:arrow-right" className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    </div>
);

export default PandC;
