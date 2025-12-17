import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ReportsMap = () => {
    const [reportType, setReportType] = useState('geographical');
    const [searchQuery, setSearchQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentCount, setDocumentCount] = useState(0);
    const [location, setLocation] = useState({ latitude: 51.5074, longitude: -0.1278 });
    const [viewingDoc, setViewingDoc] = useState(null);
    const [showDocumentList, setShowDocumentList] = useState(false);
    const [locations, setLocations] = useState([]); // Multiple locations for remittance reports
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'map' for remittance reports

    // Table filters for remittance reports
    const [tableFilters, setTableFilters] = useState({
        grantorNumber: '',
        grantorName: '',
        postcode: '',
        fiscalYear: ''
    });
    const [filteredDocuments, setFilteredDocuments] = useState([]);

    // Live search with debouncing - automatically search as user types
    useEffect(() => {
        // For remittance reports, search with 1+ characters (to support single digit grantor number search)
        // For geographical reports, require 2+ characters
        const minLength = reportType === 'remittance' ? 1 : 2;

        if (searchQuery.trim().length >= minLength) {
            const debounceTimer = setTimeout(() => {
                performSearch();
            }, 300); // Wait 300ms after user stops typing for faster response

            return () => clearTimeout(debounceTimer);
        } else if (searchQuery.trim().length === 0) {
            // Clear results when search is empty
            setDocuments([]);
            setDocumentCount(0);
            setHasSearched(false);
            setLocations([]);
            setFilteredDocuments([]);
        }
    }, [searchQuery, reportType]);

    // Apply filters whenever documents or tableFilters change
    useEffect(() => {
        if (reportType === 'remittance' && viewMode === 'table') {
            let filtered = [...documents];

            // Filter by Grantor Number
            if (tableFilters.grantorNumber.trim()) {
                filtered = filtered.filter(doc =>
                    doc.vendor_id?.toLowerCase().includes(tableFilters.grantorNumber.toLowerCase())
                );
            }

            // Filter by Grantor Name
            if (tableFilters.grantorName.trim()) {
                filtered = filtered.filter(doc => {
                    const name = doc.grantor_name || doc.full_name || '';
                    return name.toLowerCase().includes(tableFilters.grantorName.toLowerCase());
                });
            }

            // Filter by Postcode
            if (tableFilters.postcode.trim()) {
                filtered = filtered.filter(doc =>
                    doc.postcode?.toLowerCase().includes(tableFilters.postcode.toLowerCase())
                );
            }

            // Filter by Fiscal Year
            if (tableFilters.fiscalYear.trim()) {
                filtered = filtered.filter(doc =>
                    doc.fiscal_year?.toString().includes(tableFilters.fiscalYear)
                );
            }

            setFilteredDocuments(filtered);
        } else {
            setFilteredDocuments(documents);
        }
    }, [documents, tableFilters, reportType, viewMode]);

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

    const performSearch = async () => {
        const minLength = reportType === 'remittance' ? 1 : 2;
        if (searchQuery.trim().length < minLength) return;

        setLoading(true);
        setHasSearched(true);

        try {
            const endpoint = reportType === 'geographical'
                ? `http://localhost:8000/api/admin/reports/geographical/${searchQuery}`
                : `http://localhost:8000/api/admin/reports/remittance/search/${searchQuery}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.success) {
                console.log('Received documents:', data.documents);
                console.log('Document count:', data.count);
                console.log('Current viewMode:', viewMode);
                console.log('Report type:', reportType);
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
        setHasSearched(false); // Reset to show empty map
        setDocuments([]);
        setDocumentCount(0);
        setLocations([]); // Reset locations
        setViewMode('table'); // Reset to table view for remittance
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col animate-fade-in p-6 overflow-y-auto" style={{ minHeight: 'calc(100vh - 10rem)' }}>
            {/* Header with Toggle */}
            <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className={`text-2xl font-semibold transition-colors ${reportType === 'geographical' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        Map View
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

                {/* Live Search Input */}
                <div className="relative w-full max-w-lg group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <svg className="w-5 h-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl leading-5 text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm shadow-sm transition-all"
                        placeholder={reportType === 'geographical' ? 'Enter postcode (e.g., TN25 5HW)' : 'Search by year, grantor number, name, or postcode...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-3 flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                        </div>
                    )}
                    {searchQuery && !loading && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
                            title="Clear search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* View Mode Toggle for Remittance Reports */}
            {reportType === 'remittance' && searchQuery && documents.length > 0 && (
                <div className="flex justify-end mb-4">
                    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                                ? 'bg-orange-600 text-white'
                                : 'text-zinc-600 hover:text-zinc-900'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Table
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'map'
                                ? 'bg-orange-600 text-white'
                                : 'text-zinc-600 hover:text-zinc-900'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Map
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            {reportType === 'remittance' && viewMode === 'table' && hasSearched && searchQuery ? (
                /* Table View for Remittance Reports */
                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Filter Bar */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-zinc-900">Filter Results</h3>
                            {(tableFilters.grantorNumber || tableFilters.grantorName || tableFilters.postcode || tableFilters.fiscalYear) && (
                                <button
                                    onClick={() => setTableFilters({ grantorNumber: '', grantorName: '', postcode: '', fiscalYear: '' })}
                                    className="ml-auto text-xs text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Grantor Number..."
                                    value={tableFilters.grantorNumber}
                                    onChange={(e) => setTableFilters({ ...tableFilters, grantorNumber: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Grantor Name..."
                                    value={tableFilters.grantorName}
                                    onChange={(e) => setTableFilters({ ...tableFilters, grantorName: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Postcode..."
                                    value={tableFilters.postcode}
                                    onChange={(e) => setTableFilters({ ...tableFilters, postcode: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none"
                                />
                            </div>

                        </div>
                        <div className="mt-3 text-xs text-zinc-500">
                            Showing {filteredDocuments.length} of {documents.length} results
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            Grantor Number
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            Grantor Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            First Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            Last Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            Fiscal Year
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            Postcode
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                                            Remittance Report
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {filteredDocuments.length > 0 ? (
                                        filteredDocuments.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                    {doc.vendor_id || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                    {doc.grantor_name || doc.full_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                    {doc.first_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                    {doc.last_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                    {doc.fiscal_year}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                                                    {doc.postcode || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => window.open(`http://localhost:8000${doc.document_url}`, '_blank')}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs font-medium"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Document
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-sm text-zinc-500">
                                                No documents found for fiscal year {searchQuery}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden" style={{ minHeight: '600px' }}>
                    {/* Map View / Year Info - Full Width */}
                    <div className={`rounded-2xl overflow-hidden relative group w-full h-full ${(reportType === 'remittance' && (!hasSearched || !searchQuery)) ? '' : 'bg-zinc-100 border border-zinc-200 shadow-inner'}`} style={{ minHeight: '600px' }}>
                        {reportType === 'geographical' ? (
                            <>
                                <iframe
                                    width="100%"
                                    height="600"
                                    style={{ border: 0, minHeight: '600px', height: '100%' }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=11`}
                                />
                                {hasSearched && searchQuery && documents.length > 0 && (
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
                                                        className="w-full text-left p-2.5 hover:bg-orange-50 border-b border-zinc-100 last:border-b-0 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-orange-600">
                                                                        {doc.full_name || 'Unknown'}
                                                                    </h4>

                                                                    {doc.vendor_id && (
                                                                        <span className="text-[10px] text-zinc-400 font-normal">
                                                                            ({doc.vendor_id})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <svg className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
                                {/* Show placeholder when no search, otherwise show map */}
                                {!hasSearched || !searchQuery ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-zinc-400">
                                            <svg className="w-20 h-20 mx-auto mb-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium text-zinc-600">Search for Remittance Reports</p>
                                            <p className="text-sm text-zinc-400 mt-2">Enter a fiscal year, grantor number, name, or postcode to view reports</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <iframe
                                            width="100%"
                                            height="600"
                                            style={{ border: 0, minHeight: '600px', height: '100%' }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=11`}
                                        />
                                    </>
                                )}
                                {hasSearched && searchQuery && locations.length > 0 && (
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
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-orange-600">
                                                                                        {doc.grantor_name || doc.full_name || 'Unknown'}
                                                                                    </h4>
                                                                                    {doc.vendor_id && (
                                                                                        <span className="text-[10px] text-zinc-400 font-normal">
                                                                                            ({doc.vendor_id})
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <svg className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
                                {hasSearched && searchQuery && documents.length > 0 && locations.length === 0 && (
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
