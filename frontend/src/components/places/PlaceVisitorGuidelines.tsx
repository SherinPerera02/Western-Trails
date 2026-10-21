import { AlertCircle, Shirt, CameraOff, VolumeX, ShieldCheck } from "lucide-react";

interface PlaceVisitorGuidelinesProps {
  guidelines: string | null;
  categories?: { name: string }[];
}

export default function PlaceVisitorGuidelines({
  guidelines,
  categories = [],
}: PlaceVisitorGuidelinesProps) {
  if (!guidelines || !guidelines.trim()) {
    return null;
  }

  // Detect if place is a religious/sacred or heritage site
  const isReligiousOrHeritage = categories.some((c) => {
    const lower = c.name.toLowerCase();
    return (
      lower.includes("religious") ||
      lower.includes("temple") ||
      lower.includes("shrine") ||
      lower.includes("buddhist") ||
      lower.includes("heritage") ||
      lower.includes("sacred")
    );
  });

  const textLower = guidelines.toLowerCase();
  const mentionsDress =
    textLower.includes("dress") ||
    textLower.includes("cloth") ||
    textLower.includes("modest") ||
    textLower.includes("shoulder") ||
    textLower.includes("knee") ||
    textLower.includes("shoes") ||
    textLower.includes("footwear");

  const mentionsPhoto =
    textLower.includes("photo") ||
    textLower.includes("camera") ||
    textLower.includes("picture");

  return (
    <section
      aria-labelledby="visitor-guidelines-heading"
      className="relative overflow-hidden rounded-2xl border-2 border-[#D97706]/40 bg-[#FFFBEB] p-6 shadow-sm sm:p-8"
    >
      {/* Decorative Warm Saffron Bar on Left */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#D97706]" />

      <div className="pl-2 sm:pl-3">
        {/* Header with Icon & SRS Notice */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDE68A] text-[#92400E]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="visitor-guidelines-heading"
                className="font-serif text-lg sm:text-xl font-bold text-[#78350F]"
              >
                Visitor Guidelines & Cultural Etiquette
              </h2>
              <span className="text-[11px] font-medium text-[#B45309]">
                Important guidelines for respectful visitation (SRS §5.2)
              </span>
            </div>
          </div>

          {isReligiousOrHeritage && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-[#FCD34D] px-3 py-1 text-xs font-semibold text-[#92400E]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sacred Site Etiquette
            </span>
          )}
        </div>

        {/* Primary Guidelines Text */}
        <div className="rounded-xl bg-white/70 border border-[#FDE68A]/60 p-4 text-sm leading-relaxed text-[#78350F]">
          <p className="font-medium whitespace-pre-line">{guidelines}</p>
        </div>

        {/* Quick Cultural Etiquette Reminders for Religious/Heritage Sites */}
        {(isReligiousOrHeritage || mentionsDress || mentionsPhoto) && (
          <div className="mt-4 flex flex-wrap gap-2.5 pt-1">
            {mentionsDress && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF3C7] px-3 py-1.5 text-xs font-medium text-[#92400E]">
                <Shirt className="h-3.5 w-3.5" />
                <span>Modest attire required (cover shoulders and knees)</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF3C7] px-3 py-1.5 text-xs font-medium text-[#92400E]">
              <VolumeX className="h-3.5 w-3.5" />
              <span>Maintain quiet & respectful demeanor</span>
            </span>

            {mentionsPhoto && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF3C7] px-3 py-1.5 text-xs font-medium text-[#92400E]">
                <CameraOff className="h-3.5 w-3.5" />
                <span>Follow photography rules; ask before photographing people</span>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
