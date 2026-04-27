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
  const initialFrameCount = Math.min(9, totalFrames);
  const batchSize = 12;
  const frames = new Array(totalFrames);
  const loadedFrameIndexes = new Set();
  let currentFrame = 0;
  let drawnFrame = -1;
  let readyToDraw = false;
  let loadedCount = 0;
  let rafId = 0;

  function syncNavOffset() {
    const nav = document.querySelector(".navbar");
    if (!(nav instanceof HTMLElement)) return;
    const height = Math.ceil(nav.getBoundingClientRect().height);
    if (height > 0) {
      document.documentElement.style.setProperty("--nav-offset", `${height}px`);
    }
  }

  syncNavOffset();
  section.classList.add("profile-scroll-active");

  const hintWrap = section.querySelector(".profile-scroll-hint-wrap");
  if (hintWrap && "IntersectionObserver" in window) {
    const offscreenIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            section.style.setProperty("--profile-hint-offscreen", "1");
            continue;
          }
          const raw = 1 - entry.intersectionRatio;
          const dead = 0.1;
          const t = raw <= dead ? 0 : (raw - dead) / (1 - dead);
          section.style.setProperty("--profile-hint-offscreen", String(clamp(t, 0, 1)));
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
    );
    offscreenIo.observe(hintWrap);
  }

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

  function setLoadingProgress() {
    root.style.setProperty("--profile-scroll-progress", `${(loadedCount / totalFrames) * 100}%`);
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
      section.classList.remove(
        "profile-scroll-complete",
        "profile-scroll-thanks",
        "profile-scroll-keep",
        "profile-scroll-hint-scrolling"
      );
      section.style.removeProperty("--profile-hint-progress");
      section.style.removeProperty("--profile-hint-exit");
      return;
    }

    const progress = clamp((window.scrollY - start) / maxScroll, 0, 1);
    currentFrame = Math.min(Math.floor(progress * (totalFrames - 1)), totalFrames - 1);
    /* Phases: intro → nudge to continue (keep) → thank-you (longer band so it’s easy to read) */
    const keepStart = 0.35;
    const thanksStart = 0.63;
    section.classList.toggle("profile-scroll-keep", progress >= keepStart && progress < thanksStart);
    section.classList.toggle("profile-scroll-thanks", progress >= thanksStart);
    section.classList.toggle("profile-scroll-complete", progress >= 1);
    section.classList.toggle("profile-scroll-hint-scrolling", progress > 0.04 && progress < 1);
    section.style.setProperty("--profile-hint-progress", String(progress));
    /* Dissolve the cue only in the last part of the runway so “Thanks!” stays legible */
    const exitStart = 0.88;
    const exitRaw = progress > exitStart ? (progress - exitStart) / (1 - exitStart) : 0;
    section.style.setProperty("--profile-hint-exit", String(clamp(exitRaw, 0, 1)));
  }

  function drawFrame(index) {
    const frame = frames[index];
    if (!frame) return;
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);
    drawnFrame = index;
  }

  function closestLoadedFrameIndex(targetIndex) {
    if (frames[targetIndex]) return targetIndex;

    for (let distance = 1; distance < totalFrames; distance += 1) {
      const before = targetIndex - distance;
      const after = targetIndex + distance;
      if (before >= 0 && frames[before]) return before;
      if (after < totalFrames && frames[after]) return after;
    }

    return null;
  }

  function tick() {
    if (readyToDraw) {
      const drawableFrame = closestLoadedFrameIndex(currentFrame);
      if (drawableFrame !== null && drawableFrame !== drawnFrame) {
        drawFrame(drawableFrame);
      }
    }
    rafId = window.requestAnimationFrame(tick);
  }

  async function loadFrameBatch(start, end) {
    const batch = await Promise.all(
      Array.from({ length: end - start }, (_, offset) => {
        const index = start + offset;
        return loadImage(frameUrl(index)).then((img) => ({ index, img }));
      })
    );

    batch.forEach(({ index, img }) => {
      if (!loadedFrameIndexes.has(index)) {
        loadedFrameIndexes.add(index);
        loadedCount += 1;
      }
      frames[index] = img;
    });
    setLoadingProgress();
  }

  async function preloadFrames() {
    await loadFrameBatch(0, initialFrameCount);
    readyToDraw = true;
    updateTargetFrame();
    drawFrame(closestLoadedFrameIndex(currentFrame) ?? 0);
    root.classList.add("is-ready");

    for (let i = initialFrameCount; i < totalFrames; i += batchSize) {
      const end = Math.min(i + batchSize, totalFrames);
      await loadFrameBatch(i, end);
    }
  }

  window.addEventListener("scroll", updateTargetFrame, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      syncNavOffset();
      updateTargetFrame();
    },
    { passive: true }
  );
  rafId = window.requestAnimationFrame(tick);

  preloadFrames().catch((error) => {
    console.error(error);
    window.cancelAnimationFrame(rafId);
    section.classList.remove("profile-scroll-active");
  });
})();
