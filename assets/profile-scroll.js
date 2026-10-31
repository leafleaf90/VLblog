(function () {
  const root = document.querySelector("[data-profile-scroll]");
  if (!root) return;

  const section = root.closest(".hero-section");
  const stage = root.closest(".hero-scroll-stage");
  const canvas = root.querySelector(".profile-scroll-canvas");
  if (!section || !stage || !(canvas instanceof HTMLCanvasElement)) return;

  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const totalFrames = Number(root.dataset.frameCount || 0);
  const frameWidth = Number(root.dataset.frameWidth || canvas.width);
  const frameHeight = Number(root.dataset.frameHeight || canvas.height);
  const initialFrameCount = Math.min(6, totalFrames);
  const KEEP_BEHIND = 6;
  const KEEP_AHEAD = 10;
  const frames = new Array(totalFrames);
  const inflight = new Map();
  let currentFrame = 0;
  let drawnFrame = -1;
  let readyToDraw = false;
  let loadedCount = 0;
  let ticking = false;
  let stageVisible = true;
  let pinTop = 0;
  let startY = 0;
  let maxScroll = 1;
  let lastEnsured = -1;
  let lastKeep = false;
  let lastThanks = false;
  let lastComplete = false;
  let lastHint = false;
  let lastProgressBucket = -1;
  let lastExitBucket = -1;

  canvas.width = frameWidth;
  canvas.height = frameHeight;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function syncNavOffset() {
    const nav = document.querySelector(".navbar");
    if (!(nav instanceof HTMLElement)) return;
    const height = Math.ceil(nav.getBoundingClientRect().height);
    if (height > 0) {
      document.documentElement.style.setProperty("--nav-offset", `${height}px`);
    }
  }

  function pinnedTopOffset() {
    const top = Number.parseFloat(window.getComputedStyle(stage).top);
    return Number.isFinite(top) ? top : 0;
  }

  function measure() {
    syncNavOffset();
    pinTop = pinnedTopOffset();
    startY = Math.max(0, section.offsetTop - pinTop);
    const stageHeight = stage.offsetHeight || window.innerHeight - pinTop;
    maxScroll = Math.max(1, section.offsetHeight - stageHeight);
  }

  syncNavOffset();
  section.classList.add("profile-scroll-active");
  measure();

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
          section.style.setProperty(
            "--profile-hint-offscreen",
            String(clamp(t, 0, 1))
          );
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    offscreenIo.observe(hintWrap);
  }

  if ("IntersectionObserver" in window) {
    const stageIo = new IntersectionObserver(
      (entries) => {
        stageVisible = entries.some((entry) => entry.isIntersecting);
        if (stageVisible) queueUpdate();
      },
      { rootMargin: "120px 0px" }
    );
    stageIo.observe(stage);
  }

  function frameUrl(index) {
    return `/assets/images/profile-frames/frame-${String(index + 1).padStart(4, "0")}.webp`;
  }

  function setLoadingProgress() {
    const denom = Math.max(initialFrameCount, 1);
    root.style.setProperty(
      "--profile-scroll-progress",
      `${Math.min(100, (loadedCount / denom) * 100)}%`
    );
  }

  function windowRange(center) {
    return [
      Math.max(0, center - KEEP_BEHIND),
      Math.min(totalFrames - 1, center + KEEP_AHEAD),
    ];
  }

  function releaseFrame(index) {
    const frame = frames[index];
    if (!frame) return;
    if (frame instanceof HTMLImageElement) frame.src = "";
    frames[index] = undefined;
  }

  function evictFarFrames(center) {
    const [start, end] = windowRange(center);
    for (let i = 0; i < totalFrames; i += 1) {
      if (i >= start && i <= end) continue;
      if (i === drawnFrame || i === currentFrame) continue;
      releaseFrame(i);
    }
  }

  async function ensureFrame(index) {
    if (frames[index]) return frames[index];
    if (inflight.has(index)) return inflight.get(index);

    const pending = (async () => {
      const img = new Image();
      img.decoding = "async";
      if (index < initialFrameCount) img.fetchPriority = "high";
      img.src = frameUrl(index);
      await img.decode();
      frames[index] = img;
      loadedCount += 1;
      inflight.delete(index);
      setLoadingProgress();
      queueUpdate();
      return img;
    })().catch((error) => {
      inflight.delete(index);
      throw error;
    });

    inflight.set(index, pending);
    return pending;
  }

  function ensureWindow(center) {
    const [start, end] = windowRange(center);
    for (let i = start; i <= end; i += 1) {
      if (!frames[i] && !inflight.has(i)) ensureFrame(i);
    }
    evictFarFrames(center);
  }

  function setPhase(progress) {
    const keep = progress >= 0.35 && progress < 0.63;
    const thanks = progress >= 0.63;
    const complete = progress >= 1;
    const hint = progress > 0.04 && progress < 1;

    if (keep !== lastKeep) {
      section.classList.toggle("profile-scroll-keep", keep);
      lastKeep = keep;
    }
    if (thanks !== lastThanks) {
      section.classList.toggle("profile-scroll-thanks", thanks);
      lastThanks = thanks;
    }
    if (complete !== lastComplete) {
      section.classList.toggle("profile-scroll-complete", complete);
      lastComplete = complete;
    }
    if (hint !== lastHint) {
      section.classList.toggle("profile-scroll-hint-scrolling", hint);
      lastHint = hint;
    }

    const progressBucket = Math.round(progress * 50);
    if (progressBucket !== lastProgressBucket) {
      lastProgressBucket = progressBucket;
      section.style.setProperty("--profile-hint-progress", String(progress));
    }

    const exitStart = 0.88;
    const exitRaw =
      progress > exitStart ? (progress - exitStart) / (1 - exitStart) : 0;
    const exitBucket = Math.round(clamp(exitRaw, 0, 1) * 40);
    if (exitBucket !== lastExitBucket) {
      lastExitBucket = exitBucket;
      section.style.setProperty(
        "--profile-hint-exit",
        String(clamp(exitRaw, 0, 1))
      );
    }
  }

  function updateTargetFrame() {
    if (maxScroll <= 0) {
      currentFrame = 0;
      if (lastKeep || lastThanks || lastComplete || lastHint) {
        section.classList.remove(
          "profile-scroll-complete",
          "profile-scroll-thanks",
          "profile-scroll-keep",
          "profile-scroll-hint-scrolling"
        );
        lastKeep = lastThanks = lastComplete = lastHint = false;
      }
      section.style.removeProperty("--profile-hint-progress");
      section.style.removeProperty("--profile-hint-exit");
      lastProgressBucket = -1;
      lastExitBucket = -1;
      return;
    }

    const progress = clamp((window.scrollY - startY) / maxScroll, 0, 1);
    currentFrame = Math.min(
      Math.floor(progress * (totalFrames - 1)),
      totalFrames - 1
    );
    setPhase(progress);
  }

  function drawFrame(index) {
    const frame = frames[index];
    if (!frame) return;
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

  function queueUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      updateTargetFrame();
      if (currentFrame !== lastEnsured) {
        lastEnsured = currentFrame;
        ensureWindow(currentFrame);
      }
      if (!readyToDraw || document.hidden || !stageVisible) return;
      const drawableFrame = closestLoadedFrameIndex(currentFrame);
      if (drawableFrame !== null && drawableFrame !== drawnFrame) {
        drawFrame(drawableFrame);
      }
    });
  }

  async function preloadInitialFrames() {
    await Promise.all(
      Array.from({ length: initialFrameCount }, (_, index) => ensureFrame(index))
    );
    readyToDraw = true;
    measure();
    updateTargetFrame();
    drawFrame(closestLoadedFrameIndex(currentFrame) ?? 0);
    root.classList.add("is-ready");
    lastEnsured = currentFrame;
    ensureWindow(currentFrame);
  }

  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      measure();
      queueUpdate();
    },
    { passive: true }
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) queueUpdate();
  });

  preloadInitialFrames().catch((error) => {
    console.error(error);
    section.classList.remove("profile-scroll-active");
  });
})();
