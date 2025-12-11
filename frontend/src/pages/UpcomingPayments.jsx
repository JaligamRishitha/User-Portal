import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { upcomingPaymentsAPI } from '../services/api';
import Swal from 'sweetalert2';

const UpcomingPayments = () => {
    const [selectedAgreement, setSelectedAgreement] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [breakdownData, setBreakdownData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);

    const vendorId = localStorage.getItem('vendorId') || '5000000061';

    useEffect(() => {
        fetchUpcomingPayments();
    }, []);

    const fetchUpcomingPayments = async () => {
        try {
            setLoading(true);
            const response = await upcomingPaymentsAPI.getPayments(vendorId);
            if (response.success) {
                setAgreements(response.data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load upcoming payments',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAgreementBreakdown = async (agreementNumber) => {
        try {
            setLoadingBreakdown(true);
            const response = await upcomingPaymentsAPI.getAgreementBreakdown(vendorId, agreementNumber);
            if (response.success) {
                setBreakdownData(response.data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load agreement breakdown',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoadingBreakdown(false);
        }
    };

    const handleAgreementClick = async (agreement) => {
        setSelectedAgreement(agreement);
        await fetchAgreementBreakdown(agreement.id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-zinc-600">Loading upcoming payments...</p>
                </div>
            </div>
        );
    }

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
                            {agreements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                                        No upcoming payments found
                                    </td>
                                </tr>
                            ) : (
                                agreements.map((item) => (
                                    <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleAgreementClick(item)}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full overflow-hidden flex flex-col max-h-[90vh] mt-20">
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
                            {loadingBreakdown ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                </div>
                            ) : breakdownData ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Item No</th>
                                            <th className="px-4 py-3">Land Reg No</th>
                                            <th className="px-4 py-3">Asset Type</th>
                                            <th className="px-4 py-3">Asset No</th>
                                            <th className="px-4 py-3">Short Text</th>
                                            <th className="px-4 py-3 text-right">Multiplier</th>
                                            <th className="px-4 py-3 text-right">Rental</th>
                                            <th className="px-4 py-3 text-right">Compensation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {breakdownData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-zinc-500">{item.itemNo}</td>
                                                <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{item.landRegNo}</td>
                                                <td className="px-4 py-3 font-medium text-orange-600">{item.assetType}</td>
                                                <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{item.assetNo}</td>
                                                <td className="px-4 py-3 text-zinc-600">{item.shortText}</td>
                                                <td className="px-4 py-3 text-right text-zinc-900">{item.multiplier}</td>
                                                <td className="px-4 py-3 text-right font-bold">{item.rental.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right">{item.compensation.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-50 font-bold border-t border-zinc-200">
                                        <tr>
                                            <td colSpan="6" className="px-4 py-3 text-right text-zinc-900">Totals:</td>
                                            <td className="px-4 py-3 text-right text-orange-600">£{breakdownData.totals.rental.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-orange-600">£{breakdownData.totals.compensation.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            ) : null}
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
