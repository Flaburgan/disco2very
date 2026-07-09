export const SERVER_URL = "https://www.disco2very.org/server/";

function generateAppId(): string {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // UUID v4 built from getRandomValues: crypto.randomUUID needs Chrome 92,
  // but the Ubuntu Touch webview is Chromium 87.
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Anonymous per-device identifier sent with the telemetry, created on first use.
function getAppId(): string {
  let appId = localStorage.getItem("app-id");
  if (!appId) {
    appId = generateAppId();
    localStorage.setItem("app-id", appId);
  }
  return appId;
}

export const recordNewGame = (categoriesMode: boolean) => {
  const formData = new FormData();
  formData.append("appId", getAppId());
  formData.append("userAgent", navigator.userAgent);
  formData.append("categoriesMode", categoriesMode ? "1" : "0");
  formData.append(
    "resolution",
    screen.width * window.devicePixelRatio +
      "x" +
      screen.height * window.devicePixelRatio,
  );
  formData.append("pixelRatio", window.devicePixelRatio.toString());
  formData.append(
    "availableResolution",
    screen.availWidth + "x" + screen.availHeight,
  );

  fetch(SERVER_URL + "telemetry.php", {
    method: "POST",
    body: formData,
    keepalive: true,
  }).catch(() => {
    // Telemetry is best-effort: stay silent when offline or the server is unreachable
  });
};
