"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, resetForceLogoutGuard, setForceLogoutHandler } from "@/services/apiClient";
import { signOutGoogle, type GoogleDoctorIdentity } from "@/services/firebaseAuth";
import { tokenStorage } from "@/services/storage";
import { realtime } from "@/services/websocket";
import type { LoginRequest, RegisterRequest, User } from "@/types/models";
import { useToast } from "@/context/ToastContext";

export class DoctorOnlyAuthError extends Error {
  constructor() {
    super("This portal is for doctors only.");
    this.name = "DoctorOnlyAuthError";
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: Omit<RegisterRequest, "role">) => Promise<void>;
  loginWithGoogle: (identity: GoogleDoctorIdentity) => Promise<"logged-in" | "needs-profile">;
  completeGoogleDoctorRegistration: (
    identity: GoogleDoctorIdentity,
    profile: Pick<RegisterRequest, "phoneNumber" | "dateOfBirth" | "gender">
  ) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const applyDoctor = useCallback(
    (profile: User) => {
      if (profile.role !== "DOCTOR") {
        tokenStorage.clearAll();
        setUser(null);
        showToast({
          type: "error",
          title: "Patient account not allowed",
          message: "This is the NABDA Doctor Portal. Patient accounts cannot access this website. Please use the patient mobile app.",
          durationMs: 8000
        });
        router.replace("/login");
        return false;
      }
      setUser(profile);
      tokenStorage.setUser(profile);
      realtime.connect(profile.id, (id) => {
        api.heartbeat(id).catch(() => undefined);
      });
      return true;
    },
    [router, showToast]
  );

  const refreshProfile = useCallback(async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const profile = await api.me();
      return applyDoctor(profile) ? profile : null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [applyDoctor]);

  useEffect(() => {
    setForceLogoutHandler(() => {
      realtime.disconnect();
      setUser(null);
      showToast({
        type: "error",
        title: "Session Expired",
        message: "Your session has expired. Please log in again."
      });
      router.replace("/login");
    });
    const stored = tokenStorage.getUser();
    if (stored?.role === "DOCTOR") setUser(stored);
    void refreshProfile();
    return () => setForceLogoutHandler(null);
  }, [refreshProfile, router, showToast]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const auth = await api.login(payload);
      tokenStorage.setToken(auth.token);
      tokenStorage.setCredentials(payload);
      resetForceLogoutGuard();
      const profile = await api.me();
      if (!applyDoctor(profile)) throw new DoctorOnlyAuthError();
      router.replace("/dashboard");
    },
    [applyDoctor, router]
  );

  const register = useCallback(
    async (payload: Omit<RegisterRequest, "role">) => {
      await api.register({ ...payload, role: "DOCTOR" });
      await login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const loginWithGoogle = useCallback(
    async (identity: GoogleDoctorIdentity) => {
      try {
        await login({ email: identity.email, password: identity.password });
        return "logged-in";
      } catch (error) {
        if (error instanceof DoctorOnlyAuthError) throw error;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return "needs-profile";
        throw error;
      }
    },
    [login]
  );

  const completeGoogleDoctorRegistration = useCallback(
    async (identity: GoogleDoctorIdentity, profile: Pick<RegisterRequest, "phoneNumber" | "dateOfBirth" | "gender">) => {
      await register({
        fullName: identity.fullName,
        email: identity.email,
        password: identity.password,
        ...profile
      });
    },
    [register]
  );

  const logout = useCallback(() => {
    realtime.disconnect();
    void signOutGoogle().catch(() => undefined);
    tokenStorage.clearAll();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      completeGoogleDoctorRegistration,
      logout,
      refreshProfile
    }),
    [completeGoogleDoctorRegistration, loading, login, loginWithGoogle, logout, refreshProfile, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
