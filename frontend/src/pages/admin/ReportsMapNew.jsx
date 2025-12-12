import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Swal from 'sweetalert2';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ReportsMap = () => {
    const [reportType, setReportType] = useState('geographical');
    const [searchQuery, setSearchQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(true);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentCount, setDocumentCount] = useState(0);
    const [viewingDoc, setViewingDoc] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 });
    const [mapZoom, setMapZoom] = useState(11);

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

    // Group documents by postcode and get unique locations
    const markerLocations = useMemo(() => {
        if (!documents.length) return [];
        
        const locationMap = new Map();
        
        documents.forEach(doc => {
            if (doc.postcode && doc.latitude && doc.longitude) {
                const key = doc.postcode;
                if (!locationMap.has(key)) {
                    locationMap.set(key, {
                        postcode: doc.postcode,
                        latitude: doc.latitude,
                        longitude: doc.longitude,
                        documents: []
                    });
                }
                locationMap.get(key).documents.push(doc);
            }
        });
        
        return Array.from(locationMap.values());
    }, [documents]);

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
        setSelectedMarker(null);

        try {
            const endpoint = reportType === 'geographical'
                ? `http://localhost:8000/api/admin/reports/geographical/${searchQuery}`
                : `http://localhost:8000/api/admin/reports/remittance/${searchQuery}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.success) {
                setDocuments(data.documents);
                setDocumentCount(data.count);
                
                // Set map center to first location if available
                if (data.documents.length > 0 && data.documents[0].latitude && data.documents[0].longitude) {
                    setMapCenter({
                        lat: data.documents[0].latitude,
                        lng: data.documents[0].longitude
                    });
                    setMapZoom(12);
                } else if (reportType === 'geographical' && data.location) {
                    setMapCenter({
                        lat: data.location.latitude,
                        lng: data.location.longitude
                    });
                    setMapZoom(15);
                }
            } else {
                throw new Error('Failed to fetch documents');
            }
        } catch (error) {
            console.error('Error fetching documents:', error)