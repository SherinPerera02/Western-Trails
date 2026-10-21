"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PlanItemDetail } from "@/types/planner";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface PlannerMiniMapProps {
  items: PlanItemDetail[];
}

const PANADURA_DEFAULT: [number, number] = [6.7133, 79.9026];

const createNumberedPin = (seq: number, unavailable: boolean = false) => {
  const bg = unavailable ? "#8C8476" : "#174D44";
  return L.divIcon({
    className: "planner-numbered-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background: ${bg};
        color: #FFFFFF;
        font-family: var(--font-sans, system-ui, sans-serif);
        font-weight: 700;
        font-size: 13px;
        border: 2.5px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.25);
      ">
        ${seq}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

function MapBoundsUpdater({ coords }: { coords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coords.length === 0) {
      map.setView(PANADURA_DEFAULT, 11);
      return;
    }
    if (coords.length === 1) {
      map.setView(coords[0], 13);
      return;
    }
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
  }, [map, coords]);

  return null;
}

export default function PlannerMiniMapInner({ items }: PlannerMiniMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Filter items with valid coordinates
  const validStops = useMemo(() => {
    return items
      .map((item, index) => {
        const lat = item.attraction?.latitude;
        const lng = item.attraction?.longitude;
        if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
          return {
            item,
            seq: index + 1,
            coords: [lat, lng] as [number, number],
          };
        }
        return null;
      })
      .filter((s): s is { item: PlanItemDetail; seq: number; coords: [number, number] } => s !== null);
  }, [items]);

  const polylineCoords = useMemo(
    () => validStops.map((s) => s.coords),
    [validStops]
  );

  const initialCenter =
    validStops.length > 0 ? validStops[0].coords : PANADURA_DEFAULT;

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-[#E8E2D5] bg-[#EAE4D7] shadow-xs">
      <MapContainer
        center={initialCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        <MapBoundsUpdater coords={polylineCoords} />

        {/* Dashed route connection line (straight lines between stops) */}
        {polylineCoords.length >= 2 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: "#174D44",
              weight: 3,
              dashArray: "6, 8",
              opacity: 0.85,
            }}
          />
        )}

        {/* Markers for stops */}
        {validStops.map(({ item, seq, coords }) => (
          <Marker
            key={item.id}
            position={coords}
            icon={createNumberedPin(seq, item.unavailable)}
          >
            <Popup className="planner-map-popup">
              <div className="p-1 max-w-[200px]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#174D44]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#174D44] text-[10px] text-white">
                    {seq}
                  </span>
                  <span>Stop #{seq}</span>
                </div>
                <h4 className="mt-1 font-serif text-sm font-bold text-[#1E2421]">
                  {item.attraction?.name || "Attraction"}
                </h4>
                {item.opening_hours && (
                  <p className="mt-0.5 text-xs text-[#5C645F]">
                    {item.opening_hours}
                  </p>
                )}
                {item.start_time && (
                  <p className="mt-0.5 text-xs font-medium text-[#174D44]">
                    Arrive around {item.start_time.slice(0, 5)}
                  </p>
                )}
                <div className="mt-2 pt-2 border-t border-[#EAE4D7]">
                  <Link
                    href={`/places/${item.attraction_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#174D44] hover:underline"
                  >
                    <span>View details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating map caption badge */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 rounded-lg bg-[#FBF9F4]/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-[#174D44] border border-[#E8E2D5] shadow-xs">
        <MapPin className="h-3.5 w-3.5" />
        <span>
          {validStops.length} stop{validStops.length !== 1 ? "s" : ""} on map
        </span>
      </div>
    </div>
  );
}
