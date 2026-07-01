"use client";

import { FormEvent, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { SelectInput, TextInput } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/services/apiClient";
import { tokenStorage } from "@/services/storage";
import type { Gender, UpdateProfileRequest } from "@/types/models";
import { formatDate } from "@/utils/date";

export default function ProfilePage() {
  const { user, logout, refreshProfile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <ProtectedShell>
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <section className="gradient-primary relative overflow-hidden px-6 py-10 text-center text-white">
          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10" />
          <button className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/15" onClick={logout}>
            <Icon name="logout_rounded" size={22} />
          </button>
          <div className="relative mx-auto w-fit rounded-full border-[3px] border-white/50 p-1">
            <Avatar name={user?.fullName} imageUrl={user?.profileImageUrl} size={100} />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{user?.fullName}</h1>
          <p className="text-sm text-white/85">{user?.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-1 text-xs font-bold">Doctor</span>
        </section>
        <div className="mx-auto max-w-3xl space-y-5 p-6 lg:p-8">
          <Button className="w-full" icon="edit" onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
          <Card>
            <h2 className="mb-3 text-base font-bold text-darkBlue">Personal Information</h2>
            <Info icon="person" label="Full Name" value={user?.fullName} />
            <Info icon="email_outlined" label="Email" value={user?.email} />
            <Info icon="phone_outlined" label="Phone" value={user?.phoneNumber} />
            <Info icon="wc_rounded" label="Gender" value={user?.gender} />
            <Info icon="cake_outlined" label="Date of Birth" value={formatDate(user?.dateOfBirth)} />
          </Card>
          <Card>
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) logout();
              }}
            >
              <span className="flex items-center gap-3 font-bold text-darkBlue">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-error/10 text-error">
                  <Icon name="logout" size={20} />
                </span>
                Logout
              </span>
              <Icon name="chevron_right" className="text-grey" />
            </button>
          </Card>
        </div>
        {user ? <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={refreshProfile} user={user} /> : null}
      </div>
    </ProtectedShell>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-4 border-t border-lightGrey/50 py-3 first:border-t-0">
      <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-primary/10 text-primary">
        <Icon name={icon} size={20} />
      </span>
      <span>
        <span className="block text-xs font-semibold text-grey">{label}</span>
        <span className="text-[15px] font-bold text-darkBlue">{value || "N/A"}</span>
      </span>
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  onSaved,
  user
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullName: user.fullName,
    phoneNumber: user.phoneNumber ?? "",
    email: user.email,
    dateOfBirth: user.dateOfBirth ?? "",
    gender: (user.gender ?? "MALE") as Gender,
    password: "",
    profileImageUrl: user.profileImageUrl ?? ""
  });
  const [loading, setLoading] = useState(false);

  function fileToDataUri(file: File) {
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profileImageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload: UpdateProfileRequest = {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        profileImageUrl: form.profileImageUrl
      };
      if (form.password) payload.password = form.password;
      await api.updateMe(payload);
      const credentials = tokenStorage.getCredentials();
      if (credentials) {
        tokenStorage.setCredentials({
          email: form.email.trim(),
          password: form.password || credentials.password
        });
      }
      await onSaved();
      showToast({ type: "success", title: "Profile updated" });
      onClose();
    } catch (error) {
      showToast({ type: "error", title: "Failed to update profile", message: error instanceof Error ? error.message : undefined });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={form.fullName} imageUrl={form.profileImageUrl} size={72} />
          <label className="cursor-pointer rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
            Choose Photo
            <input className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && fileToDataUri(e.target.files[0])} />
          </label>
          <Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, profileImageUrl: "" }))}>
            Remove
          </Button>
        </div>
        <TextInput label="Full Name" icon="person" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <TextInput label="Phone" icon="phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
        <TextInput label="Email" icon="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextInput label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        <SelectInput label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </SelectInput>
        <TextInput label="New Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" loading={loading} className="w-full">
          Save Changes
        </Button>
      </form>
    </Modal>
  );
}
