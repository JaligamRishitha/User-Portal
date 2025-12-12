import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Swal from 'sweetalert2';

const ReportsMap = () => {
    const [reportType, setReportType] = useState('geographical'); // 'geographical' or 'remittance'
    const [searchQuery, setSearchQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentCount, setDocumentCount] = useState(0);
    const [location, setLocation] = useState({ latitude: 51.5074, longitude: -0.1278 });
    const [viewingDoc, setViewingDoc] = useState(null);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
        setReportType(reportType === 'geographical' ? 'remittance' : 'geographical');
        setSearchQuery("");
        setHasSearched(false);
        setDocuments([]);
        setDocumentCount(0);
    };

    return (
        <div className={`w-full max-w-7xl mx-auto h-full flex flex-col animate-fade-in p-6 ${!hasSearched || documents.length === 0 ? 'pb-96' : 'pb-24'}`}>
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

                {/* Search Form */}
                <form onSubmit={handleSearch} className="relative w-full max-w-lg group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {reportType === 'geographical' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            )}
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl leading-5 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm shadow-sm transition-all"
                        placeholder={reportType === 'geographical' ? 'Enter Postcode (e.g. SW1A 1AA)' : 'Enter Fiscal Year (e.g. 2023)'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute inset-y-1.5 right-1.5 px-4 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
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
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                    {/* Map View / Year Info */}
                    <div className="lg:col-span-2 bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden relative shadow-inner group">
                        {reportType === 'geographical' ? (
                            <>
                                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={{ lat: location.latitude, lng: location.longitude }}
                                        zoom={15}
                                        options={mapOptions}
                                    >
                                        <Marker
                                            position={{ lat: location.latitude, lng: location.longitude }}
                                            title={searchQuery}
                                            animation={window.google?.maps?.Animation?.DROP}
                                        />
                                    </GoogleMap>
                                </LoadScript>
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-zinc-600 border border-zinc-200 z-10">
                                    {searchQuery} - {documentCount} document{documentCount !== 1 ? 's' : ''} found
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-zinc-600 border border-zinc-200 z-10">
                                    {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° W
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-orange-600 mb-4">{searchQuery}</div>
                                    <div className="text-xl text-zinc-600 mb-8">Fiscal Year</div>
                                    <div className="grid grid-cols-2 gap-6 max-w-md">
                                        <div className="bg-white/90 backdrop-blur rounded-xl p-6 border border-zinc-200 shadow-sm">
                                            <div className="text-3xl font-bold text-zinc-900">{documentCount}</div>
                                            <div className="text-sm text-zinc-500 mt-1">Documents</div>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur rounded-xl p-6 border border-zinc-200 shadow-sm">
                                            <div className="text-3xl font-bold text-green-600">✓</div>
                                            <div className="text-sm text-zinc-500 mt-1">Available</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents Sidebar */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-zinc-200 flex flex-col overflow-hidden shadow-sm h-full">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="font-semibold text-zinc-900">
                                {reportType === 'geographical' ? 'Reports Found' : 'Remittance Reports Available'}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">{documentCount} document{documentCount !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8">
                                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm">No documents found</p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => setViewingDoc(doc)}
                                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 cursor-pointer transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 group-hover:bg-white text-zinc-400 group-hover:text-red-500 flex items-center justify-center border border-zinc-200/50">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-zinc-700 truncate">{doc.document_name}</h4>
                                            <div className="text-[10px] text-zinc-400">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
