(function () {
  const STORAGE_KEY = "vlblog-newsletter-modal";
  const DELAY_MS = 40000;
  const dialog = document.getElementById("newsletterSignupModal");
  if (!dialog) return;
  if (!(dialog instanceof HTMLDialogElement)) return;
  if (localStorage.getItem(STORAGE_KEY)) return;

  function markDismissed() {
    localStorage.setItem(STORAGE_KEY, "1");
  }

  function show() {
    if (localStorage.getItem(STORAGE_KEY)) return;
    dialog.showModal();
    const input = dialog.querySelector('input[type="email"]');
    if (input) {
      requestAnimationFrame(function () {
        input.focus();
      });
    }
  }

  function tryOpen() {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (document.visibilityState === "hidden") {
      document.addEventListener(
        "visibilitychange",
        function onVisible() {
          if (document.visibilityState !== "visible") return;
          document.removeEventListener("visibilitychange", onVisible);
          show();
        }
      );
      return;
    }
    show();
  }

  window.setTimeout(tryOpen, DELAY_MS);

  dialog.addEventListener("close", function () {
    markDismissed();
  });

  dialog.querySelectorAll("[data-newsletter-modal-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      dialog.close();
    });
  });

  document.addEventListener("vlblog:newsletter-subscribed", function (e) {
    if (!e.detail || !e.detail.inModal) return;
    if (dialog.open) {
      dialog.close();
    }
  });
})();
