import Swal from 'sweetalert2';
import Icon from '../components/Icon';

const BankDetails = () => (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-4">
            <div className="text-amber-500"><Icon icon="lucide:alert-circle" /></div>
            <div>
                <p className="text-sm font-bold text-amber-800">Action Required</p>
                <p className="text-xs text-amber-700 mt-1">Your details below are still pending in our system (As per our records)</p>
            </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border-t-4 border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 flex items-center gap-3">
                <Icon icon="lucide:landmark" /> Bank Account Details
            </h2>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); Swal.fire('Saved', 'Bank details updated successfully', 'success'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Sort Code</label>
                        <input type="text" placeholder="00-00-00" className="mt-1 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-mono" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Account Number</label>
                        <input type="text" placeholder="00000000" className="mt-1 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-mono" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Account Holder Name</label>
                    <input type="text" className="mt-1 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Mobile Number</label>
                        <input type="tel" className="mt-1 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Email</label>
                        <input type="email" className="mt-1 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Payment Method</label>
                    <select className="mt-1 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all">
                        <option>BACS</option>
                        <option>Cheque</option>
                    </select>
                </div>
                <div className="pt-4">
                    <button className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5">
                        Update Bank Details
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default BankDetails;
