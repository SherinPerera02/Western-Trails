"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, MapPin } from "lucide-react";

export interface PlaceDetailMapProps {
  placeName: string;
  latitude: number;
  longitude: number;
  address?: string | null;
}

// Custom Leaflet Pin matching the Western Trails brand palette
const createCustomPin = () => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: #174D44;
        border: 2.5px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #EAE3D2;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function PlaceDetailMapInner({
  placeName,
  latitude,
  longitude,
  address,
}: PlaceDetailMapProps) {
  // Leaflet default icon fix for Next.js bundler
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    (latitude !== 0 || longitude !== 0);

  // Fallback Panadura coordinates if coordinates are invalid
  const centerLat = hasCoords ? latitude : 6.7133;
  const centerLng = hasCoords ? longitude : 79.9026;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`;

  return (
    <section aria-labelledby="map-section-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#174D44]" />
          <h2
            id="map-section-heading"
            className="font-serif text-xl sm:text-2xl font-bold text-[#1E2421]"
          >
            Location on Map
          </h2>
        </div>

        {/* Link to Open in Google Maps */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#174D44] underline underline-offset-4 hover:text-[#103630] transition-colors"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Leaflet Map Card */}
      <div className="relative h-[280px] sm:h-[340px] w-full overflow-hidden rounded-2xl border border-[#E8E2D5] shadow-xs">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[centerLat, centerLng]} icon={createCustomPin()}>
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-serif text-sm font-bold text-[#1E2421]">
                  {placeName}
                </p>
                {address && (
                  <p className="mt-0.5 text-xs text-[#5C645F]">{address}</p>
                )}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#174D44] hover:underline"
                >
                  Directions in Google Maps &rarr;
                </a>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="text-xs text-[#736B5E] italic">
        * Coordinates: {centerLat.toFixed(5)}, {centerLng.toFixed(5)} · Distances along the west coast are approximate.
      </p>
    </section>
  );
}
