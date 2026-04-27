(function () {
  const forms = document.querySelectorAll("[data-newsletter-form]");
  if (!forms.length) return;

  const frameName = "buttondown-newsletter-frame";
  let frame = document.querySelector(`iframe[name="${frameName}"]`);
  let activeForm = null;
  let fallbackTimer = 0;

  if (!(frame instanceof HTMLIFrameElement)) {
    frame = document.createElement("iframe");
    frame.name = frameName;
    frame.title = "Newsletter subscription response";
    frame.hidden = true;
    document.body.appendChild(frame);
  }

  function setStatus(form, message, state) {
    const status = form
      .closest(".newsletter-signup")
      ?.querySelector("[data-newsletter-status]");
    const button = form.querySelector("button[type='submit']");

    if (status) {
      status.textContent = message;
    }

    if (button instanceof HTMLButtonElement) {
      button.disabled = state === "loading";
      button.textContent = state === "loading" ? "Subscribing..." : "Subscribe";
    }
  }

  function onSubscribeSuccess(form) {
    if (form && form.closest("#newsletterSignupModal")) {
      document.dispatchEvent(
        new CustomEvent("vlblog:newsletter-subscribed", {
          detail: { inModal: true },
        })
      );
    }
  }

  frame.addEventListener("load", function () {
    if (!activeForm) return;

    window.clearTimeout(fallbackTimer);
    setStatus(
      activeForm,
      "Almost done. Check your inbox to confirm the subscription. If you do not see it, check spam or junk.",
      "success"
    );
    onSubscribeSuccess(activeForm);
    activeForm.reset();
    activeForm = null;
  });

  forms.forEach((form) => {
    form.addEventListener("submit", function () {
      activeForm = form;
      form.target = frameName;
      setStatus(form, "Submitting. The confirmation email is the important part.", "loading");

      fallbackTimer = window.setTimeout(function () {
        if (!activeForm) return;

        setStatus(
          activeForm,
          "Almost done. Check your inbox to confirm the subscription. If you do not see it, check spam or junk.",
          "success"
        );
        onSubscribeSuccess(activeForm);
        activeForm.reset();
        activeForm = null;
      }, 3000);
    });
  });
})();
