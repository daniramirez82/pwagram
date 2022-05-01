let deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => console.log("SW registered!", reg))
      .catch((err) => console.log("Boo", err));
  });
}
window.addEventListener("beforeinstallprompt", function (event) {
  console.log("ya puedes instalar la app");
  event.preventDefault();
  window.deferredPrompt = event;
  return false;
});

//test
