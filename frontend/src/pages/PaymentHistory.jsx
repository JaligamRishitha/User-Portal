import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import Swal from 'sweetalert2';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');

    const vendorId = localStorage.getItem('vendorId') || '5000000061';

    useEffect(() => {
        fetchPaymentHistory();
    }, [selectedYear]);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const response = await paymentAPI.getHistory(vendorId, selectedYear || null);
            if (response.success) {
                setPayments(response.data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load payment history',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-zinc-600">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Payment History</h2>
                    <p className="text-zinc-500 mt-1">Review past transactions and remittances.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-200 outline-none shadow-sm"
                    >
                        <option value="">All Years</option>
                        <option value="2024">2023 - 2024</option>
                        <option value="2023">2022 - 2023</option>
                        <option value="2022">2021 - 2022</option>
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
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="13" className="px-4 py-8 text-center text-zinc-500">
                                        No payment history found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment, index) => (
                                    <tr key={index} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="px-4 py-3 font-mono font-medium text-zinc-900 group-hover:text-orange-600">
                                            {payment.agreementNumber}
                                        </td>
                                        <td className="px-4 py-3">{payment.firstName}</td>
                                        <td className="px-4 py-3">{payment.lastName}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-xs font-medium text-zinc-600">
                                                {payment.paymentType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500">{payment.paymentDate}</td>
                                        <td className="px-4 py-3 text-zinc-500">{payment.chequeNumber}</td>
                                        <td className="px-4 py-3 font-bold text-zinc-900">{payment.chequeBACSAmount?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-zinc-600">{payment.netInvoiceAmount?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-zinc-600">{payment.rental?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-zinc-600">{payment.compensation?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-zinc-600">{payment.leaseAmount?.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-bold text-zinc-900">{payment.grossInvoiceAmount?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-zinc-500">{payment.encashmentDate}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
