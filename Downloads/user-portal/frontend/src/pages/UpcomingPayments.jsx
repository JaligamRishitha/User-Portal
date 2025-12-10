import { useState } from 'react';
import Icon from '../components/Icon';

const UpcomingPayments = () => {
    const [selectedAgreement, setSelectedAgreement] = useState(null);

    const agreements = [
        { id: "AGR-9981-L", leaseStart: "01/01/2020", location: "London High St", lastPaid: "01/01/2023", lastRent: "£500", nextPay: "01/01/2024" },
        { id: "AGR-7721-M", leaseStart: "15/03/2021", location: "Kent Industrial", lastPaid: "15/03/2023", lastRent: "£1,200", nextPay: "15/03/2024" },
    ];

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Upcoming Payments</h2>
                <p className="text-zinc-500 mt-1">Please click on the Agreement Number to view the granular-level breakdown.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-4">Agreement Number</th>
                                <th className="px-6 py-4">Lease Start Date</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Last Paid Date</th>
                                <th className="px-6 py-4">Last Paid Rent</th>
                                <th className="px-6 py-4">Next Pay Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {agreements.map((item) => (
                                <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedAgreement(item)}
                                            className="font-mono font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2"
                                        >
                                            {item.id}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">{item.leaseStart}</td>
                                    <td className="px-6 py-4 text-zinc-600">{item.location}</td>
                                    <td className="px-6 py-4 text-zinc-600">{item.lastPaid}</td>
                                    <td className="px-6 py-4 font-medium text-zinc-900">{item.lastRent}</td>
                                    <td className="px-6 py-4 font-bold text-zinc-900 bg-orange-50/30">{item.nextPay}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-red-600 text-white">
                            <div>
                                <h3 className="text-xl font-bold">Breakdown: {selectedAgreement.id}</h3>
                                <p className="text-orange-100 text-xs mt-1">Detailed asset view</p>
                            </div>
                            <button onClick={() => setSelectedAgreement(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <Icon icon="lucide:x" />
                            </button>
                        </div>
                        <div className="p-0 overflow-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Item No</th>
                                        <th className="px-6 py-3">Asset Type</th>
                                        <th className="px-6 py-3">Short Text</th>
                                        <th className="px-6 py-3 text-right">Rental (£)</th>
                                        <th className="px-6 py-3 text-right">Comp (£)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    <tr>
                                        <td className="px-6 py-3 text-zinc-500">001</td>
                                        <td className="px-6 py-3 font-medium text-orange-600">Pole (HV)</td>
                                        <td className="px-6 py-3 text-zinc-600">Wood Pole Support</td>
                                        <td className="px-6 py-3 text-right font-bold">150.00</td>
                                        <td className="px-6 py-3 text-right">0.00</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-3 text-zinc-500">002</td>
                                        <td className="px-6 py-3 font-medium text-orange-600">Stay</td>
                                        <td className="px-6 py-3 text-zinc-600">Anchor Support</td>
                                        <td className="px-6 py-3 text-right font-bold">25.00</td>
                                        <td className="px-6 py-3 text-right">10.00</td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-zinc-50 font-bold border-t border-zinc-200">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-3 text-right text-zinc-900">Totals:</td>
                                        <td className="px-6 py-3 text-right text-orange-600">£175.00</td>
                                        <td className="px-6 py-3 text-right text-orange-600">£10.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="p-4 border-t border-zinc-100 flex justify-end">
                            <button onClick={() => setSelectedAgreement(null)} className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-lg transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingPayments;
