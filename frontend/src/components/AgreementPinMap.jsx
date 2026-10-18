import { useEffect, useMemo, useRef, useState } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const TILE_SIZE = 256;
const MIN_ZOOM = 5;
const MAX_ZOOM = 16;

// Web Mercator, the projection the Google embed uses: lat/lng -> world pixels at zoom 0
const toWorld = (lat, lng) => {
    const sin = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
    return {
        x: TILE_SIZE * (0.5 + lng / 360),
        y: TILE_SIZE * (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)),
    };
};

const fromWorld = ({ x, y }) => ({
    lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / TILE_SIZE))) * 180) / Math.PI,
    lng: (x / TILE_SIZE - 0.5) * 360,
});

const formatPostcode = (pc = '') => {
    const clean = pc.replace(/\s+/g, '').toUpperCase();
    return clean.length > 3 ? `${clean.slice(0, -3)} ${clean.slice(-3)}` : clean;
};

// Largest zoom at which every pin fits inside the map, leaving room for the cards
const fitView = (points, size, fallback) => {
    if (!points.length || !size.width) return { center: fallback, zoom: 11 };
    const world = points.map((p) => toWorld(p.lat, p.lng));
    const minX = Math.min(...world.map((w) => w.x));
    const maxX = Math.max(...world.map((w) => w.x));
    const minY = Math.min(...world.map((w) => w.y));
    const maxY = Math.max(...world.map((w) => w.y));
    const center = fromWorld({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
    if (points.length === 1) return { center, zoom: 13 };

    let zoom = MAX_ZOOM - 2;
    while (zoom > MIN_ZOOM) {
        const scale = 2 ** zoom;
        if ((maxX - minX) * scale <= size.width - 160 && (maxY - minY) * scale <= size.height - 200) break;
        zoom -= 1;
    }
    return { center, zoom };
};

const LinkIcon = () => (
    <svg className="w-4 h-4 text-zinc-400 group-hover:text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const DocumentLink = ({ label, detail, url, apiBase }) => (
    <button
        onClick={() => window.open(`${apiBase}${url}`, '_blank')}
        className="w-full text-left px-3 py-2.5 hover:bg-orange-50 border-t border-zinc-100 transition-colors group flex items-center gap-2"
    >
        <span className="flex-1 min-w-0 truncate">
            <span className="text-xs font-semibold text-orange-600 group-hover:text-orange-700">{label}</span>
            {detail && <span className="ml-1.5 text-[11px] text-zinc-400">({detail})</span>}
        </span>
        <LinkIcon />
    </button>
);

/**
 * Google map with one pin per postcode. Hovering (or clicking) a pin shows a
 * card per grantor at that postcode: name, postcode, the User Agreement and
 * the grantor's latest Remittance Report.
 *
 * The embed iframe can't take markers, so the map is held still and the pins
 * are drawn over it at their projected positions; panning and zooming are
 * done with our own controls so the pins stay in place.
 */
const AgreementPinMap = ({ documents, apiBase, fallbackCenter }) => {
    const containerRef = useRef(null);
    const dragRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [view, setView] = useState({ center: { lat: fallbackCenter.latitude, lng: fallbackCenter.longitude }, zoom: 11 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(null);
    const [pinned, setPinned] = useState(null);
    const [cardHeight, setCardHeight] = useState(0);
    // Measured so the open card can be kept inside the map
    const measureCard = (el) => {
        if (el && el.offsetHeight !== cardHeight) setCardHeight(el.offsetHeight);
    };

    // One location per postcode, one entry per grantor at that postcode
    const locations = useMemo(() => {
        const byPostcode = new Map();
        documents
            .filter((doc) => doc.latitude && doc.longitude)
            .forEach((doc) => {
                if (!byPostcode.has(doc.postcode)) {
                    byPostcode.set(doc.postcode, { postcode: doc.postcode, lat: doc.latitude, lng: doc.longitude, grantors: [] });
                }
                const loc = byPostcode.get(doc.postcode);
                const key = `${doc.vendor_id || ''}|${doc.full_name || ''}`;
                if (!loc.grantors.some((g) => g.key === key)) {
                    loc.grantors.push({
                        key,
                        vendorId: doc.vendor_id,
                        name: doc.full_name || 'Unknown grantor',
                        agreementUrl: doc.document_url,
                        remittance: doc.latest_remittance,
                    });
                }
            });
        return [...byPostcode.values()];
    }, [documents]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;
        const observer = new ResizeObserver(([entry]) => {
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Re-centre whenever the search results (or the map size) change
    const [fittedFor, setFittedFor] = useState(null);
    if (!fittedFor || fittedFor.locations !== locations || fittedFor.width !== size.width
        || fittedFor.height !== size.height || fittedFor.fallback !== fallbackCenter) {
        setFittedFor({ locations, width: size.width, height: size.height, fallback: fallbackCenter });
        setView(fitView(locations, size, { lat: fallbackCenter.latitude, lng: fallbackCenter.longitude }));
        setPinned(null);
        setHovered(null);
    }

    const scale = 2 ** view.zoom;
    const centerWorld = toWorld(view.center.lat, view.center.lng);
    const project = (lat, lng) => {
        const w = toWorld(lat, lng);
        return {
            x: (w.x - centerWorld.x) * scale + size.width / 2,
            y: (w.y - centerWorld.y) * scale + size.height / 2,
        };
    };

    const zoomBy = (delta) => setView((v) => ({ ...v, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom + delta)) }));

    // Drag to pan: move the map and pins together, then reload the embed at the new centre
    const onPointerDown = (e) => {
        if (e.button !== 0 || e.target.closest('[data-map-ui]')) return;
        dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        setDragOffset({ x: dx, y: dy });
    };
    const onPointerUp = () => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag) return;
        if (drag.moved) {
            setView((v) => {
                const c = toWorld(v.center.lat, v.center.lng);
                const s = 2 ** v.zoom;
                return { ...v, center: fromWorld({ x: c.x - dragOffset.x / s, y: c.y - dragOffset.y / s }) };
            });
        } else {
            setPinned(null);
        }
        setDragOffset({ x: 0, y: 0 });
    };

    const grantorCount = locations.reduce((n, loc) => n + loc.grantors.length, 0);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
            style={{ minHeight: '600px' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            <div className="absolute inset-0" style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}>
                <iframe
                    title="Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: 'none' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${view.center.lat},${view.center.lng}&zoom=${view.zoom}`}
                />

                {size.width > 0 && locations.map((loc) => {
                    const { x, y } = project(loc.lat, loc.lng);
                    const open = hovered === loc.postcode || pinned === loc.postcode;
                    // Open the card to the left when the pin is near the right edge
                    const cardOnLeft = x > size.width - 300;
                    // Sit the card just above the pin, but slide it up/down so it never runs off the map
                    const edge = 8;
                    const cardTop = Math.max(edge - y, Math.min(-48, size.height - edge - y - cardHeight));
                    return (
                        <div
                            key={loc.postcode}
                            data-map-ui
                            className="absolute"
                            style={{ left: x, top: y, zIndex: open ? 30 : 10 }}
                            onMouseEnter={() => setHovered(loc.postcode)}
                            onMouseLeave={() => setHovered((h) => (h === loc.postcode ? null : h))}
                        >
                            <button
                                className="absolute -translate-x-1/2 -translate-y-full"
                                onClick={() => setPinned((p) => (p === loc.postcode ? null : loc.postcode))}
                                aria-label={`Grantors at ${formatPostcode(loc.postcode)}`}
                            >
                                <svg className={`w-10 h-10 drop-shadow-lg transition-transform ${open ? 'text-orange-600 scale-110' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {loc.grantors.length > 1 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                        {loc.grantors.length}
                                    </span>
                                )}
                            </button>

                            {open && (
                                // Padding bridges the gap to the pin so the card stays open while the mouse moves onto it
                                <div className={`absolute ${cardOnLeft ? 'right-0 pr-6' : 'left-0 pl-6'}`} style={{ top: cardTop }}>
                                    <div
                                        ref={measureCard}
                                        style={{ maxHeight: Math.min(320, size.height - 2 * edge) }}
                                        className="w-64 overflow-y-auto bg-white/95 backdrop-blur rounded-xl shadow-2xl border-2 border-blue-500 animate-fade-in cursor-default"
                                    >
                                        {loc.grantors.map((g, i) => (
                                            <div key={g.key} className={i > 0 ? 'border-t-2 border-blue-100' : ''}>
                                                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm font-bold text-zinc-900 truncate">{g.name}</h3>
                                                            <p className="text-xs text-zinc-600">
                                                                {formatPostcode(loc.postcode)}
                                                                {g.vendorId && <span className="ml-1.5 font-semibold text-orange-600">{g.vendorId}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DocumentLink label="User Agreement" url={g.agreementUrl} apiBase={apiBase} />
                                                {g.remittance ? (
                                                    <DocumentLink
                                                        label="Remittance Report"
                                                        detail={g.remittance.fiscal_year}
                                                        url={g.remittance.document_url}
                                                        apiBase={apiBase}
                                                    />
                                                ) : (
                                                    <p className="px-3 py-2.5 border-t border-zinc-100 text-xs text-zinc-400">No remittance report</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Zoom controls */}
            <div data-map-ui className="absolute bottom-6 right-4 z-40 flex flex-col bg-white rounded-lg shadow-lg border border-zinc-200 overflow-hidden">
                <button onClick={() => zoomBy(1)} className="w-9 h-9 text-lg font-semibold text-zinc-700 hover:bg-zinc-100" aria-label="Zoom in">+</button>
                <button onClick={() => zoomBy(-1)} className="w-9 h-9 text-lg font-semibold text-zinc-700 hover:bg-zinc-100 border-t border-zinc-200" aria-label="Zoom out">−</button>
                {locations.length > 0 && (
                    <button
                        onClick={() => setView(fitView(locations, size, view.center))}
                        className="w-9 h-9 text-zinc-700 hover:bg-zinc-100 border-t border-zinc-200 flex items-center justify-center"
                        aria-label="Show all pins"
                        title="Show all pins"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                        </svg>
                    </button>
                )}
            </div>

            {locations.length > 0 && (
                <div data-map-ui className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-sm font-semibold text-zinc-700 border-2 border-blue-400">
                    📍 {locations.length} location{locations.length !== 1 ? 's' : ''} · {grantorCount} grantor{grantorCount !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default AgreementPinMap;
