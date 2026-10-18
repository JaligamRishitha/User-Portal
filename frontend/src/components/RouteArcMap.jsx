import { useEffect, useState } from 'react';
import { GoogleMap, MarkerF, OverlayViewF, OverlayView, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import Icon from './Icon';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Google's Geocoding API needs billing enabled, so UK postcodes are resolved
// through postcodes.io instead - free, keyless, and one request for both ends.
const POSTCODES_API = 'https://api.postcodes.io/postcodes';

// How far the arc bows away from the straight line, as a fraction of the
// distance between the two points. 0 is a straight line, 0.5 is a tall arc.
const ARC_CURVATURE = 0.28;
const ARC_SEGMENTS = 96;

const normalise = (postcode) => postcode.replace(/\s+/g, '').toUpperCase();

/**
 * Sample a quadratic bezier from `start` to `end` whose control point sits
 * perpendicular to their midpoint, giving a single clean elliptical arc.
 * Over a few kilometres lat/lng can be treated as a flat plane.
 */
const buildArc = (start, end) => {
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const span = Math.sqrt(dLat * dLat + dLng * dLng);

    if (span === 0) return [start, end];

    // Perpendicular to the chord, offset from its midpoint.
    const control = [
        (lat1 + lat2) / 2 + (-dLng / span) * span * ARC_CURVATURE,
        (lng1 + lng2) / 2 + (dLat / span) * span * ARC_CURVATURE,
    ];

    const points = [];
    for (let i = 0; i <= ARC_SEGMENTS; i += 1) {
        const t = i / ARC_SEGMENTS;
        const inv = 1 - t;
        points.push([
            inv * inv * lat1 + 2 * inv * t * control[0] + t * t * lat2,
            inv * inv * lng1 + 2 * inv * t * control[1] + t * t * lng2,
        ]);
    }
    return points;
};

const toLatLng = ([lat, lng]) => ({ lat, lng });

const pinStyle = (color) => ({
    background: color,
    color: '#fff',
    font: '600 11px/1 system-ui,sans-serif',
    padding: '5px 9px',
    borderRadius: '999px',
    border: '2px solid #fff',
    boxShadow: '0 1px 4px rgba(0,0,0,.35)',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%,-170%)',
});

// Kept close to the admin Reports Map embed: plain Google roadmap with
// zoom and fullscreen, no extra chrome.
const mapOptions = {
    scrollwheel: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
};

const RouteArcMap = ({ oldPostcode, newPostcode, height = 500 }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });
    const [route, setRoute] = useState(null);
    const [failure, setFailure] = useState(null);

    const hasBothPostcodes = Boolean(oldPostcode && newPostcode);
    // Tagging results with the pair they belong to means a postcode change
    // invalidates them without needing a synchronous reset in the effect.
    const routeKey = `${oldPostcode || ''}|${newPostcode || ''}`;

    // 1. Resolve both postcodes in a single bulk request.
    useEffect(() => {
        if (!hasBothPostcodes) return undefined;

        let cancelled = false;

        (async () => {
            try {
                const response = await fetch(POSTCODES_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postcodes: [oldPostcode, newPostcode] }),
                });
                const body = await response.json();
                const results = body?.result || [];

                const find = (postcode) =>
                    results.find(
                        (entry) =>
                            entry.query && normalise(entry.query) === normalise(postcode)
                    )?.result;

                const from = find(oldPostcode);
                const to = find(newPostcode);

                if (cancelled) return;

                if (!from || !to) {
                    setFailure({ key: routeKey, kind: 'unresolved' });
                    return;
                }

                setRoute({
                    key: routeKey,
                    from: [from.latitude, from.longitude],
                    to: [to.latitude, to.longitude],
                });
            } catch {
                if (!cancelled) setFailure({ key: routeKey, kind: 'error' });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [hasBothPostcodes, oldPostcode, newPostcode, routeKey]);

    const resolved = route?.key === routeKey ? route : null;

    let status = 'loading';
    if (!hasBothPostcodes) status = 'missing';
    else if (resolved) status = 'ready';
    else if (failure?.key === routeKey) status = failure.kind;

    if (status === 'ready' && loadError) status = 'error';
    else if (status === 'ready' && !isLoaded) status = 'loading';

    // 2. Draw the arc on a Google map once coordinates and the script are in.
    if (status === 'ready') {
        const arc = buildArc(resolved.from, resolved.to).map(toLatLng);
        const endpoints = [
            [resolved.from, '#dc2626', `Old · ${oldPostcode}`],
            [resolved.to, '#16a34a', `New · ${newPostcode}`],
        ];

        const fitToArc = (map) => {
            const bounds = new window.google.maps.LatLngBounds();
            arc.forEach((point) => bounds.extend(point));
            map.fitBounds(bounds, 48);
        };

        return (
            <div className="rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
                <GoogleMap
                    mapContainerStyle={{ height: `${height}px`, width: '100%' }}
                    options={mapOptions}
                    onLoad={fitToArc}
                >
                    <PolylineF
                        path={arc}
                        options={{ strokeColor: '#ea580c', strokeWeight: 3, strokeOpacity: 0.95 }}
                    />
                    {endpoints.map(([position, color, label]) => (
                        <MarkerF
                            key={label}
                            position={toLatLng(position)}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 6,
                                fillColor: color,
                                fillOpacity: 1,
                                strokeColor: '#fff',
                                strokeWeight: 2,
                            }}
                        />
                    ))}
                    {endpoints.map(([position, color, label]) => (
                        <OverlayViewF
                            key={`${label}-pin`}
                            position={toLatLng(position)}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div style={pinStyle(color)}>{label}</div>
                        </OverlayViewF>
                    ))}
                </GoogleMap>
            </div>
        );
    }

    const message = {
        loading: 'Loading route…',
        missing: 'Map unavailable',
        unresolved: 'Could not locate those postcodes',
        error: 'Map unavailable',
    }[status];

    return (
        <div className="text-center py-12 bg-zinc-100 rounded-lg">
            <Icon
                icon={status === 'loading' ? 'lucide:loader-2' : 'lucide:map-off'}
                className={`text-4xl text-zinc-400 mx-auto mb-2 ${
                    status === 'loading' ? 'animate-spin' : ''
                }`}
            />
            <p className="text-zinc-500">{message}</p>
        </div>
    );
};

export default RouteArcMap;
