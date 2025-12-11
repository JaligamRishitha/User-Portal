import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import Swal from 'sweetalert2';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [showRemittanceModal, setShowRemittanceModal] = useState(false);
    const [fiscalYear, setFiscalYear] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [availableYears, setAvailableYears] = useState([]);

    const vendorId = localStorage.getItem('vendorId') || '5000000061';

    useEffect(() => {
        fetchPaymentHistory();
        fetchAvailableYears();
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

    const fetchAvailableYears = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/remittance-years/${vendorId}`);
            const data = await response.json();
            if (data.success) {
                setAvailableYears(data.years);
            }
        } catch (error) {
            console.error('Failed to fetch available years:', error);
        }
    };

    const handleGenerateRemittance = async () => {
        if (!fiscalYear) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please select a fiscal year',
                icon: 'warning',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        try {
            setIsGenerating(true);

            // Download the static PDF document from database
            const response = await fetch(`http://localhost:8000/api/remittance-documents/download/${vendorId}/${fiscalYear}`);

            if (response.status === 404) {
                // No document found for this fiscal year
                setShowRemittanceModal(false);
                setFiscalYear('');
                Swal.fire({
                    title: 'No Data Available',
                    text: `There is no data for this year in the payment history.`,
                    icon: 'info',
                    confirmButtonColor: '#ea580c',
                });
                return;
            }

            if (!response.ok) {
                // Handle other errors silently or with generic message
                setShowRemittanceModal(false);
                setFiscalYear('');
                Swal.fire({
                    title: 'No Data Available',
                    text: `There is no data for this year in the payment history.`,
                    icon: 'info',
                    confirmButtonColor: '#ea580c',
                });
                return;
            }

            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Remittance_Schedule_${fiscalYear}_${vendorId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setShowRemittanceModal(false);
            setFiscalYear('');

            Swal.fire({
                title: 'Success',
                text: 'Remittance document downloaded successfully',
                icon: 'success',
                confirmButtonColor: '#ea580c',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            setShowRemittanceModal(false);
            setFiscalYear('');
            Swal.fire({
                title: 'No Data Available',
                text: 'There is no data for this year in the payment history.',
                icon: 'info',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setIsGenerating(false);
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
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                    <button
                        onClick={() => setShowRemittanceModal(true)}
                        className="px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                    >
                        Remittance Schedule
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
                                payments.map((payment, index) => {
                                    // Determine payment type display
                                    const paymentTypeDisplay = payment.paymentType === 'K' ? 'Cheque' : payment.paymentType || '-';

                                    // Determine cheque number display
                                    const chequeNumberDisplay = payment.paymentType === 'BACS'
                                        ? '-'
                                        : (payment.chequeNumber || '-');

                                    return (
                                        <tr key={index} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="px-4 py-3 font-mono font-medium text-zinc-900 group-hover:text-orange-600">
                                                {payment.agreementNumber || '-'}
                                            </td>
                                            <td className="px-4 py-3">{payment.firstName || '-'}</td>
                                            <td className="px-4 py-3">{payment.lastName || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-xs font-medium text-zinc-600">
                                                    {paymentTypeDisplay}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500">{payment.paymentDate || '-'}</td>
                                            <td className="px-4 py-3 text-zinc-500">{chequeNumberDisplay}</td>
                                            <td className="px-4 py-3 font-bold text-zinc-900">
                                                {payment.chequeBACSAmount != null ? payment.chequeBACSAmount.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-600">
                                                {payment.netInvoiceAmount != null ? payment.netInvoiceAmount.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-600">
                                                {payment.rental != null ? payment.rental.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-600">
                                                {payment.compensation != null ? payment.compensation.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-600">
                                                {payment.leaseAmount != null ? payment.leaseAmount.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-zinc-900">
                                                {payment.grossInvoiceAmount != null ? payment.grossInvoiceAmount.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500">{payment.encashmentDate || '-'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Remittance Schedule Modal */}
            {showRemittanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-zinc-900">Generate Remittance Schedule</h3>
                            <button
                                onClick={() => {
                                    setShowRemittanceModal(false);
                                    setFiscalYear('');
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-zinc-600 mb-6">
                            Select the fiscal year to download the remittance schedule document.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Fiscal Year *
                            </label>
                            <select
                                value={fiscalYear}
                                onChange={(e) => setFiscalYear(e.target.value)}
                                className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            >
                                <option value="">Select fiscal year</option>
                                {availableYears.length > 0 ? (
                                    availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="2021">2021</option>
                                        <option value="2022">2022</option>
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRemittanceModal(false);
                                    setFiscalYear('');
                                }}
                                className="flex-1 px-4 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateRemittance}
                                disabled={isGenerating || !fiscalYear}
                                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Downloading...
                                    </>
                                ) : (
                                    'Download'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
