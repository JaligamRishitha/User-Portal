import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import Swal from 'sweetalert2';
import Icon from './Icon';

const MovingHouseModal = ({ isOpen, onClose, currentAddress, currentPostcode, onSubmitSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        oldAddress: '',
        oldPostcode: '',
        newAddress: '',
        newPostcode: '',
        newOwnerName: '',
        newOwnerEmail: '',
        newOwnerMobile: ''
    });
    const [oldCoordinates, setOldCoordinates] = useState(null);
    const [newCoordinates, setNewCoordinates] = useState(null);
    const [isLoadingMap, setIsLoadingMap] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessMap, setShowSuccessMap] = useState(false);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // Update form data when props change
    useEffect(() => {
        if (currentAddress || currentPostcode) {
            setFormData(prev => ({
                ...prev,
                oldAddress: currentAddress || '',
                oldPostcode: currentPostcode || ''
            }));
        }
    }, [currentAddress, currentPostcode]);

    const mapContainerStyle = {
        width: '100%',
        height: '400px'
    };

    const geocodeAddress = async (postcode) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
                return {
                    lat: data.results[0].geometry.location.lat,
                    lng: data.results[0].geometry.location.lng
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    const loadCoordinates = async () => {
        setIsLoadingMap(true);
        const oldCoords = await geocodeAddress(formData.oldPostcode);
        const newCoords = await geocodeAddress(formData.newPostcode);

        if (oldCoords && newCoords) {
            setOldCoordinates(oldCoords);
            setNewCoordinates(newCoords);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Location Error',
                text: 'Unable to locate addresses on map',
                confirmButtonColor: '#ea580c'
            });
        }
        setIsLoadingMap(false);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.newAddress || !formData.newPostcode) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all address fields',
                confirmButtonColor: '#ea580c'
            });
            return;
        }
        setStep(2);
    };

    const handleStep2Submit = (e) => {
        e.preventDefault();
        if (!formData.newOwnerName || !formData.newOwnerEmail || !formData.newOwnerMobile) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill in all new owner details',
                confirmButtonColor: '#ea580c'
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.newOwnerEmail)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#ea580c'
            });
            return;
        }

        setStep(3);
    };

    const handleFinalSubmit = async () => {
        try {
            setIsSubmitting(true);

            const vendorId = localStorage.getItem('vendorId') || '5000000061';
            const response = await fetch(`http://localhost:8000/api/moving-house`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vendor_id: vendorId,
                    old_address: formData.oldAddress,
                    old_postcode: formData.oldPostcode,
                    new_address: formData.newAddress,
                    new_postcode: formData.newPostcode,
                    new_owner_name: formData.newOwnerName,
                    new_owner_email: formData.newOwnerEmail,
                    new_owner_mobile: formData.newOwnerMobile
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Submission failed');
            }

            // Load coordinates for map display
            await loadCoordinates();

            setIsSubmitting(false);

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Submission Successful',
                text: 'Your moving house notification has been submitted successfully!',
                confirmButtonColor: '#ea580c',
                timer: 2000,
                showConfirmButton: false
            });

            // Pass data to parent component
            if (onSubmitSuccess) {
                onSubmitSuccess(formData, {
                    old: oldCoordinates,
                    new: newCoordinates
                });
            }

            // Reset and close modal
            setTimeout(() => {
                resetAndClose();
            }, 2000);
        } catch (error) {
            setIsSubmitting(false);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.message || 'There was an error submitting your request. Please try again.',
                confirmButtonColor: '#ea580c'
            });
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setFormData({
            oldAddress: currentAddress || '',
            oldPostcode: currentPostcode || '',
            newAddress: '',
            newPostcode: '',
            newOwnerName: '',
            newOwnerEmail: '',
            newOwnerMobile: ''
        });
        setOldCoordinates(null);
        setNewCoordinates(null);
        setShowSuccessMap(false);
        onClose();
    };

    if (!isOpen) return null;

    const mapCenter = step === 1
        ? oldCoordinates
        : step === 3 && oldCoordinates && newCoordinates
            ? {
                lat: (oldCoordinates.lat + newCoordinates.lat) / 2,
                lng: (oldCoordinates.lng + newCoordinates.lng) / 2
            }
            : newCoordinates;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-20 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto my-8">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Moving House Notification</h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            {showSuccessMap ? 'Completed' : `Step ${step} of 3`}
                        </p>
                    </div>
                    <button
                        onClick={resetAndClose}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <Icon icon="lucide:x" className="text-xl text-zinc-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${step >= 1 ? 'text-orange-600' : 'text-zinc-400'}`}>Address Details</span>
                        <span className={`text-xs font-medium ${step >= 2 ? 'text-orange-600' : 'text-zinc-400'}`}>New Owner Info</span>
                        <span className={`text-xs font-medium ${step >= 3 ? 'text-orange-600' : 'text-zinc-400'}`}>Review & Submit</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2">
                        <div
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Address Details */}
                    {step === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:home" className="text-orange-600" />
                                    Current Address
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="oldAddress"
                                            value={formData.oldAddress}
                                            readOnly
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-zinc-100 text-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Postcode</label>
                                        <input
                                            type="text"
                                            name="oldPostcode"
                                            value={formData.oldPostcode}
                                            readOnly
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-zinc-100 text-zinc-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:map-pin" className="text-blue-600" />
                                    New Address
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Address *</label>
                                        <input
                                            type="text"
                                            name="newAddress"
                                            value={formData.newAddress}
                                            onChange={handleInputChange}
                                            placeholder="Enter new address"
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Postcode *</label>
                                        <input
                                            type="text"
                                            name="newPostcode"
                                            value={formData.newPostcode}
                                            onChange={handleInputChange}
                                            placeholder="Enter new postcode"
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetAndClose}
                                    className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoadingMap}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoadingMap ? (
                                        <>
                                            <Icon icon="lucide:loader-2" className="animate-spin" />
                                            Locating...
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <Icon icon="lucide:arrow-right" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: New Owner Details */}
                    {step === 2 && (
                        <form onSubmit={handleStep2Submit} className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:user-plus" className="text-green-600" />
                                    New Owner Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="newOwnerName"
                                            value={formData.newOwnerName}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            name="newOwnerEmail"
                                            value={formData.newOwnerEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            name="newOwnerMobile"
                                            value={formData.newOwnerMobile}
                                            onChange={handleInputChange}
                                            placeholder="Enter mobile number"
                                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
                                >
                                    <Icon icon="lucide:arrow-left" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <Icon icon="lucide:arrow-right" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && !showSuccessMap && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:clipboard-check" className="text-purple-600" />
                                    Review Your Information
                                </h3>
                                <p className="text-sm text-zinc-600">
                                    Please review all details before submitting
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="border border-zinc-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-zinc-900 mb-2">Current Address</h4>
                                    <p className="text-sm text-zinc-600">{formData.oldAddress}</p>
                                    <p className="text-sm text-zinc-600">{formData.oldPostcode}</p>
                                </div>
                                <div className="border border-zinc-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-zinc-900 mb-2">New Address</h4>
                                    <p className="text-sm text-zinc-600">{formData.newAddress}</p>
                                    <p className="text-sm text-zinc-600">{formData.newPostcode}</p>
                                </div>
                            </div>

                            <div className="border border-zinc-200 rounded-lg p-4">
                                <h4 className="font-semibold text-zinc-900 mb-2">New Owner Details</h4>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-zinc-500">Name:</span>
                                        <p className="text-zinc-900 font-medium">{formData.newOwnerName}</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">Email:</span>
                                        <p className="text-zinc-900 font-medium">{formData.newOwnerEmail}</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500">Mobile:</span>
                                        <p className="text-zinc-900 font-medium">{formData.newOwnerMobile}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
                                >
                                    <Icon icon="lucide:arrow-left" />
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFinalSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Icon icon="lucide:loader-2" className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="lucide:check" />
                                            Submit Notification
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MovingHouseModal;
