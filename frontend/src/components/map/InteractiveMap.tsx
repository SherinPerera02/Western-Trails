"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  RotateCcw,
  Clock,
  MapPin,
  CalendarPlus,
  ArrowRight,
  ImageIcon,
  ShieldAlert,
  Compass,
  Check,
  X,
  Heart,
} from "lucide-react";
import { MapPlace } from "../places/types";
import {
  PANADURA_COORDS,
  RADIUS_25KM_METERS,
  getCategoryStyle,
} from "./mapUtils";
import MapLegend from "./MapLegend";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { useFavorites } from "@/context/FavoritesContext";

/**
 * Creates an inline SVG DivIcon marker with category color, white ring, and drop shadow. (REQ-036: No emoji).
 */
function createPlaceMarkerIcon(
  categories?: string[] | { name: string }[],
  isSelected: boolean = false
): L.DivIcon {
  const style = getCategoryStyle(categories);
  const size = isSelected ? 36 : 28;
  const height = isSelected ? 46 : 36;

  const svg = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${height}px;
      transform: translate(-50%, -100%);
      transition: transform 0.2s ease;
      cursor: pointer;
    ">
      ${
        isSelected
          ? `<div style="
              position: absolute;
              bottom: 0px;
              left: 50%;
              transform: translateX(-50%);
              width: 14px;
              height: 5px;
              background: rgba(0, 0, 0, 0.35);
              border-radius: 50%;
              filter: blur(1px);
            "></div>`
          : ""
      }
      <svg width="${size}" height="${height}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.28));">
        <path d="M14 0C6.26801 0 0 6.26801 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.26801 21.732 0 14 0Z" fill="${style.color}" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="14" cy="14" r="${isSelected ? 6 : 4.5}" fill="#FFFFFF"/>
        ${
          isSelected
            ? `<circle cx="14" cy="14" r="2.5" fill="${style.color}"/>`
            : ""
        }
      </svg>
    </div>
  `;

  return L.divIcon({
    className: "wt-map-marker",
    html: svg,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4],
  });
}

/**
 * Creates the central Panadura Base Station Icon.
 */
function createPanaduraCenterIcon(): L.DivIcon {
  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #174D44;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    ">
      <div style="width: 10px; height: 10px; background: #EAE3D2; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    className: "wt-panadura-center-marker",
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

/**
 * Creates a pulsating radar marker for the user's live position (Near me).
 */
function createUserLocationIcon(): L.DivIcon {
  const html = `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.4);
        animation: wt-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        background: #2563EB;
        border: 2.5px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "wt-user-location-marker",
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface InteractiveMapProps {
  places: MapPlace[];
  selectedPlaceId?: number | null;
  onSelectPlace: (place: MapPlace) => void;
  onAddToPlan: (place: MapPlace) => void;
}

// Map Controller for programmatically moving the viewport
function MapViewController({
  targetCoords,
  zoom,
}: {
  targetCoords: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom ?? 14, { duration: 1.2 });
    }
  }, [targetCoords, zoom, map]);

  return null;
}

// Invalidator to force Leaflet to calculate container dimensions and trigger tile loading
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    // Initial immediate invalidation
    map.invalidateSize();

    // Use ResizeObserver to automatically resize map whenever container dimensions change
    const container = map.getContainer();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && container) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    // Staggered timers to handle layout settling and flex calculations
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 600);
    const t4 = setTimeout(() => map.invalidateSize(), 1200);

    const onResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  return null;
}

export default function InteractiveMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  onAddToPlan,
}: InteractiveMapProps) {
  const { user } = useAuth();
  const { isInPlan } = usePlan();
  const { isFavorite, toggleFavorite } = useFavorites();
  const markerRefs = useRef<Record<number, L.Marker | null>>({});

  // User location state (Never stored in localStorage or database)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Viewport navigation target
  const [viewTarget, setViewTarget] = useState<{
    coords: [number, number];
    zoom: number;
  } | null>(null);

  // Leaflet marker icon fix for Next.js bundler
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // When selectedPlaceId changes from external list selection, pan and open popup
  useEffect(() => {
    if (selectedPlaceId) {
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place && place.latitude && place.longitude) {
        setViewTarget({ coords: [place.latitude, place.longitude], zoom: 15 });
        const marker = markerRefs.current[place.id];
        if (marker) {
          setTimeout(() => {
            marker.openPopup();
          }, 400);
        }
      }
    }
  }, [selectedPlaceId, places]);

  // "Near me" handler using browser Geolocation API (SRS 3.2)
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setViewTarget({ coords, zoom: 14 });
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission was denied. Please enable location access in your browser to view places near you."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Your location information is currently unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Could not retrieve your location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Reset to Panadura 25 km center view
  const handleResetView = () => {
    setViewTarget({ coords: PANADURA_COORDS, zoom: 11 });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full min-h-full w-full overflow-hidden bg-[#E1D7BF]">
      {/* Geolocation Error Alert Banner (if permission denied or error) */}
      {locationError && (
        <div
          role="alert"
          className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-[500] max-w-md rounded-2xl border border-red-200 bg-[#FEF2F2] p-3.5 shadow-lg text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in"
        >
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Location Access</p>
            <p className="mt-0.5 text-red-700">{locationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-red-500 hover:text-red-800 font-bold p-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Action Controls on Map (Near Me & Reset View) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Near Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          aria-label="Find places near me"
          className="flex h-10 items-center gap-2 rounded-xl border border-[#E8E2D5] bg-[#FBF9F4]/95 px-3.5 shadow-md backdrop-blur-md text-xs font-semibold text-[#174D44] hover:bg-white hover:text-[#103630] transition-all disabled:opacity-50"
        >
          <Navigation
            className={`h-4 w-4 ${locating ? "animate-spin text-blue-600" : ""}`}
          />
          <span className="hidden sm:inline">
            {locating ? "Locating..." : "Near me"}
          </span>
        </button>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleResetView}
          aria-label="Reset map view to Panadura"
          className="flex h-10 w-10 sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#E8E2D5] bg-[#FBF9F4]/95 px-3 shadow-md backdrop-blur-md text-xs font-semibold text-[#5C645F] hover:bg-white hover:text-[#1E2421] transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Center Panadura</span>
        </button>
      </div>

      {/* 25 km Boundary Info Chip on Map (Top-Left) */}
      <div className="absolute top-4 left-4 z-[400] hidden sm:flex items-center gap-2 rounded-xl border border-[#E8E2D5] bg-[#FBF9F4]/90 px-3 py-1.5 shadow-xs backdrop-blur-md text-xs font-medium text-[#1E2421]">
        <Compass className="h-3.5 w-3.5 text-[#174D44]" />
        <span>25 km West Coast Radius</span>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={PANADURA_COORDS}
        zoom={11}
        minZoom={9}
        maxZoom={18}
        scrollWheelZoom={false} // Prevents trapping phone scrolling
        style={{ height: "100%", width: "100%", minHeight: "100%", flex: 1 }}
        className="h-full w-full flex-1 z-0"
      >
        <MapResizer />
        <MapViewController
          targetCoords={viewTarget?.coords ?? null}
          zoom={viewTarget?.zoom}
        />

        {/* OpenStreetMap Standard Tiles (No API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 25 km Faint Boundary Circle around Panadura (Requirement 2) */}
        <Circle
          center={PANADURA_COORDS}
          radius={RADIUS_25KM_METERS}
          pathOptions={{
            color: "#174D44",
            fillColor: "#174D44",
            fillOpacity: 0.03,
            weight: 1.5,
            dashArray: "6, 8",
          }}
        />

        {/* Panadura Town Center Hub Marker */}
        <Marker position={PANADURA_COORDS} icon={createPanaduraCenterIcon()}>
          <Popup>
            <div className="p-1 font-sans text-xs">
              <p className="font-serif font-bold text-[#1E2421] text-sm">
                Panadura Base
              </p>
              <p className="text-[#5C645F] mt-0.5">
                Center origin for Western Trails day trips.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Live User Location Marker (Near Me) */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <p className="font-bold text-blue-700">Your Location</p>
                  <p className="text-[#5C645F] text-[11px] mt-0.5">
                    Accurate within ±{Math.round(userLocation.accuracy ?? 15)}m
                  </p>
                </div>
              </Popup>
            </Marker>
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: "#2563EB",
                  fillColor: "#3B82F6",
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* Markers for Places (Requirement 3: One marker per place, custom SVG icon per category) */}
        {places.map((place) => {
          if (!place.latitude || !place.longitude) return null;

          const isSelected = place.id === selectedPlaceId;
          const markerIcon = createPlaceMarkerIcon(
            place.category_names || place.categories,
            isSelected
          );
          const rawImageUrl = place.first_image_url || place.image_url;
          const categories = place.category_names || place.categories?.map((c) => c.name) || [];

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={markerIcon}
              ref={(ref) => {
                markerRefs.current[place.id] = ref;
              }}
              eventHandlers={{
                click: () => onSelectPlace(place),
              }}
            >
              {/* Requirement 4: Marker Popup with details, photo, view link, and add to plan */}
              <Popup className="wt-custom-popup" maxWidth={280}>
                <div className="w-[250px] p-0 font-sans text-[#1E2421]">
                  {/* Photo Thumbnail */}
                  <div className="relative h-28 w-full overflow-hidden rounded-t-xl bg-[#EAE4D7]">
                    {rawImageUrl ? (
                      <Image
                        src={rawImageUrl}
                        alt={place.name}
                        fill
                        sizes="250px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#736B5E]">
                        <ImageIcon className="h-6 w-6 text-[#A89F91]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Distance Badge */}
                    {place.distance_km !== null && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                        <MapPin className="h-2.5 w-2.5 text-[#EAE4D7]" />
                        <span>{place.distance_km} km away</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3 space-y-2">
                    {/* Category Tags */}
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {categories.slice(0, 2).map((catName, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-[#EAE4D7] px-2 py-0.5 text-[10px] font-semibold text-[#174D44]"
                          >
                            {catName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Place Name */}
                    <h3 className="font-serif text-base font-bold text-[#1E2421] leading-snug line-clamp-1">
                      {place.name}
                    </h3>

                    {/* Opening Hours */}
                    {place.opening_hours && (
                      <p className="flex items-center gap-1.5 text-[11px] text-[#5C645F]">
                        <Clock className="h-3 w-3 shrink-0 text-[#736B5E]" />
                        <span className="truncate">{place.opening_hours}</span>
                      </p>
                    )}

                    {/* Actions Row */}
                    <div className="mt-3 flex items-center gap-2 border-t border-[#F0EBE0] pt-2.5">
                      <Link
                        href={`/places/${place.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#174D44] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#103630] transition-colors"
                      >
                        <span>View details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      {/* Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(place.id, place.name)}
                        aria-label={isFavorite(place.id) ? `Remove ${place.name} from favorites` : `Save ${place.name} to favorites`}
                        className="inline-flex items-center justify-center rounded-lg border border-[#D8D2C5] bg-white p-1.5 text-[#1E2421] hover:bg-[#F8F5EE] transition-colors"
                        title={isFavorite(place.id) ? "Saved to favorites" : "Save to favorites"}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 transition-colors ${
                            isFavorite(place.id)
                              ? "fill-[#8C2E1F] text-[#8C2E1F]"
                              : "text-[#5C645F] hover:text-[#8C2E1F]"
                          }`}
                        />
                      </button>

                      {isInPlan(place.id) ? (
                        <button
                          type="button"
                          onClick={() => onAddToPlan(place)}
                          className="group/popup inline-flex items-center justify-center gap-1 rounded-lg border border-[#174D44] bg-[#EFE9DC] px-2 py-1.5 text-xs font-semibold text-[#174D44] hover:border-[#8C2E1F] hover:bg-[#FDF5F3] hover:text-[#8C2E1F] transition-colors"
                          title="Click to remove from plan"
                        >
                          <Check className="h-3.5 w-3.5 text-[#174D44] group-hover/popup:hidden" />
                          <X className="h-3.5 w-3.5 hidden text-[#8C2E1F] group-hover/popup:inline" />
                          <span className="hidden xs:inline group-hover/popup:hidden">In plan</span>
                          <span className="hidden xs:group-hover/popup:inline">Remove</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToPlan(place)}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2 py-1.5 text-xs font-semibold text-[#1E2421] hover:border-[#174D44] hover:bg-[#F8F5EE] transition-colors"
                          title="Add to plan"
                        >
                          <CalendarPlus className="h-3.5 w-3.5 text-[#174D44]" />
                          <span className="hidden xs:inline">Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Requirement 3: Category Color Legend */}
      <MapLegend />
    </div>
  );
}
