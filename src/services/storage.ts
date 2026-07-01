import type { User } from "@/types/models";

const JWT_KEY = "nabda_jwt";
const USER_KEY = "nabda_user";
const CREDS_KEY = "nabda_credentials";
const SETTINGS_KEY = "nabda_settings";

export interface StoredCredentials {
  email: string;
  password: string;
}

export interface LocalSettings {
  enableNotifications: boolean;
  languageCode: "en" | "ar";
  isDarkMode: boolean;
}

function safeLocalStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function safeSessionStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export const tokenStorage = {
  getToken() {
    return safeLocalStorage()?.getItem(JWT_KEY) ?? null;
  },
  setToken(token: string) {
    safeLocalStorage()?.setItem(JWT_KEY, token);
  },
  clearToken() {
    safeLocalStorage()?.removeItem(JWT_KEY);
  },
  getUser(): User | null {
    const raw = safeLocalStorage()?.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    safeLocalStorage()?.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    safeLocalStorage()?.removeItem(USER_KEY);
  },
  getCredentials(): StoredCredentials | null {
    const raw = safeSessionStorage()?.getItem(CREDS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredCredentials;
    } catch {
      return null;
    }
  },
  setCredentials(credentials: StoredCredentials) {
    safeSessionStorage()?.setItem(CREDS_KEY, JSON.stringify(credentials));
  },
  clearCredentials() {
    safeSessionStorage()?.removeItem(CREDS_KEY);
  },
  clearAll() {
    this.clearToken();
    this.clearUser();
    this.clearCredentials();
  },
  getSettings(): LocalSettings {
    const raw = safeLocalStorage()?.getItem(SETTINGS_KEY);
    if (!raw) return { enableNotifications: true, languageCode: "en", isDarkMode: false };
    try {
      return { enableNotifications: true, languageCode: "en", isDarkMode: false, ...(JSON.parse(raw) as Partial<LocalSettings>) };
    } catch {
      return { enableNotifications: true, languageCode: "en", isDarkMode: false };
    }
  },
  setSettings(settings: LocalSettings) {
    safeLocalStorage()?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
