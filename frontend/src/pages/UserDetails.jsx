import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import FadeInWhenVisible from '../components/FadeInWhenVisible';
import Icon from '../components/Icon';
import { userAPI } from '../services/api';

const UserDetails = () => {
    const [step, setStep] = useState(0);
    const [selectedFields, setSelectedFields] = useState([]);
    const [reasons, setReasons] = useState({});
    const [loading, setLoading] = useState(true);
    const [userAgreementUrl, setUserAgreementUrl] = useState(null);
    const [formData, setFormData] = useState({
        grantorNumber: "",
        name: "",
        email: "",
        mobile: "",
        telephone: "",
        address: ""
    });

    const vendorId = localStorage.getItem('vendorId') || '5000000061';

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getDetails(vendorId);

            // Fetch user agreement
            const agreementResponse = await fetch(`http://localhost:8000/api/user-agreement/${vendorId}`);
            const agreementData = await agreementResponse.json();
            if (agreementData.success && agreementData.has_agreement) {
                setUserAgreementUrl(agreementData.file_url);
            }
            if (response.success) {
                setFormData(response.data);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load user details',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

    const fields = ["Name", "Email", "Mobile Number", "Address", "Telephone"];

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

        // First Confirmation Alert
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
                        'Name': 'name',
                        'Email': 'email',
                        'Mobile Number': 'mobile',
                        'Telephone': 'telephone',
                        'Address': 'address'
                    };
                    const key = fieldMap[field];
                    if (key) {
                        updateData[key] = formData[key];
                    }
                });

                const response = await userAPI.updateDetails(vendorId, updateData);

                if (response.success) {
                    setStep(0);
                    setSelectedFields([]);
                    setReasons({});
                    await fetchUserDetails(); // Refresh data

                    Swal.fire({
                        title: 'Update Request Sent',
                        text: 'Your update request has been sent to UKPN Property and Consent team. Please note that it will take up to 5 working days to reflect in our system.',
                        icon: 'success',
                        confirmButtonColor: '#ea580c',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'Failed to update user details',
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-zinc-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    return (
        <FadeInWhenVisible>
            <div className="max-w-3xl mx-auto glass-panel p-6 rounded-2xl shadow-xl border-t-4 border-orange-500">
                <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-3">
                    <Icon icon="lucide:user" className="text-orange-500" /> User Details
                </h2>

                {step === 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LabelValue label="Grantor Number" value={formData.grantorNumber} />
                            <LabelValue label="Name" value={formData.name} />
                            <LabelValue label="Email" value={formData.email} />
                            <LabelValue label="Mobile Number" value={formData.mobile} />
                            <LabelValue label="Telephone" value={formData.telephone} />
                        </div>
                        <LabelValue label="Address" value={formData.address} />

                        <div className="pt-3 flex justify-between items-center gap-3">
                            {userAgreementUrl && (
                                <button
                                    onClick={() => window.open(`http://localhost:8000${userAgreementUrl}`, '_blank')}
                                    className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-md whitespace-nowrap"
                                >
                                    User Agreement
                                </button>
                            )}
                            <button onClick={() => setStep(1)} className="px-6 py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-md ml-auto whitespace-nowrap">
                                Update Details
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-zinc-800">What would you like to update?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {fields.map(field => (
                                <label key={field} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedFields.includes(field) ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-orange-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field)}
                                        onChange={() => handleCheckboxChange(field)}
                                        className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-zinc-300 rounded"
                                    />
                                    <span className="font-medium text-zinc-700">{field}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setStep(0)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Cancel</button>
                            <button
                                onClick={() => selectedFields.length > 0 && setStep(2)}
                                disabled={selectedFields.length === 0}
                                className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
                                        <option value="Moving House">Moving House</option>
                                        <option value="Legal Change">Legal Change</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Back</button>
                            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 shadow-md">Continue</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={submitUpdate} className="space-y-4">
                        <h3 className="text-base font-semibold text-zinc-800">Enter New Details</h3>
                        <p className="text-sm text-zinc-600">Fields highlighted in orange can be edited. Other fields are read-only.</p>
                        <div className="space-y-3">
                            {/* Name Field */}
                            <div>
                                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                    Name
                                    {selectedFields.includes("Name") && <span className="text-xs text-orange-600">(Editable)</span>}
                                </label>
                                <input
                                    type="text"
                                    className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${selectedFields.includes("Name")
                                        ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                        : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                        }`}
                                    value={formData.name}
                                    onChange={(e) => selectedFields.includes("Name") && setFormData({ ...formData, name: e.target.value })}
                                    readOnly={!selectedFields.includes("Name")}
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                    Email
                                    {selectedFields.includes("Email") && <span className="text-xs text-orange-600">(Editable)</span>}
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

                            {/* Telephone Field */}
                            <div>
                                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                    Telephone
                                    {selectedFields.includes("Telephone") && <span className="text-xs text-orange-600">(Editable)</span>}
                                </label>
                                <input
                                    type="tel"
                                    className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${selectedFields.includes("Telephone")
                                        ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                        : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                        }`}
                                    value={formData.telephone}
                                    onChange={(e) => selectedFields.includes("Telephone") && setFormData({ ...formData, telephone: e.target.value })}
                                    readOnly={!selectedFields.includes("Telephone")}
                                />
                            </div>

                            {/* Address Field */}
                            <div>
                                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                    Address
                                    {selectedFields.includes("Address") && <span className="text-xs text-orange-600">(Editable)</span>}
                                </label>
                                <textarea
                                    rows="3"
                                    className={`mt-1 w-full px-4 py-2 border rounded-lg outline-none ${selectedFields.includes("Address")
                                        ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                        : 'bg-zinc-100 border-zinc-200 cursor-not-allowed'
                                        }`}
                                    value={formData.address}
                                    onChange={(e) => selectedFields.includes("Address") && setFormData({ ...formData, address: e.target.value })}
                                    readOnly={!selectedFields.includes("Address")}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Back</button>
                            <button type="submit" className="px-6 py-2.5 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 shadow-md transition-colors">Submit Update</button>
                        </div>
                    </form>
                )}
            </div>
        </FadeInWhenVisible>
    );
};

export default UserDetails;
