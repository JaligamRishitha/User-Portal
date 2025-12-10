import Icon from '../components/Icon';

const MovingHouse = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-6">
            <Icon icon="lucide:truck" className="text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Moving House?</h2>
        <p className="text-zinc-500 mt-2 max-w-md text-center">Let us know if you are moving so we can update our records and ensure payments are directed correctly.</p>
        <button className="mt-8 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">Start Moving Process</button>
    </div>
);

export default MovingHouse;
