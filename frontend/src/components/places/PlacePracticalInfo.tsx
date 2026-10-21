import {
  Clock,
  Ticket,
  MapPin,
  PhoneCall,
  Compass,
  BookmarkCheck,
} from "lucide-react";
import { PlaceDetail } from "./types";

interface PlacePracticalInfoProps {
  place: PlaceDetail;
}

export default function PlacePracticalInfo({ place }: PlacePracticalInfoProps) {
  // Determine if entrance fee data exists
  const hasFeeInfo =
    place.is_free ||
    (place.entrance_fee !== null &&
      place.entrance_fee !== undefined &&
      !isNaN(Number(place.entrance_fee)));

  const feeDisplay = place.is_free
    ? "Free admission"
    : `Rs. ${Number(place.entrance_fee).toLocaleString()} per person`;

  const hasHours = Boolean(place.opening_hours && place.opening_hours.trim());
  const hasAddress = Boolean(place.address && place.address.trim());
  const hasContact = Boolean(place.contact_info && place.contact_info.trim());
  const hasTravelTips = Boolean(place.travel_tips && place.travel_tips.trim());

  // If literally no practical info is available, hide the block entirely
  if (!hasHours && !hasFeeInfo && !hasAddress && !hasContact && !hasTravelTips) {
    return null;
  }

  return (
    <section
      aria-labelledby="practical-info-heading"
      className="rounded-2xl border border-[#E3DCB] bg-[#F7F4EB] p-6 shadow-2xs sm:p-8"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A8522E] mb-5">
        <BookmarkCheck className="h-4 w-4" />
        <h2 id="practical-info-heading" className="tracking-widest">
          Guidebook Essentials
        </h2>
      </div>

      {/* Guidebook-style asymmetric layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {/* 1. Opening Hours (only if data exists) */}
        {hasHours && (
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAE2D0] text-[#174D44]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#736B5E]">
                Opening Hours
              </h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-[#1E2421]">
                {place.opening_hours}
              </p>
            </div>
          </div>
        )}

        {/* 2. Admission / Entrance Fee (only if data exists) */}
        {hasFeeInfo && (
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAE2D0] text-[#174D44]">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#736B5E]">
                Admission
              </h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-[#1E2421]">
                {feeDisplay}
              </p>
            </div>
          </div>
        )}

        {/* 3. Address / Physical Location (only if data exists) */}
        {hasAddress && (
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAE2D0] text-[#174D44]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#736B5E]">
                Location & Address
              </h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-[#1E2421]">
                {place.address}
              </p>
            </div>
          </div>
        )}

        {/* 4. Contact Details (only if data exists) */}
        {hasContact && (
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAE2D0] text-[#174D44]">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#736B5E]">
                Contact & Inquiries
              </h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-[#1E2421]">
                {place.contact_info}
              </p>
            </div>
          </div>
        )}

        {/* 5. Getting There Tips (only if data exists) */}
        {hasTravelTips && (
          <div className="sm:col-span-2 flex items-start gap-3.5 border-t border-[#EAE3D2] pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAE2D0] text-[#174D44]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#736B5E]">
                Getting There Tips
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#404944]">
                {place.travel_tips}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
