"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError, getBackendFieldErrors } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";
import AuthLogo from "@/components/auth/AuthLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // 1. Client-side Zod validation
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errs: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!errs[fieldName]) {
          errs[fieldName] = issue.message;
        }
      }
      setFieldErrors(errs);
      return;
    }

    // 2. Submit to backend API & capture backend validation
    setSubmitting(true);
    try {
      const user = await login(validation.data.email, validation.data.password);
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      const backendErrors = getBackendFieldErrors(err);
      if (Object.keys(backendErrors).length > 0) {
        setFieldErrors(backendErrors);
      }
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-screen bg-[#FBF9F4]">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* The Login Side */}
        <section
          aria-labelledby="login-heading"
          className="col-span-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:col-span-6 lg:px-16 xl:col-span-5 xl:px-20"
        >
          <div className="mx-auto w-full max-w-md">
            {/* Travel-style Logo Treatment */}
            <div className="mb-8">
              <AuthLogo />
            </div>

            {/* Header / Intro */}
            <div className="mb-8">
              <h1
                id="login-heading"
                className="font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl"
              >
                Welcome Back!
              </h1>
              <p className="mt-2 text-base text-[#5C645F]">
                Sign in to continue your journey.
              </p>
            </div>

            {/* Inline Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-[#F3C5BC] bg-[#FDF2F0] p-4 text-sm text-[#8C2E1F]"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#C86446]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#1E2421]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.email;
                        return updated;
                      });
                    }
                  }}
                  placeholder="Enter your email address"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`w-full rounded-lg bg-white px-4 py-3 text-base text-[#1E2421] placeholder-[#5C645F]/55 shadow-xs transition-colors focus:outline-none ${
                    fieldErrors.email
                      ? "border border-[#C86446] ring-2 ring-[#C86446]/20 focus:border-[#C86446]"
                      : "border border-[#D8D2C5] focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/15"
                  }`}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-2 text-xs font-medium text-[#8C2E1F]">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#1E2421]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.password;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Enter your password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                    className={`w-full rounded-lg bg-white px-4 py-3 pr-12 text-base text-[#1E2421] placeholder-[#5C645F]/55 shadow-xs transition-colors focus:outline-none ${
                      fieldErrors.password
                        ? "border border-[#C86446] ring-2 ring-[#C86446]/20 focus:border-[#C86446]"
                        : "border border-[#D8D2C5] focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#5C645F] transition-colors hover:text-[#1E2421]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.8} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="mt-2 text-xs font-medium text-[#8C2E1F]">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label
                  htmlFor="remember-me"
                  className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-[#5C645F] transition-colors hover:text-[#1E2421]"
                >
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#C5BFB0] text-[#174D44] accent-[#174D44] focus:ring-2 focus:ring-[#174D44]/20 focus:ring-offset-0"
                  />
                  <span>Remember Me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#174D44] transition-colors hover:text-[#103630] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Large full-width primary button: Sign In */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#174D44] px-4 py-3.5 text-base font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#174D44] focus:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2.5">
                    <svg
                      className="h-4 w-4 animate-spin text-[#FBF9F4]"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing In…</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Footer / Create an account link */}
            <div className="mt-8 text-center text-sm text-[#5C645F]">
              <span>Don&apos;t have an account? </span>
              <Link
                href="/register"
                className="font-semibold text-[#174D44] underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>

        {/* Travel Visual Showcase Side (Desktop) */}
        <section
          aria-label="Travel Showcase"
          className="relative hidden lg:col-span-6 lg:flex xl:col-span-7 flex-col justify-between overflow-hidden bg-[#151E1A] p-12 xl:p-16 min-h-screen"
        >
          {/* Background Travel Photograph */}
          <Image
            src="/images/login-travel.jpg"
            alt="Scenic Panadura west coast beach at sunset"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center opacity-85 transition-transform duration-1000 ease-out hover:scale-105"
          />

          {/* Subtle atmospheric vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101815]/90 via-[#101815]/30 to-black/35 pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-medium tracking-wide text-[#FBF9F4] backdrop-blur-md w-fit shadow-xs">
            <MapPin className="h-3.5 w-3.5 text-[#FBF9F4]" />
            <span>Panadura & West Coast · Sri Lanka</span>
          </div>

          {/* Bottom Editorial Content */}
          <div className="relative z-10 max-w-lg rounded-2xl border border-white/20 bg-black/45 p-7 text-[#FBF9F4] backdrop-blur-md shadow-lg">
            <span className="text-[11px] font-semibold tracking-widest text-[#E8E2D5]/80 uppercase">
              Curated Day Trips
            </span>
            <p className="mt-2 font-serif text-2xl font-light italic leading-snug text-white sm:text-3xl">
              &ldquo;One day, a few good stops, no guesswork.&rdquo;
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4 text-xs text-[#E8E2D5]/90">
              <span>Temples, lagoons, and quiet beaches within 25 km</span>
              <span className="font-mono text-[11px] tracking-wider text-[#E8E2D5]/70">
                6.7133° N, 79.9026° E
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
