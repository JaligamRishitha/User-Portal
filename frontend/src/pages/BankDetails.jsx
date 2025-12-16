import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import FadeInWhenVisible from '../components/FadeInWhenVisible';
import Icon from '../components/Icon';
import { bankAPI } from '../services/api';

const BankDetails = () => {
    const [step, setStep] = useState(0);
    const [selectedFields, setSelectedFields] = useState([]);
    const [reasons, setReasons] = useState({});
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        sortCode: "",
        accountNumber: "",
        accountHolder: "",
        mobile: "",
        email: "",
        paymentMethod: ""
    });

    const vendorId = localStorage.getItem('vendorId') || '5000000061';

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            setLoading(true);
            const response = await bankAPI.getDetails(vendorId);
            if (response.success) {
                setFormData(response.data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load bank details',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

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

    const submitUpdate = async (e) => {
        e.preventDefault();

        // Validation: If Account Number is being edited, Account Holder Name is mandatory
        if (selectedFields.includes("Account Number") && !formData.accountHolder.trim()) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Account Holder Name is required when updating Account Number',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        // Validation: If Payment Method is BACS, Email is mandatory
        if (formData.paymentMethod === 'BACS' && !formData.email.trim()) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Email is required when Payment Method is BACS',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to proceed with the update?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, update',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const updateData = {};
                selectedFields.forEach(field => {
                    const fieldMap = {
                        'Sort Code': 'sortCode',
                        'Account Number': 'accountNumber',
                        'Account Holder Name': 'accountHolder',
                        'Mobile Number': 'mobile',
                        'Email': 'email',
                        'Payment Method': 'paymentMethod'
                    };
                    const key = fieldMap[field];
                    if (key) {
                        updateData[key] = formData[key];
                    }
                });

                const response = await bankAPI.updateDetails(vendorId, updateData);

                if (response.success) {
                    setStep(0);
                    setSelectedFields([]);
                    setReasons({});
                    await fetchBankDetails();

                    Swal.fire({
                        title: 'Update Request Sent',
                        text: 'Your bank details update request has been sent to UKPN Property and Consent team. Please note that it will take up to 5 working days to reflect in our system.',
                        icon: 'success',
                        confirmButtonColor: '#ea580c',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'Failed to update bank details',
                    icon: 'error',
                    confirmButtonColor: '#ea580c',
                });
            }
        }
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
                            <p className="text-sm text-zinc-600">Fields highlighted in orange can be edited. Other fields are read-only.</p>
                            <div className="space-y-3">
                                {/* Sort Code Field */}
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                        Sort Code
                                        {selectedFields.includes("Sort Code") && <span className="text-xs text-orange-600">(Editable)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="00-00-00"
                                        className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none font-mono ${selectedFields.includes("Sort Code")
                                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                            }`}
                                        value={formData.sortCode}
                                        onChange={(e) => selectedFields.includes("Sort Code") && setFormData({ ...formData, sortCode: e.target.value })}
                                        readOnly={!selectedFields.includes("Sort Code")}
                                    />
                                </div>

                                {/* Account Number Field */}
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                        Account Number
                                        {(selectedFields.includes("Account Number") || selectedFields.includes("Sort Code")) && <span className="text-xs text-orange-600">(Editable)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="00000000"
                                        className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none font-mono ${(selectedFields.includes("Account Number") || selectedFields.includes("Sort Code"))
                                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                            }`}
                                        value={formData.accountNumber}
                                        onChange={(e) => (selectedFields.includes("Account Number") || selectedFields.includes("Sort Code")) && setFormData({ ...formData, accountNumber: e.target.value })}
                                        readOnly={!(selectedFields.includes("Account Number") || selectedFields.includes("Sort Code"))}
                                    />
                                </div>

                                {/* Account Holder Name Field */}
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                        Account Holder Name
                                        {(selectedFields.includes("Account Holder Name") || selectedFields.includes("Sort Code") || selectedFields.includes("Account Number")) && <span className="text-xs text-orange-600">(Editable)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${(selectedFields.includes("Account Holder Name") || selectedFields.includes("Sort Code") || selectedFields.includes("Account Number"))
                                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                            }`}
                                        value={formData.accountHolder}
                                        onChange={(e) => (selectedFields.includes("Account Holder Name") || selectedFields.includes("Sort Code") || selectedFields.includes("Account Number")) && setFormData({ ...formData, accountHolder: e.target.value })}
                                        readOnly={!(selectedFields.includes("Account Holder Name") || selectedFields.includes("Sort Code") || selectedFields.includes("Account Number"))}
                                    />
                                </div>

                                {/* Mobile Number Field */}
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                        Mobile Number
                                        {selectedFields.includes("Mobile Number") && <span className="text-xs text-orange-600">(Editable)</span>}
                                    </label>
                                    <input
                                        type="tel"
                                        className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${selectedFields.includes("Mobile Number")
                                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                            }`}
                                        value={formData.mobile}
                                        onChange={(e) => selectedFields.includes("Mobile Number") && setFormData({ ...formData, mobile: e.target.value })}
                                        readOnly={!selectedFields.includes("Mobile Number")}
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                        Email
                                        {selectedFields.includes("Email") && <span className="text-xs text-orange-600">(Editable)</span>}
                                        {formData.paymentMethod === 'BACS' && <span className="text-xs text-red-600">*Required for BACS</span>}
                                    </label>
                                    <input
                                        type="email"
                                        className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${selectedFields.includes("Email")
                                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                            }`}
                                        value={formData.email}
                                        onChange={(e) => selectedFields.includes("Email") && setFormData({ ...formData, email: e.target.value })}
                                        readOnly={!selectedFields.includes("Email")}
                                    />
                                </div>

                                {/* Payment Method Field */}
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                        Payment Method
                                        {selectedFields.includes("Payment Method") && <span className="text-xs text-orange-600">(Editable)</span>}
                                    </label>
                                    <select
                                        className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${selectedFields.includes("Payment Method")
                                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                            }`}
                                        value={formData.paymentMethod}
                                        onChange={(e) => selectedFields.includes("Payment Method") && setFormData({ ...formData, paymentMethod: e.target.value })}
                                        disabled={!selectedFields.includes("Payment Method")}
                                    >
                                        <option>BACS</option>
                                        <option>Faster Payments</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>
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
