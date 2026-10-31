(function () {
  var KEY = "vlblog-theme";

  function systemPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function applyFromPreference() {
    var s = localStorage.getItem(KEY);
    if (s === "light" || s === "dark") {
      document.documentElement.setAttribute("data-theme", s);
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        systemPrefersDark() ? "dark" : "light"
      );
    }
  }

  function attr(btn, name, fallback) {
    return (btn && btn.getAttribute(name)) || fallback;
  }

  function syncButton(btn) {
    if (!btn) return;
    var t = document.documentElement.getAttribute("data-theme") || "light";
    btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      t === "dark"
        ? attr(btn, "data-label-to-light", "Switch to light theme (currently dark)")
        : attr(btn, "data-label-to-dark", "Switch to dark theme (currently light)")
    );
    btn.title =
      t === "dark"
        ? attr(btn, "data-title-dark", "Currently dark — click for light theme")
        : attr(btn, "data-title-light", "Currently light — click for dark theme");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeToggle");
    syncButton(btn);

    if (btn) {
      btn.addEventListener("click", function () {
        var cur =
          document.documentElement.getAttribute("data-theme") || "light";
        var next = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem(KEY, next);
        } catch (e) {}
        syncButton(btn);
      });
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        if (localStorage.getItem(KEY) === "light" || localStorage.getItem(KEY) === "dark") {
          return;
        }
        applyFromPreference();
        syncButton(btn);
      });
  });
})();
