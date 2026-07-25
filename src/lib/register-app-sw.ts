const APP_SW_PATH = "/sw.js";

function isPreviewOrBlockedHost(hostname: string): boolean {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith(APP_SW_PATH))
      .map((registration) => registration.unregister()),
  );
}

function shouldRegisterServiceWorker() {
  if (typeof window === "undefined") return false;
  if (!import.meta.env.PROD) return false;
  if (!("serviceWorker" in navigator)) return false;
  if (window.self !== window.top) return false;

  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") return false;
  if (isPreviewOrBlockedHost(window.location.hostname)) return false;

  return true;
}

export async function registerAppServiceWorker() {
  if (!shouldRegisterServiceWorker()) {
    await unregisterAppServiceWorkers();
    return;
  }

  await navigator.serviceWorker.register(APP_SW_PATH, { scope: "/" });
}
