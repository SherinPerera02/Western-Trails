"use client";

import { AlertTriangle } from "lucide-react";

interface PlannerHeavyNoticeProps {
  stopsCount: number;
  travelMinutes: number;
}

export default function PlannerHeavyNotice({
  stopsCount,
  travelMinutes,
}: PlannerHeavyNoticeProps) {
  const isHeavyStops = stopsCount > 6;
  const isHeavyTime = travelMinutes > 120;

  if (!isHeavyStops && !isHeavyTime) {
    return null;
  }

  const hours = Math.floor(travelMinutes / 60);
  const remainingMins = travelMinutes % 60;
  const timeFormatted =
    hours > 0 ? `${hours}h ${remainingMins}m` : `${travelMinutes} min`;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-[#E8C2A0] bg-[#FDF7F2] p-4 text-xs text-[#8C4A28] leading-relaxed shadow-2xs"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C86446] text-white mt-0.5">
        <AlertTriangle className="h-3.5 w-3.5" />
      </div>
      <div>
        <span className="font-semibold text-[#8C3A15]">Ambitious day trip: </span>
        <span>
          Your plan has {stopsCount} stops and roughly {timeFormatted} of road
          travel. Consider spreading these places across two days so you have
          plenty of time to explore without rushing.
        </span>
      </div>
    </div>
  );
}
