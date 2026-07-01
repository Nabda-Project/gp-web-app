"use client";

import { useEffect, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/ThemeContext";
import { tokenStorage, type LocalSettings } from "@/services/storage";

export default function SettingsPage() {
  const { isDarkMode, setDarkMode } = useTheme();
  const [settings, setSettings] = useState<LocalSettings>({ enableNotifications: true, languageCode: "en", isDarkMode: false });

  useEffect(() => {
    setSettings(tokenStorage.getSettings());
  }, []);

  function update(next: LocalSettings) {
    setSettings(next);
    tokenStorage.setSettings(next);
    setDarkMode(next.isDarkMode);
    document.documentElement.lang = next.languageCode;
  }

  return (
    <ProtectedShell>
      <div className="min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-darkBlue">Settings</h1>
        <div className="mt-6 max-w-2xl space-y-4">
          <Card>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={isDarkMode ? "light_mode" : "dark_mode"} size={20} />
                </span>
                <span>
                  <span className="block font-bold text-darkBlue">Dark Mode</span>
                  <span className="text-sm text-grey">Use the darker NABDA dashboard theme</span>
                </span>
              </span>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(event) => update({ ...settings, isDarkMode: event.target.checked })}
                className="h-5 w-5 accent-primary"
              />
            </label>
          </Card>
          <Card>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="notifications" size={20} />
                </span>
                <span>
                  <span className="block font-bold text-darkBlue">Notifications</span>
                  <span className="text-sm text-grey">Receive alerts and reminders</span>
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(event) => update({ ...settings, enableNotifications: event.target.checked })}
                className="h-5 w-5 accent-primary"
              />
            </label>
          </Card>
          <Card>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="language" size={20} />
                </span>
                <span>
                  <span className="block font-bold text-darkBlue">Language</span>
                  <span className="text-sm text-grey">{settings.languageCode === "en" ? "English" : "العربية"}</span>
                </span>
              </span>
              <select
                className="rounded-xl border border-lightGrey bg-white px-3 py-2 font-semibold text-darkBlue transition-colors dark:bg-surfaceMuted"
                value={settings.languageCode}
                onChange={(event) => update({ ...settings, languageCode: event.target.value as "en" | "ar" })}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
          </Card>
        </div>
      </div>
    </ProtectedShell>
  );
}
