import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import Icon from '../components/Icon';
import MovingHouseModal from '../components/MovingHouseModal';
import { userAPI } from '../services/api';
import Swal from 'sweetalert2';

const MovingHouse = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [userPostcode, setUserPostcode] = useState('');
    const [loading, setLoading] = useState(true);
    const [submittedData, setSubmittedData] = useState(null);
    const [mapCoordinates, setMapCoordinates] = useState(null);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    const mapContainerStyle = {
        width: '100%',
        height: '500px'
    };

    useEffect(() => {
        fetchUserDetails();
        fetchMovingHouseNotifications();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const vendorId = localStorage.getItem('vendorId') || '5000000061';
            const response = await userAPI.getDetails(vendorId);

            if (response.success) {
                // Extract address and postcode from the full address
                const fullAddress = response.data.address || '';
                // Try to extract postcode (UK postcode pattern)
                const postcodeMatch = fullAddress.match(/([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})$/i);

                if (postcodeMatch) {
                    setUserPostcode(postcodeMatch[1].trim());
                    // Remove postcode from address
                    setUserAddress(fullAddress.replace(postcodeMatch[0], '').trim().replace(/,\s*$/, ''));
                } else {
                    setUserAddress(fullAddress);
                    setUserPostcode('');
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load user details',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        }
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

    const fetchMovingHouseNotifications = async () => {
        try {
            setLoading(true);
            const vendorId = localStorage.getItem('vendorId') || '5000000061';
            const response = await fetch(`http://localhost:8000/api/moving-house/${vendorId}`);
            const data = await response.json();

            if (data.success && data.notifications && data.notifications.length > 0) {
                // Get the most recent notification
                const latestNotification = data.notifications[0];

                // Load coordinates for the map
                const oldCoords = await geocodeAddress(latestNotification.old_postcode);
                const newCoords = await geocodeAddress(latestNotification.new_postcode);

                if (oldCoords && newCoords) {
                    setSubmittedData({
                        oldAddress: latestNotification.old_address,
                        oldPostcode: latestNotification.old_postcode,
                        newAddress: latestNotification.new_address,
                        newPostcode: latestNotification.new_postcode,
                        newOwnerName: latestNotification.new_owner_name,
                        newOwnerEmail: latestNotification.new_owner_email,
                        newOwnerMobile: latestNotification.new_owner_mobile
                    });
                    setMapCoordinates({
                        old: oldCoords,
                        new: newCoords
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching moving house notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmissionSuccess = (data, coordinates) => {
        setSubmittedData(data);
        setMapCoordinates(coordinates);
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-zinc-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {!submittedData ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-6">
                        <Icon icon="lucide:truck" className="text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900">Moving House?</h2>
                    <p className="text-zinc-500 mt-2 max-w-md text-center">
                        Let us know if you are moving so we can update our records and ensure payments are directed correctly.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Notify Team
                    </button>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header with Notify Team button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900">Moving House Notification</h2>
                            <p className="text-zinc-500 mt-1">Your relocation details have been submitted successfully</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <Icon icon="lucide:plus" />
                            Notify Team
                        </button>
                    </div>

                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon icon="lucide:check" className="text-2xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">Submission Successful!</h3>
                                <p className="text-zinc-600 mt-1">
                                    Your moving house notification has been submitted. We will update our records and ensure payments are directed correctly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Map View */}
                    <div className="glass-panel rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <Icon icon="lucide:map" className="text-purple-600" />
                            Route Overview
                        </h3>
                        <p className="text-sm text-zinc-600 mb-4">
                            Your relocation route from old address to new address
                        </p>

                        {GOOGLE_MAPS_API_KEY && mapCoordinates?.old && mapCoordinates?.new ? (
                            <div className="rounded-lg overflow-hidden border border-zinc-200">
                                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={{
                                            lat: (mapCoordinates.old.lat + mapCoordinates.new.lat) / 2,
                                            lng: (mapCoordinates.old.lng + mapCoordinates.new.lng) / 2
                                        }}
                                        zoom={10}
                                    >
                                        <Marker
                                            position={mapCoordinates.old}
                                            label="Old"
                                            icon={{
                                                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                            }}
                                        />
                                        <Marker
                                            position={mapCoordinates.new}
                                            label="New"
                                            icon={{
                                                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                            }}
                                        />
                                        <Polyline
                                            path={[mapCoordinates.old, mapCoordinates.new]}
                                            options={{
                                                strokeColor: '#ea580c',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 3,
                                                geodesic: true,
                                                icons: [{
                                                    icon: {
                                                        path: 'M 0,-1 0,1',
                                                        strokeOpacity: 1,
                                                        scale: 3
                                                    },
                                                    offset: '0',
                                                    repeat: '20px'
                                                }]
                                            }}
                                        />
                                    </GoogleMap>
                                </LoadScript>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-100 rounded-lg">
                                <Icon icon="lucide:map-off" className="text-4xl text-zinc-400 mx-auto mb-2" />
                                <p className="text-zinc-500">Map unavailable</p>
                            </div>
                        )}
                    </div>

                    {/* Details Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-panel rounded-xl p-6 shadow-lg">
                            <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Icon icon="lucide:home" className="text-red-600" />
                                Old Address
                            </h4>
                            <p className="text-zinc-600 mb-1">{submittedData.oldAddress}</p>
                            <p className="text-zinc-600 font-semibold">{submittedData.oldPostcode}</p>
                        </div>

                        <div className="glass-panel rounded-xl p-6 shadow-lg">
                            <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Icon icon="lucide:map-pin" className="text-green-600" />
                                New Address
                            </h4>
                            <p className="text-zinc-600 mb-1">{submittedData.newAddress}</p>
                            <p className="text-zinc-600 font-semibold">{submittedData.newPostcode}</p>
                        </div>
                    </div>

                    {/* New Owner Details */}
                    <div className="glass-panel rounded-xl p-6 shadow-lg">
                        <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <Icon icon="lucide:user-plus" className="text-blue-600" />
                            New Owner Details
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Name</span>
                                <p className="text-zinc-900 font-medium">{submittedData.newOwnerName}</p>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Email</span>
                                <p className="text-zinc-900 font-medium">{submittedData.newOwnerEmail}</p>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-500 block mb-1">Mobile</span>
                                <p className="text-zinc-900 font-medium">{submittedData.newOwnerMobile}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <MovingHouseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentAddress={userAddress}
                currentPostcode={userPostcode}
                onSubmitSuccess={handleSubmissionSuccess}
            />
        </div>
    );
};

export default MovingHouse;
