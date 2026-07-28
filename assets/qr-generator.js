(function () {
  const root = document.querySelector("[data-qr-tool]");
  if (!root || typeof QRCode === "undefined") return;

  const input = root.querySelector("[data-qr-input]");
  const canvas = root.querySelector("[data-qr-canvas]");
  const placeholder = root.querySelector("[data-qr-placeholder]");
  const status = root.querySelector("[data-qr-status]");
  const downloadButtons = root.querySelectorAll("[data-qr-download]");

  if (
    !(input instanceof HTMLTextAreaElement) ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(placeholder instanceof HTMLElement) ||
    !(status instanceof HTMLElement)
  ) {
    return;
  }

  const PREVIEW_SIZE = 320;
  const DOWNLOAD_SIZE = 512;
  const DEBOUNCE_MS = 160;

  let debounceTimer = 0;
  let currentText = "";
  let generationToken = 0;

  function setStatus(message) {
    if (!message) {
      status.hidden = true;
      status.textContent = "";
      return;
    }
    status.hidden = false;
    status.textContent = message;
  }

  function setButtonsEnabled(enabled) {
    downloadButtons.forEach((button) => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = !enabled;
      }
    });
  }

  function showEmpty() {
    currentText = "";
    canvas.hidden = true;
    placeholder.hidden = false;
    setButtonsEnabled(false);
    setStatus("");
  }

  function showPreview() {
    canvas.hidden = false;
    placeholder.hidden = true;
    setButtonsEnabled(true);
    setStatus("");
  }

  function slugifyFilename(text) {
    const base = text
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .toLowerCase();
    return base || "qrcode";
  }

  function triggerDownload(filename, href) {
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function renderPreview(text) {
    const token = ++generationToken;
    try {
      await QRCode.toCanvas(canvas, text, {
        width: PREVIEW_SIZE,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      });
      if (token !== generationToken) return;
      currentText = text;
      showPreview();
    } catch (error) {
      if (token !== generationToken) return;
      currentText = "";
      canvas.hidden = true;
      placeholder.hidden = false;
      setButtonsEnabled(false);
      setStatus(
        "That text is too long or invalid for a QR code. Try a shorter value."
      );
    }
  }

  function onInput() {
    const text = input.value.trim();
    window.clearTimeout(debounceTimer);

    if (!text) {
      generationToken += 1;
      showEmpty();
      return;
    }

    debounceTimer = window.setTimeout(function () {
      renderPreview(text);
    }, DEBOUNCE_MS);
  }

  async function downloadPng() {
    if (!currentText) return;
    try {
      const dataUrl = await QRCode.toDataURL(currentText, {
        width: DOWNLOAD_SIZE,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      });
      triggerDownload(slugifyFilename(currentText) + ".png", dataUrl);
    } catch (error) {
      setStatus("Could not create the PNG. Try again with shorter text.");
    }
  }

  async function downloadSvg() {
    if (!currentText) return;
    try {
      const svg = await QRCode.toString(currentText, {
        type: "svg",
        width: DOWNLOAD_SIZE,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      });
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(slugifyFilename(currentText) + ".svg", objectUrl);
      window.setTimeout(function () {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      setStatus("Could not create the SVG. Try again with shorter text.");
    }
  }

  downloadButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const format = button.getAttribute("data-qr-download");
      if (format === "png") downloadPng();
      if (format === "svg") downloadSvg();
    });
  });

  input.addEventListener("input", onInput);
  showEmpty();

  if (input.value.trim()) {
    onInput();
  }
})();
