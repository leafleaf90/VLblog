(function () {
  const root = document.querySelector("[data-profile-scroll]");
  if (!root) return;

  const section = root.closest(".hero-section");
  const stage = root.closest(".hero-scroll-stage");
  const canvas = root.querySelector(".profile-scroll-canvas");
  if (!section || !stage || !(canvas instanceof HTMLCanvasElement)) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const totalFrames = Number(root.dataset.frameCount || 0);
  const frameWidth = Number(root.dataset.frameWidth || canvas.width);
  const frameHeight = Number(root.dataset.frameHeight || canvas.height);
  const batchSize = 12;
  const frames = new Array(totalFrames);
  let currentFrame = 0;
  let drawnFrame = -1;
  let loaded = false;
  let rafId = 0;

  section.classList.add("profile-scroll-active");

  function frameUrl(index) {
    return `/assets/images/profile-frames/frame-${String(index + 1).padStart(4, "0")}.webp`;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function pinnedTopOffset() {
    const top = Number.parseFloat(window.getComputedStyle(stage).top);
    return Number.isFinite(top) ? top : 0;
  }

  function updateTargetFrame() {
    const pinTop = pinnedTopOffset();
    const start = Math.max(0, section.offsetTop - pinTop);
    const stageHeight = stage.offsetHeight || window.innerHeight - pinTop;
    const maxScroll = section.offsetHeight - stageHeight;
    if (maxScroll <= 0) {
      currentFrame = 0;
      section.classList.remove("profile-scroll-complete");
      return;
    }

    const progress = clamp((window.scrollY - start) / maxScroll, 0, 1);
    currentFrame = Math.min(Math.floor(progress * (totalFrames - 1)), totalFrames - 1);
    section.classList.toggle("profile-scroll-thanks", progress >= 0.82);
    section.classList.toggle("profile-scroll-complete", progress >= 1);
  }

  function drawFrame(index) {
    const frame = frames[index];
    if (!frame) return;
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);
    drawnFrame = index;
  }

  function tick() {
    if (loaded && currentFrame !== drawnFrame) {
      drawFrame(currentFrame);
    }
    rafId = window.requestAnimationFrame(tick);
  }

  async function preloadFrames() {
    for (let i = 0; i < totalFrames; i += batchSize) {
      const end = Math.min(i + batchSize, totalFrames);
      const batch = await Promise.all(
        Array.from({ length: end - i }, (_, offset) => loadImage(frameUrl(i + offset)))
      );
      batch.forEach((img, offset) => {
        frames[i + offset] = img;
      });
      root.style.setProperty("--profile-scroll-progress", `${(end / totalFrames) * 100}%`);
    }

    loaded = true;
    updateTargetFrame();
    drawFrame(currentFrame);
    root.classList.add("is-ready");
  }

  window.addEventListener("scroll", updateTargetFrame, { passive: true });
  window.addEventListener("resize", updateTargetFrame, { passive: true });
  rafId = window.requestAnimationFrame(tick);

  preloadFrames().catch((error) => {
    console.error(error);
    window.cancelAnimationFrame(rafId);
    section.classList.remove("profile-scroll-active");
  });
})();
