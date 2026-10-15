"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";

interface PlaceSearchBoxProps {
  initialValue?: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function PlaceSearchBox({
  initialValue = "",
  onSearchChange,
  placeholder = "Search by place name, activities, or description...",
}: PlaceSearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  const lastEmittedValue = useRef(initialValue);

  // Synchronize internal state when initialValue changes from URL/external
  useEffect(() => {
    setValue(initialValue);
    lastEmittedValue.current = initialValue;
  }, [initialValue]);

  // Debounce search input by 400ms ONLY when value differs from lastEmittedValue
  useEffect(() => {
    if (value === lastEmittedValue.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastEmittedValue.current = value;
      onSearchChangeRef.current(value.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const handleClear = () => {
    setValue("");
    lastEmittedValue.current = "";
    onSearchChangeRef.current("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value !== lastEmittedValue.current) {
        lastEmittedValue.current = value;
        onSearchChangeRef.current(value.trim());
      }
    }
  };

  return (
    <div className="relative w-full">
      <label htmlFor="place-search" className="sr-only">
        Search places
      </label>

      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-[#5C645F]"
          aria-hidden="true"
        />

        <input
          id="place-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#D8D2C5] bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#1E2421] placeholder-[#5C645F]/60 shadow-2xs transition-colors focus:border-[#174D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]/20"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search text"
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-[#5C645F] transition-colors hover:bg-[#F4F0E8] hover:text-[#1E2421] focus-visible:ring-2 focus-visible:ring-[#174D44]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
