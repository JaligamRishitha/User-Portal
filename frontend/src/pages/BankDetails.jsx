import { useState } from 'react';
import Swal from 'sweetalert2';
import FadeInWhenVisible from '../components/FadeInWhenVisible';
import Icon from '../components/Icon';

const BankDetails = () => {
    const [step, setStep] = useState(0);
    const [selectedFields, setSelectedFields] = useState([]);
    const [reasons, setReasons] = useState({});
    const [formData] = useState({
        sortCode: "20-00-00",
        accountNumber: "12345678",
        accountHolder: "James Anderson",
        mobile: "07700 900 123",
        email: "james.anderson@example.com",
        paymentMethod: "BACS"
    });

    const fields = ["Sort Code", "Account Number", "Account Holder Name", "Mobile Number", "Email", "Payment Method"];

    const handleCheckboxChange = (field) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter(f => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const handleReasonChange = (field, value) => {
        setReasons({ ...reasons, [field]: value });
    };

    const submitUpdate = (e) => {
        e.preventDefault();

        // First Confirmation Alert
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to proceed with the update?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, update',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Success Alert
                setStep(0);
                Swal.fire({
                    title: 'Update Request Sent',
                    text: 'Your bank details update request has been sent to UKPN Property and Consent team. Please note that it will take up to 5 working days to reflect in our system.',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    const LabelValue = ({ label, value }) => (
        <div className="group border-b border-zinc-100 pb-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">{label}</label>
            <div className="text-sm font-medium text-zinc-900">{value}</div>
        </div>
    );

    return (
        <FadeInWhenVisible>
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-4">
                    <div className="text-amber-500"><Icon icon="lucide:alert-circle" /></div>
                    <div>
                        <p className="text-sm font-bold text-amber-800">Action Required</p>
                        <p className="text-xs text-amber-700 mt-1">Your details below are still pending in our system (As per our records)</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl shadow-xl border-t-4 border-zinc-800">
                    <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-3">
                        <Icon icon="lucide:landmark" className="text-zinc-800" /> Bank Account Details
                    </h2>

                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <LabelValue label="Sort Code" value={formData.sortCode} />
                                <LabelValue label="Account Number" value={formData.accountNumber} />
                                <LabelValue label="Account Holder Name" value={formData.accountHolder} />
                                <LabelValue label="Mobile Number" value={formData.mobile} />
                                <LabelValue label="Email" value={formData.email} />
                                <LabelValue label="Payment Method" value={formData.paymentMethod} />
                            </div>

                            <div className="pt-3 flex justify-end">
                                <button onClick={() => setStep(1)} className="px-6 py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-md">
                                    Update Bank Details
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-zinc-800">What would you like to update?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {fields.map(field => (
                                    <label key={field} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedFields.includes(field) ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-orange-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedFields.includes(field)}
                                            onChange={() => handleCheckboxChange(field)}
                                            className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-zinc-300 rounded"
                                        />
                                        <span className="font-medium text-zinc-700 text-sm">{field}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button onClick={() => setStep(0)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Cancel</button>
                                <button
                                    onClick={() => selectedFields.length > 0 && setStep(2)}
                                    disabled={selectedFields.length === 0}
                                    className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-zinc-800">Please provide reason for updating</h3>
                            <div className="space-y-3">
                                {selectedFields.map(field => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">{field}</label>
                                        <select
                                            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                            onChange={(e) => handleReasonChange(field, e.target.value)}
                                        >
                                            <option value="">Select a reason...</option>
                                            <option value="Incorrect Details">Incorrect Details</option>
                                            <option value="Account Change">Account Change</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button onClick={() => setStep(1)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Back</button>
                                <button onClick={() => setStep(3)} className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-md">Continue</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={submitUpdate} className="space-y-4">
                            <h3 className="text-base font-semibold text-zinc-800">Enter New Details</h3>
                            <div className="space-y-3">
                                {selectedFields.includes("Sort Code") && (
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">Sort Code</label>
                                        <input type="text" placeholder="00-00-00" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none font-mono" defaultValue={formData.sortCode} />
                                    </div>
                                )}
                                {selectedFields.includes("Account Number") && (
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">Account Number</label>
                                        <input type="text" placeholder="00000000" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none font-mono" defaultValue={formData.accountNumber} />
                                    </div>
                                )}
                                {selectedFields.includes("Account Holder Name") && (
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">Account Holder Name</label>
                                        <input type="text" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.accountHolder} />
                                    </div>
                                )}
                                {selectedFields.includes("Mobile Number") && (
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">Mobile Number</label>
                                        <input type="tel" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.mobile} />
                                    </div>
                                )}
                                {selectedFields.includes("Email") && (
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">Email</label>
                                        <input type="email" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.email} />
                                    </div>
                                )}
                                {selectedFields.includes("Payment Method") && (
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700">Payment Method</label>
                                        <select className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.paymentMethod}>
                                            <option>BACS</option>
                                            <option>Cheque</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Back</button>
                                <button type="submit" className="px-6 py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 shadow-md transition-colors">Submit Update</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </FadeInWhenVisible>
    );
};

export default BankDetails;
