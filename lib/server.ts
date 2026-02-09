export const  SERVER_URL = "https://www.disco2very.org/server/"

export const recordNewGame = (categoriesMode: boolean) => {

  const formData = new FormData();
  formData.append("appId", localStorage.getItem("app-id") || "");
  formData.append("userAgent", navigator.userAgent);
  formData.append("categoriesMode", categoriesMode ? "1" : "0");
  formData.append("resolution", screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio);
  formData.append("pixelRatio", window.devicePixelRatio.toString());
  formData.append("availableResolution", screen.availWidth + "x" + screen.availHeight);

  fetch(SERVER_URL + "telemetry.php", {
    method: "POST",
    body: formData,
  });
}