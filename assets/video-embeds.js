document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".video-embed video").forEach((video) => {
    const figure = video.closest(".video-embed");
    if (!figure || figure.querySelector(".video-embed__play")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "video-embed__play";
    button.textContent = "Play";
    button.setAttribute("aria-label", "Play video");

    const resetButton = () => {
      button.disabled = false;
      button.textContent = "Play";
    };

    const waitUntilCanPlay = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(resolve, 5000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("loadeddata", handleCanPlay);
          video.removeEventListener("error", handleError);
        };

        const handleCanPlay = () => {
          cleanup();
          resolve();
        };

        const handleError = () => {
          cleanup();
          reject(new Error("Video failed to load"));
        };

        video.addEventListener("canplay", handleCanPlay, { once: true });
        video.addEventListener("loadeddata", handleCanPlay, { once: true });
        video.addEventListener("error", handleError, { once: true });
      });
    };

    const startVideo = async ({ muted = false } = {}) => {
      video.muted = muted;
      video.load();
      await waitUntilCanPlay();
      await video.play();
    };

    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Loading";

      try {
        await startVideo();
      } catch (error) {
        // Some embedded/browser-preview contexts reject audible play(), even after a click.
        // Starting muted keeps the video playable; the native controls still allow unmuting.
        try {
          await startVideo({ muted: true });
        } catch (mutedError) {
          figure.classList.remove("is-playing");
          resetButton();
        }
      }
    });

    video.addEventListener("playing", () => {
      figure.classList.add("is-playing");
      resetButton();
    });

    video.addEventListener("pause", () => {
      figure.classList.remove("is-playing");
      resetButton();
    });

    video.addEventListener("ended", () => {
      figure.classList.remove("is-playing");
      resetButton();
    });

    video.addEventListener("error", () => {
      figure.classList.remove("is-playing");
      resetButton();
    });

    figure.insertBefore(button, video.nextSibling);
  });
});
