import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/delivery/Brand";
import { ArrowLeft, ArrowRight, Loader2, Mail, UserRound } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "We couldn't send a code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("That code didn't match. Check the six digits and try again.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Guest sign-in failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="tech-grid pointer-events-none absolute inset-0" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
        <Link to="/" aria-label="LastMileSync home">
          <Brand />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground mono"
        >
          <ArrowLeft className="size-3.5" />
          Back to tracking
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <div className="panel rounded-xl p-6 sm:p-7">
            {step === "signIn" ? (
              <>
                <p className="eyebrow text-route-deep">Customer access</p>
                <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] text-foreground">
                  Sign in or create an account
                </h1>
                <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                  Book evening deliveries, negotiate fares and keep every
                  doorstep OTP in one place.
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-6">
                  <label
                    htmlFor="email"
                    className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground mono"
                  >
                    Email address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      className="h-11 border-border bg-white/[0.03] pl-9 text-[13px] focus-visible:border-route/50 focus-visible:ring-route/20"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {error && (
                    <p className="mt-2 text-[11px] leading-5 text-hub-deep">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-3 h-11 w-full gap-2 rounded-md bg-route text-[10px] uppercase tracking-[0.1em] text-primary-foreground hover:bg-route-deep mono"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending code…
                      </>
                    ) : (
                      <>
                        Continue with email
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>

                  <p className="mt-2 text-[10px] leading-5 text-muted-foreground/70">
                    New here? We&apos;ll create your account and email a 6-digit
                    verification code.
                  </p>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
                        or
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full gap-2 rounded-md border-border bg-transparent text-[12px] text-foreground hover:bg-white/[0.04] hover:text-foreground"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserRound className="size-3.5" />
                    Continue as guest
                  </Button>
                </form>
              </>
            ) : (
              <>
                <p className="eyebrow text-route-deep">Verify your email</p>
                <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] text-foreground">
                  Check your inbox
                </h1>
                <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                  Enter the six-digit code we sent to{" "}
                  <span className="text-foreground">{step.email}</span>.
                </p>

                <form onSubmit={handleOtpSubmit} className="mt-6">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          otp.length === 6 &&
                          !isLoading
                        ) {
                          const form = (event.target as HTMLElement).closest(
                            "form",
                          );
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-11 w-11 text-base"
                        />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <p className="mt-3 text-center text-[11px] leading-5 text-hub-deep">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="mt-4 h-11 w-full gap-2 rounded-md bg-route text-[10px] uppercase tracking-[0.1em] text-primary-foreground hover:bg-route-deep mono"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify and continue
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>

                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStep("signIn")}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Use a different email
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("signIn")}
                      className="text-route-deep transition-colors hover:text-route"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50 mono">
            Secured by{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              freebuff.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
