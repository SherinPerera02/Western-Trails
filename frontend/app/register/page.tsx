"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError, getBackendFieldErrors } from "@/lib/api";
import { registerSchema } from "@/lib/validations/auth";
import AuthLogo from "@/components/auth/AuthLogo";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // 2. Submit to backend API & capture backend validation
    setSubmitting(true);
    try {
      const user = await register(validation.data);
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
    <div className="flex flex-1 min-h-screen items-center justify-center bg-[#FBF9F4] px-6 py-12 sm:px-12 md:py-16">
      <div className="mx-auto w-full max-w-md">
        {/* Travel-style Logo Treatment */}
        <div className="mb-8">
          <AuthLogo />
        </div>

        {/* Header / Intro */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl">
            Create Your Account
          </h1>
          <p className="mt-2 text-base text-[#5C645F]">
            Create an account and start planning your next journey.
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

        {/* Register Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-[#1E2421]"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Enter your full name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className={`w-full rounded-lg bg-white px-4 py-3 text-base text-[#1E2421] placeholder-[#5C645F]/55 shadow-xs transition-colors focus:outline-none ${
                fieldErrors.name
                  ? "border border-[#C86446] ring-2 ring-[#C86446]/20 focus:border-[#C86446]"
                  : "border border-[#D8D2C5] focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/15"
              }`}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-2 text-xs font-medium text-[#8C2E1F]">
                {fieldErrors.name}
              </p>
            )}
          </div>

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
              value={form.email}
              onChange={update("email")}
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
                autoComplete="new-password"
                required
                value={form.password}
                onChange={update("password")}
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
            {fieldErrors.password ? (
              <p id="password-error" className="mt-2 text-xs font-medium text-[#8C2E1F]">
                {fieldErrors.password}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[#5C645F]">
                Must be at least 8 characters with letters and numbers.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-semibold text-[#1E2421]"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.password_confirmation}
                onChange={update("password_confirmation")}
                placeholder="Confirm your password"
                aria-invalid={Boolean(fieldErrors.password_confirmation)}
                aria-describedby={
                  fieldErrors.password_confirmation
                    ? "password_confirmation-error"
                    : undefined
                }
                className={`w-full rounded-lg bg-white px-4 py-3 pr-12 text-base text-[#1E2421] placeholder-[#5C645F]/55 shadow-xs transition-colors focus:outline-none ${
                  fieldErrors.password_confirmation
                    ? "border border-[#C86446] ring-2 ring-[#C86446]/20 focus:border-[#C86446]"
                    : "border border-[#D8D2C5] focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/15"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#5C645F] transition-colors hover:text-[#1E2421]"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={1.8} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={1.8} />
                )}
              </button>
            </div>
            {fieldErrors.password_confirmation && (
              <p
                id="password_confirmation-error"
                className="mt-2 text-xs font-medium text-[#8C2E1F]"
              >
                {fieldErrors.password_confirmation}
              </p>
            )}
          </div>

          {/* Terms and Conditions checkbox */}
          <div className="pt-1">
            <label
              htmlFor="terms"
              className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-[#5C645F]"
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#C5BFB0] text-[#174D44] accent-[#174D44] focus:ring-2 focus:ring-[#174D44]/20 focus:ring-offset-0"
              />
              <span>
                I agree to the{" "}
                <span className="font-medium text-[#174D44]">
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span className="font-medium text-[#174D44]">
                  Privacy Policy
                </span>
              </span>
            </label>
          </div>

          {/* Large full-width primary button: Create Account */}
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
                <span>Creating Account…</span>
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer / Sign In link */}
        <div className="mt-8 text-center text-sm text-[#5C645F]">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-semibold text-[#174D44] underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
