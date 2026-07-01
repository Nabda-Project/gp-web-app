"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectInput, TextInput } from "@/components/ui/Input";
import { DoctorOnlyAuthError, useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/services/apiClient";
import { signInWithGooglePopup, type GoogleDoctorIdentity } from "@/services/firebaseAuth";
import type { Gender } from "@/types/models";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function LoginPage() {
  const { login, loginWithGoogle, completeGoogleDoctorRegistration, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleIdentity, setGoogleIdentity] = useState<GoogleDoctorIdentity | null>(null);
  const [googleProfile, setGoogleProfile] = useState({
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE" as Gender
  });
  const [googleErrors, setGoogleErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Please enter your email";
    else if (!emailRegex.test(email.trim())) nextErrors.email = "Please enter a valid email";
    if (!password) nextErrors.password = "Please enter your password";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      if (error instanceof DoctorOnlyAuthError) return;
      showToast({
        type: "error",
        title: "Invalid email or password",
        message: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, router, user]);

  async function onGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const identity = await signInWithGooglePopup();
      const result = await loginWithGoogle(identity);
      if (result === "needs-profile") {
        setGoogleIdentity(identity);
      }
    } catch (error) {
      if (error instanceof DoctorOnlyAuthError) return;
      showToast({
        type: "error",
        title: "Google sign-in failed",
        message: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function completeGoogleProfile(event: FormEvent) {
    event.preventDefault();
    if (!googleIdentity) return;
    const nextErrors: Record<string, string> = {};
    if (!googleProfile.phoneNumber.trim()) nextErrors.phoneNumber = "Please enter your phone number";
    if (!googleProfile.dateOfBirth) nextErrors.dateOfBirth = "Please select your Date of Birth";
    else if (googleProfile.dateOfBirth > todayIso()) nextErrors.dateOfBirth = "Date of birth cannot be in the future";
    if (!googleProfile.gender) nextErrors.gender = "Please select your Gender";
    setGoogleErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setGoogleLoading(true);
    try {
      await completeGoogleDoctorRegistration(googleIdentity, {
        phoneNumber: googleProfile.phoneNumber.trim(),
        dateOfBirth: googleProfile.dateOfBirth,
        gender: googleProfile.gender
      });
      setGoogleIdentity(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        showToast({
          type: "error",
          title: "Patient account not allowed",
          message:
            "An account already exists with this email. Only doctor accounts can use this website; patient accounts must use the patient mobile app.",
          durationMs: 8000
        });
        return;
      }
      showToast({
        type: "error",
        title: "Could not create Google doctor account",
        message: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-white p-6">
      <section className="w-full max-w-md fade-up">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nabda-logo.svg" alt="NABDA" className="mx-auto h-24 w-24" />
          <h1 className="mt-4 text-2xl font-extrabold text-darkBlue">Access your NABDA account</h1>
        </div>
        <form onSubmit={onSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow-card">
          <div className="space-y-4">
            <TextInput label="Email" icon="email" type="email" autoComplete="email" value={email} error={errors.email} onChange={(event) => setEmail(event.target.value)} />
            <TextInput
              label="Password"
              icon="lock"
              type="password"
              autoComplete="current-password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type="submit" className="mt-6 w-full rounded-3xl py-[18px] text-lg" loading={loading}>
            Login
          </Button>
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-lightGrey" />
            <span className="text-sm font-semibold text-grey">OR</span>
            <span className="h-px flex-1 bg-lightGrey" />
          </div>
          <button
            type="button"
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[26px] bg-[#F2F2F2] text-base font-semibold text-[#1F1F1F] transition hover:bg-lightGrey disabled:opacity-60"
            onClick={onGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1F1F1F] border-t-transparent" />
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white font-bold text-[#4285F4]">G</span>
            )}
            Sign in with Google
          </button>
          <p className="mt-6 text-center text-sm text-grey">
            Need a doctor account?{" "}
            <Link href="/register" className="font-bold text-primary">
              Create Account
            </Link>
          </p>
        </form>
      </section>
      <Modal open={Boolean(googleIdentity)} onClose={() => setGoogleIdentity(null)} title="Complete doctor profile">
        <form onSubmit={completeGoogleProfile} className="space-y-4">
          <p className="rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary">
            Google sign-in succeeded. Add the required doctor registration fields to create your NABDA backend account.
          </p>
          <TextInput
            label="Phone Number"
            icon="phone"
            value={googleProfile.phoneNumber}
            error={googleErrors.phoneNumber}
            onChange={(event) => setGoogleProfile((current) => ({ ...current, phoneNumber: event.target.value }))}
          />
          <TextInput
            label="Date of Birth"
            icon="calendar_today"
            type="date"
            max={todayIso()}
            value={googleProfile.dateOfBirth}
            error={googleErrors.dateOfBirth}
            onChange={(event) => setGoogleProfile((current) => ({ ...current, dateOfBirth: event.target.value }))}
          />
          <SelectInput
            label="Gender"
            icon="wc_rounded"
            value={googleProfile.gender}
            error={googleErrors.gender}
            onChange={(event) => setGoogleProfile((current) => ({ ...current, gender: event.target.value as Gender }))}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </SelectInput>
          <Button type="submit" className="w-full" loading={googleLoading}>
            Create Doctor Account
          </Button>
        </form>
      </Modal>
    </main>
  );
}
