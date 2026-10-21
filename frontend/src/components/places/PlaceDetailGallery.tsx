"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Compass,
} from "lucide-react";
import { PlaceImage } from "./types";

interface PlaceDetailGalleryProps {
  placeName: string;
  images: PlaceImage[];
}

export default function PlaceDetailGallery({
  placeName,
  images,
}: PlaceDetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  const validImages = images.filter((_, idx) => !imageErrorMap[idx]);
  const hasImages = validImages.length > 0;
  const currentImage = hasImages ? validImages[selectedIndex] ?? validImages[0] : null;

  const handlePrev = useCallback(() => {
    if (!hasImages) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [hasImages, validImages.length]);

  const handleNext = useCallback(() => {
    if (!hasImages) return;
    setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [hasImages, validImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen, handlePrev, handleNext]);

  // If no images exist, show warm guidebook placeholder
  if (!hasImages) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#F4EFE6] py-16 px-6 text-center shadow-xs sm:py-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAE3D2] text-[#8C7E6C] mb-4">
          <Camera className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[#1E2421]">
          {placeName}
        </h3>
        <p className="mt-1.5 text-sm text-[#736B5E] max-w-md mx-auto">
          Photography for this location is being gathered by our local contributors.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#174D44]">
          <Compass className="h-3.5 w-3.5" />
          <span>Western Trails Field Archive</span>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Photo gallery" className="w-full">
      {/* 1. Main Large Hero Image Container */}
      <div className="group relative h-[300px] w-full overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#1E2421] shadow-xs sm:h-[420px] md:h-[480px]">
        {currentImage && (
          <Image
            src={currentImage.url}
            alt={currentImage.caption || `${placeName} - Photo ${selectedIndex + 1}`}
            fill
            priority
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
            onError={() => {
              setImageErrorMap((prev) => ({ ...prev, [selectedIndex]: true }));
            }}
          />
        )}

        {/* Gentle Vignette Gradient */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Top-Right: Enlarge Action Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Open photo lightbox"
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-black/75 hover:scale-105 shadow-sm"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">View Gallery</span>
          <span>
            {selectedIndex + 1} / {validImages.length}
          </span>
        </button>

        {/* Bottom Caption Overlay */}
        {currentImage?.caption && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-16 sm:left-6 sm:bottom-6">
            <p className="inline-block max-w-2xl rounded-lg bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#FBF9F4] shadow-xs">
              {currentImage.caption}
            </p>
          </div>
        )}

        {/* Left & Right Click Navigation On Large View (if > 1 image) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 sm:left-4 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 sm:right-4 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}
      </div>

      {/* 2. Thumbnail Strip Underneath (if > 1 photo) */}
      {validImages.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id ?? idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all sm:h-20 sm:w-28 ${
                  isSelected
                    ? "border-[#174D44] ring-2 ring-[#174D44]/30 scale-102"
                    : "border-[#E8E2D5] opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || `${placeName} thumbnail ${idx + 1}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Accessible Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo lightbox for ${placeName}`}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/92 backdrop-blur-md p-3 sm:p-6 text-white animate-in fade-in duration-200"
        >
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-serif text-base sm:text-lg font-bold text-[#FBF9F4]">
                {placeName}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/90">
                {selectedIndex + 1} of {validImages.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-white/50">
                Press Esc or Arrows
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close lightbox"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex flex-1 items-center justify-center p-2 sm:p-4 min-h-0">
            {currentImage && (
              <div className="relative h-full w-full max-h-[75vh] max-w-5xl">
                <Image
                  src={currentImage.url}
                  alt={currentImage.caption || `${placeName} photo ${selectedIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {/* Navigation buttons inside Lightbox */}
            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo in lightbox"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo in lightbox"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer & Caption */}
          <div className="border-t border-white/10 pt-3">
            {currentImage?.caption && (
              <p className="text-center text-xs sm:text-sm text-[#E0DACE] mb-3 max-w-2xl mx-auto">
                {currentImage.caption}
              </p>
            )}

            {/* Lightbox Mini Thumbnails Strip */}
            {validImages.length > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto py-1">
                {validImages.map((img, idx) => (
                  <button
                    key={img.id ?? idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    aria-label={`Jump to photo ${idx + 1}`}
                    className={`relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-md border transition-all ${
                      idx === selectedIndex
                        ? "border-[#FBF9F4] ring-2 ring-white/50"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
