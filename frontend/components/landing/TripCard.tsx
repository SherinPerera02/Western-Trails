import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Milestone, ArrowRight } from "lucide-react";
import { DayTrip } from "@/data/travelData";

interface TripCardProps {
  trip: DayTrip;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#174D44]/30 hover:shadow-md">
      {/* Visual Header */}
      <div className="relative h-52 w-full overflow-hidden bg-[#EAE4D7]">
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute left-3.5 top-3.5">
          <span className="rounded-full bg-[#174D44]/90 px-3 py-1 text-xs font-semibold text-[#FBF9F4] backdrop-blur-md">
            {trip.tag}
          </span>
        </div>

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-[#FBF9F4]">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#EFE9DC]" />
            {trip.duration}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Milestone className="h-3.5 w-3.5 text-[#EFE9DC]" />
            {trip.distance}
          </span>
        </div>
      </div>

      {/* Trip Information */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl font-bold text-[#1E2421] transition-colors group-hover:text-[#174D44]">
          {trip.title}
        </h3>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5C645F]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C86446]" />
          <span>Starts at <strong className="text-[#1E2421] font-semibold">{trip.startLocation}</strong></span>
        </div>

        {/* Route Steps */}
        <div className="mt-4 flex flex-col gap-1.5 rounded-xl bg-[#F8F5EE] p-3 text-xs text-[#3D4540]">
          <span className="font-semibold text-[#174D44] text-[11px] uppercase tracking-wider">
            Curated Route ({trip.placesCount} Stops)
          </span>
          <div className="flex flex-wrap items-center gap-1 text-[13px] font-medium text-[#1E2421]">
            {trip.destinations.map((stop, idx) => (
              <span key={stop} className="inline-flex items-center gap-1">
                <span>{stop}</span>
                {idx < trip.destinations.length - 1 && (
                  <span className="text-[#C86446] font-bold">→</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 border-t border-[#EAE4D7] pt-4">
          <Link
            href={`/planner?trip=${trip.id}`}
            className="flex items-center justify-between rounded-lg bg-[#174D44] px-4 py-2.5 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630]"
          >
            <span>View Trip</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
