"use client";

import { useEffect, useState } from "react";

// Registers the service worker so the app is installable (Add to Home Screen).
export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const reg = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      if (document.readyState === "complete") reg();
      else window.addEventListener("load", reg, { once: true });
    }
  }, []);
  return null;
}

// "Cài app" button — appears only when the browser offers install (Android/Chrome).
// iOS users install via Share → Thêm vào MH chính (no programmatic prompt exists).
export function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<Event | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const e = deferred as Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
        await e.prompt();
        await e.userChoice.catch(() => {});
        setDeferred(null);
      }}
      className={className || "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent"}
    >
      📲 Cài app
    </button>
  );
}
