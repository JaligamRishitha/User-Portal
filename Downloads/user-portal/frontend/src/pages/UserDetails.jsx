import { useState } from 'react';
import Swal from 'sweetalert2';
import FadeInWhenVisible from '../components/FadeInWhenVisible';
import Icon from '../components/Icon';

const UserDetails = () => {
    const [step, setStep] = useState(0);
    const [selectedFields, setSelectedFields] = useState([]);
    const [reasons, setReasons] = useState({});
    const [formData, setFormData] = useState({
        grantorNumber: "UKPN-88219-X",
        name: "James Anderson",
        email: "james.anderson@example.com",
        mobile: "07700 900 123",
        telephone: "020 7946 0123",
        address: "12 Willow Avenue, London, SE10 8ES"
    });

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
                    text: 'Your update request has been sent to UKPN Property and Consent team. Please note that it will take up to 5 working days to reflect in our system.',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    const LabelValue = ({ label, value }) => (
        <div className="group border-b border-zinc-100 pb-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">{label}</label>
            <div className="text-base font-medium text-zinc-900">{value}</div>
        </div>
    );

    return (
        <FadeInWhenVisible>
            <div className="max-w-3xl mx-auto glass-panel p-8 rounded-2xl shadow-xl border-t-4 border-orange-500">
                <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <Icon icon="lucide:user" className="text-orange-500" /> User Details
                </h2>

                {step === 0 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LabelValue label="Grantor Number" value={formData.grantorNumber} />
                            <LabelValue label="Name" value={formData.name} />
                            <LabelValue label="Email" value={formData.email} />
                            <LabelValue label="Mobile Number" value={formData.mobile} />
                            <LabelValue label="Telephone" value={formData.telephone} />
                        </div>
                        <LabelValue label="Address" value={formData.address} />

                        <div className="pt-4 flex justify-end">
                            <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-zinc-200">
                                Update Details
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-zinc-800">What would you like to update?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-zinc-800">Please provide reason for updating</h3>
                        <div className="space-y-4">
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
                    <form onSubmit={submitUpdate} className="space-y-6">
                        <h3 className="text-lg font-semibold text-zinc-800">Enter New Details</h3>
                        <div className="space-y-5">
                            {selectedFields.includes("Name") && (
                                <div><label className="text-sm font-medium text-zinc-700">Name</label><input type="text" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.name} /></div>
                            )}
                            {selectedFields.includes("Email") && (
                                <div><label className="text-sm font-medium text-zinc-700">Email</label><input type="email" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.email} /></div>
                            )}
                            {selectedFields.includes("Mobile Number") && (
                                <div><label className="text-sm font-medium text-zinc-700">Mobile Number</label><input type="tel" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.mobile} /></div>
                            )}
                            {selectedFields.includes("Telephone") && (
                                <div><label className="text-sm font-medium text-zinc-700">Telephone</label><input type="tel" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.telephone} /></div>
                            )}
                            {selectedFields.includes("Address") && (
                                <div><label className="text-sm font-medium text-zinc-700">Address</label><textarea rows="3" className="mt-1 w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" defaultValue={formData.address}></textarea></div>
                            )}
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
