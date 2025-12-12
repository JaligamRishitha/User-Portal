import { useState } from 'react';
import Swal from 'sweetalert2';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ReportsMap = () => {
    const [reportType, setReportType] = useState('geographical');
    const [searchQuery, setSearchQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(true);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentCount, setDocumentCount] = useState(0);
    const [location, setLocation] = useState({ latitude: 51.5074, longitude: -0.1278 });
    const [viewingDoc, setViewingDoc] = useState(null);
    const [showDocumentList, setShowDocumentList] = useState(false);
    const [locations, setLocations] = useState([]); // Multiple locations for remittance reports
    const [selectedLocation, setSelectedLocation] = useState(null);

    const mapContainerStyle = {
        width: '100%',
        height: '100%'
    };

    const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim().length === 0) {
            Swal.fire({
                title: 'Input Required',
                text: reportType === 'geographical' ? 'Please enter a postcode' : 'Please enter a fiscal year',
                icon: 'warning',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const endpoint = reportType === 'geographical'
                ? `http://localhost:8000/api/admin/reports/geographical/${searchQuery}`
                : `http://localhost:8000/api/admin/reports/remittance/${searchQuery}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.success) {
                setDocuments(data.documents);
                setDocumentCount(data.count);
                if (reportType === 'geographical' && data.location) {
                    setLocation(data.location);
                } else if (reportType === 'remittance') {
                    // Group documents by postcode and get locations
                    const uniquePostcodes = [...new Set(data.documents.map(doc => doc.postcode).filter(Boolean))];
                    console.log('Unique postcodes:', uniquePostcodes);

                    if (uniquePostcodes.length > 0) {
                        const locs = await Promise.all(
                            uniquePostcodes.map(async (postcode) => {
                                try {
                                    const geoResponse = await fetch(`http://localhost:8000/api/admin/reports/geographical/${postcode}`);
                                    const geoData = await geoResponse.json();
                                    console.log(`Location for ${postcode}:`, geoData);
                                    return {
                                        postcode,
                                        latitude: geoData.location.latitude,
                                        longitude: geoData.location.longitude,
                                        documents: data.documents.filter(doc => doc.postcode === postcode)
                                    };
                                } catch (err) {
                                    console.error(`Error fetching location for ${postcode}:`, err);
                                    return null;
                                }
                            })
                        );
                        const validLocs = locs.filter(Boolean);
                        console.log('Valid locations:', validLocs);
                        setLocations(validLocs);
                        if (validLocs.length > 0) {
                            setLocation({ latitude: validLocs[0].latitude, longitude: validLocs[0].longitude });
                        }
                    } else {
                        setLocations([]);
                    }
                }
            } else {
                throw new Error('Failed to fetch documents');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to load documents. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
            setDocuments([]);
            setDocumentCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const newType = reportType === 'geographical' ? 'remittance' : 'geographical';
        setReportType(newType);
        setSearchQuery("");
        setHasSearched(true); // Always show map for both types
        setDocuments([]);
        setDocumentCount(0);
        setLocations([]); // Reset locations
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col animate-fade-in p-6 overflow-y-auto" style={{ minHeight: 'calc(100vh - 10rem)' }}>
            {/* Header with Toggle */}
            <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className={`text-2xl font-semibold transition-colors ${reportType === 'geographical' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        Geographical Reports
                    </h2>

                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        className="relative inline-flex h-8 w-16 items-center rounded-full bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${reportType === 'remittance' ? 'translate-x-9' : 'translate-x-1'
                                }`}
                        />
                    </button>

                    <h2 className={`text-2xl font-semibold transition-colors ${reportType === 'remittance' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        Remittance Reports
                    </h2>
                </div>

                {/* Dropdown Form */}
                <form onSubmit={handleSearch} className="relative w-full max-w-lg group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <svg className="w-5 h-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {reportType === 'geographical' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            )}
                        </svg>
                    </div>
                    <select
                        className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl leading-5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm shadow-sm transition-all appearance-none cursor-pointer"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    >
                        <option value="">
                            {reportType === 'geographical' ? 'Select Postcode' : 'Select Fiscal Year'}
                        </option>
                        {reportType === 'geographical' ? (
                            <>
                                <option value="TN255HW">TN25 5HW</option>
                                <option value="RH158NB">RH15 8NB</option>
                                <option value="TN126HT">TN12 6HT</option>
                                <option value="CM33DQ">CM3 3DQ</option>
                            </>
                        ) : (
                            <>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                            </>
                        )}
                    </select>
                    <button
                        type="submit"
                        disabled={loading || !searchQuery}
                        className="absolute inset-y-1.5 right-1.5 px-4 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : 'Generate'}
                    </button>
                </form>
            </div>

            {/* Content */}
            {!hasSearched ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/30">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {reportType === 'geographical' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            )}
                        </svg>
                    </div>
                    <p className="text-sm font-medium">
                        {reportType === 'geographical'
                            ? 'Enter a postcode to view network assets'
                            : 'Enter a fiscal year to view remittance reports'}
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden" style={{ minHeight: '600px' }}>
                    {/* Map View / Year Info - Full Width */}
                    <div className="bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden relative shadow-inner group w-full h-full" style={{ minHeight: '600px' }}>
                        {reportType === 'geographical' ? (
                            <>
                                <iframe
                                    width="100%"
                                    height="600"
                                    style={{ border: 0, minHeight: '600px', height: '100%' }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={searchQuery
                                        ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${location.latitude},${location.longitude}&zoom=15&maptype=roadmap`
                                        : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=11`
                                    }
                                />
                                {searchQuery && documents.length > 0 && (
                                    <>
                                        {/* Document List Popup - Near Marker (Always Visible) */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-16 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-zinc-200 z-10 max-w-xs animate-fade-in">
                                            <div className="p-3 border-b border-zinc-200 bg-red-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-zinc-900">{searchQuery}</h3>
                                                        <p className="text-xs text-zinc-500">{documentCount} document{documentCount !== 1 ? 's' : ''} found</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {documents.map((doc, index) => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => window.open(`http://localhost:8000${doc.document_url}`, '_blank')}
                                                        className="w-full text-left p-3 hover:bg-orange-50 border-b border-zinc-100 last:border-b-0 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-medium text-zinc-900 truncate group-hover:text-orange-600">{doc.document_name}</h4>
                                                                <p className="text-[10px] text-zinc-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <svg className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-zinc-600 border border-zinc-200 z-10">
                                            {searchQuery ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° W` : 'London, UK'}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <iframe
                                    width="100%"
                                    height="600"
                                    style={{ border: 0, minHeight: '600px', height: '100%' }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={searchQuery
                                        ? `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=12&maptype=roadmap`
                                        : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=11`
                                    }
                                />
                                {searchQuery && locations.length > 0 && (
                                    <>
                                        {/* Multiple Location Markers with Popup Boxes */}
                                        {locations.map((loc, index) => {
                                            const markerTop = 25 + (index * 25);
                                            const markerLeft = 20 + (index * 15);

                                            return (
                                                <div key={loc.postcode} className="absolute z-10" style={{ top: `${markerTop}%`, left: `${markerLeft}%` }}>
                                                    {/* Marker Pin */}
                                                    <div className="relative flex items-start gap-3">
                                                        {/* Pin Icon */}
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative">
                                                                <svg className="w-10 h-10 text-blue-600 drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }} fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                                </svg>
                                                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>

                                                        {/* Popup Box */}
                                                        <div className="bg-white/95 backdrop-blur rounded-xl shadow-2xl border-2 border-blue-500 max-w-xs animate-fade-in">
                                                            <div className="p-3 border-b border-zinc-200 bg-gradient-to-r from-blue-50 to-blue-100">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                                                    <div>
                                                                        <h3 className="text-sm font-bold text-zinc-900">{loc.postcode}</h3>
                                                                        <p className="text-xs text-zinc-600">{loc.documents.length} document{loc.documents.length !== 1 ? 's' : ''}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {loc.documents.map((doc) => (
                                                                    <button
                                                                        key={doc.id}
                                                                        onClick={() => window.open(`http://localhost:8000${doc.document_url}`, '_blank')}
                                                                        className="w-full text-left p-2.5 hover:bg-orange-50 border-b border-zinc-100 last:border-b-0 transition-all group"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <h4 className="text-xs font-medium text-zinc-900 truncate group-hover:text-orange-600">{doc.document_name}</h4>
                                                                            </div>
                                                                            <svg className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                            </svg>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-sm font-semibold text-zinc-700 border-2 border-blue-400 z-10">
                                            📍 FY {searchQuery}: {locations.length} location{locations.length !== 1 ? 's' : ''}
                                        </div>
                                    </>
                                )}
                                {searchQuery && documents.length > 0 && locations.length === 0 && (
                                    <div className="absolute top-4 left-4 bg-red-100 border border-red-300 px-3 py-2 rounded-lg text-xs text-red-700">
                                        No postcodes found for documents
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden animate-fade-in">
                        <div className="px-6 py-2 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                            <div className="flex-1">
                                <h3 className="font-semibold text-zinc-900">{viewingDoc.document_name}</h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {reportType === 'geographical'
                                        ? `Postcode: ${viewingDoc.postcode}`
                                        : `Fiscal Year: ${viewingDoc.fiscal_year}`}
                                    {' • '}
                                    {viewingDoc.document_type} Document
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 bg-zinc-100 overflow-hidden">
                            {viewingDoc.document_type === 'PDF' ? (
                                <iframe
                                    src={`http://localhost:8000${viewingDoc.document_url}`}
                                    className="w-full h-full border-0"
                                    title={viewingDoc.document_name}
                                />
                            ) : viewingDoc.document_type.match(/JPG|JPEG|PNG|GIF/i) ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <img
                                        src={`http://localhost:8000${viewingDoc.document_url}`}
                                        alt={viewingDoc.document_name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="bg-white shadow-lg p-12 text-center rounded-xl">
                                        <svg className="w-24 h-24 mx-auto mb-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-medium text-zinc-700 mb-2">Preview Not Available</p>
                                        <p className="text-sm text-zinc-500">{viewingDoc.document_type} files cannot be previewed in browser</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsMap;
