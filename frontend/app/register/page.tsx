"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiError, getBackendFieldErrors } from "@/lib/api";
import { registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // 1. Client-side Zod validation
    const validation = registerSchema.safeParse(form);
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

    // 2. Backend registration & validation
    setSubmitting(true);
    try {
      await register(validation.data);
      router.push("/");
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
    <div className="flex flex-1 items-center justify-center bg-[#FBF9F4] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-lg border border-[#E8E2D5] bg-white p-6 shadow-xs sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C86446]">
              Western Trails · New Traveler
            </span>
            <h1 className="mt-1.5 font-serif text-3xl font-bold tracking-tight text-[#1E2421]">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5C645F]">
              Save favourite coastal places, plan custom day trips, and share authentic insights.
            </p>
          </div>

          {/* Inline Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-md border border-[#F3C5BC] bg-[#FDF2F0] p-3.5 text-sm text-[#8C2E1F]"
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
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C645F]"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={update("name")}
                placeholder="Nimal Perera"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                className={`w-full rounded-md bg-white px-3.5 py-2.5 text-sm text-[#1E2421] placeholder-[#5C645F]/60 shadow-xs transition-colors focus:outline-none ${
                  fieldErrors.name
                    ? "border border-[#C86446] ring-1 ring-[#C86446]/30 focus:border-[#C86446] focus:ring-[#C86446]"
                    : "border border-[#D5CCBA] focus:border-[#174D44] focus:ring-1 focus:ring-[#174D44]"
                }`}
              />
              {fieldErrors.name && (
                <p id="name-error" className="mt-1.5 text-xs font-medium text-[#8C2E1F]">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C645F]"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={update("email")}
                placeholder="name@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className={`w-full rounded-md bg-white px-3.5 py-2.5 text-sm text-[#1E2421] placeholder-[#5C645F]/60 shadow-xs transition-colors focus:outline-none ${
                  fieldErrors.email
                    ? "border border-[#C86446] ring-1 ring-[#C86446]/30 focus:border-[#C86446] focus:ring-[#C86446]"
                    : "border border-[#D5CCBA] focus:border-[#174D44] focus:ring-1 focus:ring-[#174D44]"
                }`}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs font-medium text-[#8C2E1F]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C645F]"
              >
                Password <span className="text-[11px] font-normal normal-case">(min 8 characters, letters & numbers)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className={`w-full rounded-md bg-white px-3.5 py-2.5 pr-10 text-sm text-[#1E2421] placeholder-[#5C645F]/60 shadow-xs transition-colors focus:outline-none ${
                    fieldErrors.password
                      ? "border border-[#C86446] ring-1 ring-[#C86446]/30 focus:border-[#C86446] focus:ring-[#C86446]"
                      : "border border-[#D5CCBA] focus:border-[#174D44] focus:ring-1 focus:ring-[#174D44]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C645F] hover:text-[#1E2421]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs font-medium text-[#8C2E1F]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C645F]"
              >
                Confirm password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.password_confirmation}
                onChange={update("password_confirmation")}
                placeholder="••••••••"
                aria-invalid={Boolean(fieldErrors.password_confirmation)}
                aria-describedby={fieldErrors.password_confirmation ? "password_confirmation-error" : undefined}
                className={`w-full rounded-md bg-white px-3.5 py-2.5 text-sm text-[#1E2421] placeholder-[#5C645F]/60 shadow-xs transition-colors focus:outline-none ${
                  fieldErrors.password_confirmation
                    ? "border border-[#C86446] ring-1 ring-[#C86446]/30 focus:border-[#C86446] focus:ring-[#C86446]"
                    : "border border-[#D5CCBA] focus:border-[#174D44] focus:ring-1 focus:ring-[#174D44]"
                }`}
              />
              {fieldErrors.password_confirmation && (
                <p id="password_confirmation-error" className="mt-1.5 text-xs font-medium text-[#8C2E1F]">
                  {fieldErrors.password_confirmation}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#174D44] px-4 py-2.5 text-sm font-semibold text-[#FBF9F4] transition-colors hover:bg-[#103630] focus:outline-none focus:ring-2 focus:ring-[#174D44] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
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
                  <span>Creating account…</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-[#E8E2D5] pt-4 text-center">
            <p className="text-sm text-[#5C645F]">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#174D44] underline-offset-2 hover:underline"
              >
                Log in here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
