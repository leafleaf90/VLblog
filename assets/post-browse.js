(function () {
  if (window.__postBrowseScriptLoaded) {
    return;
  }
  window.__postBrowseScriptLoaded = true;

  function initFromConfigElement(configEl) {
    if (
      !configEl ||
      configEl.getAttribute("data-post-browse-wired") === "1" ||
      configEl.getAttribute("data-post-browse-init") === "1"
    ) {
      return;
    }

    const root = configEl.parentElement;
    if (!root || !root.matches(".post-browse-root[data-post-browse]")) {
      return;
    }

    const filterBtns = root.querySelectorAll(".filter-btn");
    const topicBtns = root.querySelectorAll(".topic-filter-btn");
    const topicGroups = root.querySelectorAll(".topic-filter-group");
    const grid = root.querySelector("[data-post-browse-grid]");
    if (!grid) {
      return;
    }
    const postCards = grid.querySelectorAll(".post-card");

    let config;
    try {
      config = JSON.parse(configEl.textContent);
    } catch (e) {
      return;
    }

    const SECTION_LABELS = config.sectionLabels || {};
    const headingId = config.postsHeadingId || "posts-list-heading";
    const scrollId = config.scrollTargetId || headingId;
    const initialLimit = Boolean(config.initialLimit);
    const postsTitleBase = config.postsTitleBase || config.postsTitle || "Posts";

    const sectionTitle = document.getElementById(headingId);
    const scrollTarget = document.getElementById(scrollId) || sectionTitle;

    const groupFilters = Array.from(filterBtns)
      .map((b) => b.dataset.filter)
      .filter((f) => f && f !== "all");
    const VALID_GROUPS = groupFilters.length
      ? groupFilters
      : Object.keys(SECTION_LABELS);
    const defaultGroup =
      config.defaultGroup || groupFilters[0] || VALID_GROUPS[0] || "code";

    function syncFilterToUrl(filter, topic) {
      const path = location.pathname || "/";
      const sp = new URLSearchParams();
      if (filter && filter !== "all") {
        sp.set("group", filter);
      }
      if (topic) {
        sp.set("topic", topic);
      }
      const qs = sp.toString();
      history.replaceState(null, "", qs ? path + "?" + qs : path);
    }

    function setActiveSection(filter) {
      filterBtns.forEach((btn) => {
        const f = btn.dataset.filter;
        if (f === "all") {
          btn.classList.toggle("active", filter === "all");
        } else {
          btn.classList.toggle("active", f === filter);
        }
      });
    }

    function setActiveTopic(activeBtn) {
      topicBtns.forEach((btn) => {
        btn.classList.toggle("active", btn === activeBtn);
      });
    }

    function updateTopicGroups(filter) {
      topicGroups.forEach((group) => {
        group.hidden = filter !== "all" && group.dataset.topicGroup !== filter;
      });
    }

    function getPostCategories(card) {
      return (card.dataset.categories || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    function isInitiallyHiddenCard(card) {
      return card.dataset.initiallyHidden === "true";
    }

    function formatPostsLabel(prefix, count) {
      const noun = count === 1 ? "Post" : "Posts";
      return `${prefix} ${noun} (${count})`;
    }

    const params = new URLSearchParams(location.search);
    const hasUrlFilter = params.has("group") || params.has("topic");

    let userChoseFilter = false;

    function countVisible(cards) {
      return Array.from(cards).filter((c) => c.style.display !== "none").length;
    }

    function applyFilter(filter, options) {
      const scroll = options.scroll !== false;
      const syncUrl = options.syncUrl !== false;
      const fromUrl = Boolean(options.fromUrl);

      if (!fromUrl || hasUrlFilter) {
        userChoseFilter = true;
      }

      setActiveSection(filter);
      setActiveTopic(null);
      updateTopicGroups(filter);

      const respectInitialCap = initialLimit && !userChoseFilter;

      postCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        const hiddenByCap = isInitiallyHiddenCard(card) && respectInitialCap;
        const shouldShow = matches && !hiddenByCap;
        card.style.display = shouldShow ? "block" : "none";
      });

      if (sectionTitle) {
        const label = filter === "all" ? null : SECTION_LABELS[filter];
        const base = label || postsTitleBase;
        sectionTitle.textContent = formatPostsLabel(base, countVisible(postCards));
      }

      if (syncUrl) {
        syncFilterToUrl(filter, null);
      }

      if (scroll && scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function applyTopicFilter(topicBtn, options) {
      const scroll = options.scroll !== false;
      const syncUrl = options.syncUrl !== false;
      const fromUrl = Boolean(options.fromUrl);

      if (!fromUrl || hasUrlFilter) {
        userChoseFilter = true;
      }

      const topic = topicBtn.dataset.topic;
      const parentGroup = topicBtn.dataset.topicGroup;
      const topicLabel = topicBtn.dataset.topicLabel || topic;

      setActiveSection(parentGroup);
      setActiveTopic(topicBtn);
      updateTopicGroups(parentGroup);

      postCards.forEach((card) => {
        const shouldShow = getPostCategories(card).includes(topic);
        card.style.display = shouldShow ? "block" : "none";
      });

      if (sectionTitle) {
        sectionTitle.textContent = formatPostsLabel(
          topicLabel,
          countVisible(postCards)
        );
      }

      if (syncUrl) {
        syncFilterToUrl(parentGroup, topic);
      }

      if (scroll && scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        applyFilter(this.dataset.filter, {});
      });
    });

    topicBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        applyTopicFilter(this, {});
      });
    });

    const groupParam = (params.get("group") || "").trim().toLowerCase();
    const topicParam = (params.get("topic") || "").trim().toLowerCase();
    const topicParamBtn = Array.from(topicBtns).find(
      (b) => b.dataset.topic === topicParam
    );

    if (topicParamBtn) {
      applyTopicFilter(topicParamBtn, {
        scroll: true,
        syncUrl: true,
        fromUrl: true,
      });
    } else if (groupParam === "all") {
      applyFilter("all", { scroll: true, syncUrl: true, fromUrl: true });
    } else if (groupParam && VALID_GROUPS.includes(groupParam)) {
      applyFilter(groupParam, { scroll: true, syncUrl: true, fromUrl: true });
    } else {
      applyFilter(defaultGroup, { scroll: false, syncUrl: false, fromUrl: true });
    }

    configEl.setAttribute("data-post-browse-init", "1");
    configEl.setAttribute("data-post-browse-wired", "1");
  }

  function init() {
    document
      .querySelectorAll('script[type="application/json"][id^="post-browse-config-"]')
      .forEach((el) => initFromConfigElement(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
