"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectInput, TextInput } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { Gender } from "@/types/models";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function RegisterPage() {
  const { register, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE" as Gender,
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Please enter your full name";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Please enter your phone number";
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Please select your Date of Birth";
    else if (form.dateOfBirth > todayIso()) nextErrors.dateOfBirth = "Date of birth cannot be in the future";
    if (!form.gender) nextErrors.gender = "Please select your Gender";
    if (!form.email.trim()) nextErrors.email = "Please enter your email";
    else if (!emailRegex.test(form.email.trim())) nextErrors.email = "Please enter a valid email";
    if (!form.password) nextErrors.password = "Please enter your password";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        email: form.email.trim(),
        password: form.password
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Could not create account",
        message: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, router, user]);

  return (
    <main className="grid min-h-screen place-items-center bg-white p-6">
      <section className="w-full max-w-2xl fade-up">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nabda-logo.svg" alt="NABDA" className="mx-auto h-24 w-24" />
          <h1 className="mt-4 text-2xl font-extrabold text-darkBlue">Create doctor account</h1>
          <p className="mt-2 text-sm text-grey">Role is fixed to Doctor for this portal.</p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Full Name" icon="person" value={form.fullName} error={errors.fullName} onChange={(e) => setField("fullName", e.target.value)} />
            <TextInput label="Phone Number" icon="phone" value={form.phoneNumber} error={errors.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} />
            <TextInput label="Date of Birth" icon="calendar_today" type="date" max={todayIso()} value={form.dateOfBirth} error={errors.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
            <SelectInput label="Gender" icon="wc_rounded" value={form.gender} error={errors.gender} onChange={(e) => setField("gender", e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </SelectInput>
            <TextInput label="Email" icon="email" value={form.email} error={errors.email} onChange={(e) => setField("email", e.target.value)} />
            <TextInput label="Password" icon="lock" type="password" value={form.password} error={errors.password} onChange={(e) => setField("password", e.target.value)} />
            <TextInput
              label="Confirm Password"
              icon="lock"
              type="password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              className="md:col-span-2"
            />
          </div>
          <Button type="submit" className="mt-6 w-full rounded-3xl py-[18px] text-lg" loading={loading}>
            Create Account
          </Button>
          <p className="mt-6 text-center text-sm text-grey">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
