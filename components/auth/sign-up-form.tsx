"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function validateUsername(val: string): string | null {
  if (!val) return "Username is required.";
  if (val.length < 3 || val.length > 20) {
    return "Username must be between 3 and 20 characters.";
  }
  if (!/^[a-zA-Z]/.test(val)) {
    return "Username must start with a letter.";
  }
  if (/^\d+$/.test(val)) {
    return "Username cannot consist only of numbers.";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(val)) {
    return "Username can only contain letters, numbers, underscores, and hyphens.";
  }
  return null;
}

function validateEmail(val: string): string | null {
  if (!val) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) {
    return "Please enter a valid email address.";
  }
  return null;
}

function validatePassword(val: string): string | null {
  if (!val) return "Password is required.";
  if (val.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(val)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(val)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(val)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(val)) {
    return "Password must contain at least one special character.";
  }
  return null;
}

export function SignUpForm() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const usernameError = touched.username ? validateUsername(username) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;
  const confirmPasswordError = touched.confirmPassword
    ? (password !== confirmPassword ? "Passwords do not match." : null)
    : null;

  const isFormValid =
    username.length >= 3 &&
    username.length <= 20 &&
    validateUsername(username) === null &&
    validateEmail(email) === null &&
    validatePassword(password) === null &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof typeof touched, value: string) => {
    if (field === "username") setUsername(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  async function handleEmailSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const uError = validateUsername(username);
    const eError = validateEmail(email);
    const pError = validatePassword(password);
    const cpError = password !== confirmPassword ? "Passwords do not match." : null;

    if (uError || eError || pError || cpError) {
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      setError(uError || eError || pError || cpError || "Please fix validation errors.");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard/jobs");
      router.refresh();
      return;
    }

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTouched({
      username: false,
      email: false,
      password: false,
      confirmPassword: false,
    });

    setMessage("We've sent a verification email to your inbox. Please verify your email before signing in.");
    setIsLoading(false);
  }

  async function handleGoogleSignUp() {
    setError(null);
    setMessage(null);
    setIsGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsGoogleLoading(false);
    }
  }

  if (message) {
    return (
      <AuthShell
        title="Verify your email"
        description="Check your email to confirm your account."
        footer={
          <>
            Already verified?{" "}
            <a href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </a>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground leading-normal">
            {message}
          </p>
          <Button
            onClick={() => router.push("/sign-in")}
            size="lg"
            className="h-11 w-full text-sm mt-2"
          >
            Go to Sign In
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start applying to jobs with AI-powered assistance."
      footer={
        <>
          Already have an account?{" "}
          <a href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </a>
        </>
      }
    >
      <div className="space-y-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full text-sm"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? <Spinner /> : <GoogleIcon />}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!usernameError}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="username"
                value={username}
                onChange={(event) => handleChange("username", event.target.value)}
                onBlur={() => handleBlur("username")}
                required
                disabled={isLoading || isGoogleLoading}
                className="h-11"
              />
              {usernameError ? <FieldError>{usernameError}</FieldError> : null}
            </Field>

            <Field data-invalid={!!emailError}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => handleChange("email", event.target.value)}
                onBlur={() => handleBlur("email")}
                required
                disabled={isLoading || isGoogleLoading}
                className="h-11"
              />
              {emailError ? <FieldError>{emailError}</FieldError> : null}
            </Field>

            <Field data-invalid={!!passwordError}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => handleChange("password", event.target.value)}
                onBlur={() => handleBlur("password")}
                required
                disabled={isLoading || isGoogleLoading}
                className="h-11"
              />
              {passwordError ? (
                <FieldError>{passwordError}</FieldError>
              ) : (
                <FieldDescription>
                  Must be min 8 chars with 1 uppercase, 1 lowercase, 1 number, and 1 special char.
                </FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!confirmPasswordError}>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => handleChange("confirmPassword", event.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                required
                disabled={isLoading || isGoogleLoading}
                className="h-11"
              />
              {confirmPasswordError ? <FieldError>{confirmPasswordError}</FieldError> : null}
            </Field>
          </FieldGroup>

          {error ? <FieldError>{error}</FieldError> : null}
          {message ? (
            <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-sm"
            disabled={isLoading || isGoogleLoading || !isFormValid}
          >
            {isLoading ? <Spinner /> : null}
            Create account
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
