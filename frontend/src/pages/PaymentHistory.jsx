const PaymentHistory = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Payment History</h2>
                <p className="text-zinc-500 mt-1">Review past transactions and remittances.</p>
            </div>
            <div className="flex items-center gap-3">
                <select className="px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-200 outline-none shadow-sm">
                    <option>2023 - 2024</option>
                    <option>2022 - 2023</option>
                    <option>2021 - 2022</option>
                </select>
                <button className="px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
                    Remittance Schedule
                </button>
                <button className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
                    Generate Report
                </button>
            </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3">Agreement Number</th>
                            <th className="px-4 py-3">First Name</th>
                            <th className="px-4 py-3">Last Name</th>
                            <th className="px-4 py-3">Payment Type</th>
                            <th className="px-4 py-3">Payment Date</th>
                            <th className="px-4 py-3">Cheque Number</th>
                            <th className="px-4 py-3">Cheque/BACS Amount (€)</th>
                            <th className="px-4 py-3">Net Invoice Amount (€)</th>
                            <th className="px-4 py-3">Rental (€)</th>
                            <th className="px-4 py-3">Compensation (€)</th>
                            <th className="px-4 py-3">Lease Amount (€)</th>
                            <th className="px-4 py-3">Gross Invoice Amount (€)</th>
                            <th className="px-4 py-3">Encashment Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {[1, 2, 3, 4].map((i) => (
                            <tr key={i} className="hover:bg-orange-50/30 transition-colors group">
                                <td className="px-4 py-3 font-mono font-medium text-zinc-900 group-hover:text-orange-600">AGR-2023-00{i}</td>
                                <td className="px-4 py-3">James</td>
                                <td className="px-4 py-3">Anderson</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-xs font-medium text-zinc-600">
                                        BACS
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-500">Oct {10 + i}, 2023</td>
                                <td className="px-4 py-3 text-zinc-500">CHQ-{1000 + i}</td>
                                <td className="px-4 py-3 font-bold text-zinc-900">1,250.00</td>
                                <td className="px-4 py-3 text-zinc-600">1,000.00</td>
                                <td className="px-4 py-3 text-zinc-600">250.00</td>
                                <td className="px-4 py-3 text-zinc-600">50.00</td>
                                <td className="px-4 py-3 text-zinc-600">500.00</td>
                                <td className="px-4 py-3 font-bold text-zinc-900">1,800.00</td>
                                <td className="px-4 py-3 text-zinc-500">Oct {15 + i}, 2023</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default PaymentHistory;
