/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { FoodListing } from "../types";
import { MapPin, Info, Check, Navigation } from "lucide-react";

interface MapContainerProps {
  listings: FoodListing[];
  onSelectListing: (listing: FoodListing) => void;
  selectedListing: FoodListing | null;
}

export default function MapContainer({
  listings,
  onSelectListing,
  selectedListing,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const searchMarkerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // External Geocoding search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState("");

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchFeedback("Contacting geocoding registry...");

    try {
      // Force prioritizing Johor context to give instantaneous local results
      const fullQuery = searchQuery.toLowerCase().includes("johor")
        ? searchQuery
        : `${searchQuery}, Johor, Malaysia`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fullQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        setSearchFeedback("");

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          
          // Pan map to found address
          map.flyTo([lat, lon], 15, {
            animate: true,
            duration: 1.5,
          });

          // Insert a beautiful custom geocode pointer and bind responsive tooltip
          const L = (window as any).L;
          if (L) {
            if (searchMarkerRef.current) {
              searchMarkerRef.current.remove();
            }

            const searchIcon = L.divIcon({
              className: "search-result-marker",
              html: `
                <div class="flex items-center justify-center p-1.5 rounded-full bg-rose-600 text-white shadow-xl border-2 border-[#1A1A1A] animate-bounce" style="width: 32px; height: 32px;">
                  📍
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            });

            const shortLabel = place.display_name.split(",")[0] || searchQuery;

            searchMarkerRef.current = L.marker([lat, lon], { icon: searchIcon }).addTo(map);
            searchMarkerRef.current.bindTooltip(
              `<div class="font-sans px-2.5 py-1 font-black text-[#1A1A1A] bg-white border border-[#1A1A1A] text-xs leading-none">
                📍 Searched: ${shortLabel}
               </div>`,
              { direction: "top", offset: [0, -10], permanent: true }
            ).openTooltip();
          }
        }
      } else {
        setSearchFeedback("Not found. Try 'Batu Pahat' or 'Parit Raja'.");
      }
    } catch (err) {
      console.error("OSM Geocoding Request Error: ", err);
      setSearchFeedback("Network busy. Try searching again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Dynamic injection of Leaflet JS and CSS to avoid version clashes with React 19
  useEffect(() => {
    if (window.hasOwnProperty("L")) {
      setLeafletLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    script.onerror = () => {
      setLoadError(true);
    };
    document.body.appendChild(script);

    return () => {
      // Keep them cached since they are useful across navigations
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Center map around UTHM / Parit Raja area
    const centerLat = 1.8596;
    const centerLng = 103.0833;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
      });

      // Add high quality thematic eco-cartography (Stamen/CartoDB Voyager matches beautifully)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Do not destroy on every update to keep state, unless unmounting
    };
  }, [leafletLoaded]);

  // Sync Markers
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;

    // Clear old markers that are no longer in the listings
    Object.keys(markersRef.current).forEach((id) => {
      if (!listings.some((l) => l.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Custom Leaflet Icons for different categories
    const createCustomIcon = (category: string, isSelected: boolean) => {
      const color = isSelected ? "#ea580c" : "#15803d";
      const size = isSelected ? "32px" : "24px";
      const bg = isSelected ? "bg-[#ea580c]" : "bg-[#15803d]";
      
      return L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="flex items-center justify-center p-1.5 rounded-full ${bg} text-[#FAF9F6] shadow-md border-2 border-[#1A1A1A] transition-all transform hover:scale-110" style="width: ${size}; height: ${size};">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        `,
        iconSize: isSelected ? [32, 32] : [24, 24],
        iconAnchor: isSelected ? [16, 32] : [12, 24],
      });
    };

    // Add or update markers from listings
    listings.forEach((listing) => {
      const isSelected = selectedListing?.id === listing.id;
      const latLng = [listing.lat, listing.lng];

      if (markersRef.current[listing.id]) {
        // Update marker icon
        markersRef.current[listing.id].setIcon(createCustomIcon(listing.category, isSelected));
      } else {
        // Create new marker
        const marker = L.marker(latLng, {
          icon: createCustomIcon(listing.category, isSelected),
        }).addTo(map);

        marker.on("click", () => {
          onSelectListing(listing);
        });

        // Add visual tooltip
        marker.bindTooltip(
          `<div class="font-sans px-2 py-1 font-bold text-[#1A1A1A] bg-[#FAF9F6] border border-[#1A1A1A] text-xs">
            ${listing.restaurantName} <br/>
            <span class="text-[#ea580c] font-black">${listing.discountedPrice === 0 ? "FREE" : `RM ${listing.discountedPrice.toFixed(2)}`}</span>
           </div>`,
          { direction: "top", offset: [0, -10] }
        );

        markersRef.current[listing.id] = marker;
      }

      // If selected outer, fly to it
      if (isSelected) {
        map.flyTo(latLng, 15, {
          animate: true,
          duration: 1.5,
        });
      }
    });
  }, [listings, leafletLoaded, selectedListing]);

  return (
    <div className="relative rounded-none overflow-hidden border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] h-full bg-[#FAF9F6] flex flex-col">
      {/* Search overlay & Stats */}
      <div className="absolute top-4 left-4 z-[999] bg-[#FAF9F6] px-4 py-3 border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] w-[280px] sm:w-[320px] rounded-none">
        <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-[#ea580c] animate-pulse" />
          Active Eco-Rescue Hotspots
        </h4>
        <p className="text-[10px] text-slate-700 mt-1 font-semibold leading-relaxed">
          Showing real-time excess food listings in <strong>Parit Raja & Batu Pahat</strong>, Johor.
        </p>

        {/* Real Geocoding Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="mt-3 flex gap-1 bg-white">
          <input
            type="text"
            placeholder="Search address (e.g. Parit Raja)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-[11px] px-2 py-1.5 border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-semibold"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#1A1A1A] text-[#FAF9F6] border-l-0 border-2 border-[#1A1A1A] hover:bg-[#ea580c] hover:text-white px-3 py-1 text-[10px] font-bold uppercase transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? "..." : "Find"}
          </button>
        </form>

        {searchFeedback && (
          <p className="text-[9px] text-[#ea580c] font-mono font-bold mt-1.5 uppercase leading-none">
            {searchFeedback}
          </p>
        )}

        <div className="flex gap-2.5 mt-2.5 pt-2 border-t-2 border-[#1A1A1A] font-mono text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wide">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803d] border border-[#1A1A1A] inline-block"></span>
            Surplus Goods
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] border border-[#1A1A1A] inline-block"></span>
            Selections
          </span>
        </div>
      </div>

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#1A1A1A]">
          <Info className="w-12 h-12 text-[#ea580c] mb-2" />
          <p className="text-sm font-black uppercase">Could not load interactive mapping system.</p>
          <p className="text-xs font-semibold">Please verify your internet connection.</p>
        </div>
      ) : !leafletLoaded ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] animate-pulse">Initializing Ecobite Cartographic Satellite...</p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />
      )}

      {/* Slide-Up selected listing indicator */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 z-[999] bg-[#FAF9F6] p-4 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-none flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedListing.imageUrl}
              alt={selectedListing.title}
              className="w-14 h-14 object-cover border-2 border-[#1A1A1A] rounded-none"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[9px] bg-[#E8E6E1] border border-[#1A1A1A] text-[#1A1A1A] px-2 py-0.5 font-bold uppercase font-mono">
                {selectedListing.restaurantName}
              </span>
              <h5 className="font-display font-black text-sm text-[#1A1A1A] uppercase italic mt-1 line-clamp-1">{selectedListing.title}</h5>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black text-[#1A1A1A]">
                  {selectedListing.discountedPrice === 0 ? "FREE" : `RM ${selectedListing.discountedPrice.toFixed(2)}`}
                </span>
                {selectedListing.originalPrice > 0 && (
                  <span className="text-[10px] line-through text-slate-400 font-bold">
                    RM {selectedListing.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-[10px] text-[#15803d] font-bold uppercase tracking-wider">
                  🌱 Saves {selectedListing.co2Saved}kg CO₂e
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectListing(selectedListing)}
            className="art-btn-orange font-bold uppercase text-[10px] tracking-widest py-2 px-3 shrink-0"
          >
            Claim Rescue
          </button>
        </div>
      )}
    </div>
  );
}
