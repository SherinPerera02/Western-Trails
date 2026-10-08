import Link from "next/link";
import { Compass } from "lucide-react";

interface AuthLogoProps {
  className?: string;
}

export default function AuthLogo({ className = "" }: AuthLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174D44] text-[#FBF9F4] shadow-xs transition-transform duration-300 group-hover:scale-105">
        <Compass
          className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45"
          strokeWidth={1.8}
        />
      </span>
      <span className="font-serif text-2xl font-bold tracking-tight text-[#1E2421]">
        Western Trails
      </span>
    </Link>
  );
}
