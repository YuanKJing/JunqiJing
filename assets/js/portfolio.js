(() => {
  const initPortfolio = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const root = document.documentElement;
    const skipLink = document.querySelector(".skip-link");

    if (skipLink && document.body.firstElementChild !== skipLink) {
      document.body.prepend(skipLink);
    }

    root.classList.add("portfolio-ready");

    const homeTitle = document.querySelector("[data-home-title-write]");
    if (homeTitle && root.classList.contains("portfolio-motion") && !reduceMotion) {
      // Write the banner line once its handwriting face is ready, so the ink
      // wipe never reveals fallback glyphs.
      const fontsReady = document.fonts?.ready || Promise.resolve();
      fontsReady.then(() => {
        window.requestAnimationFrame(() => homeTitle.classList.add("is-writing"));
      });
    }

    // Only morph the chapter photograph between pages when it is on screen;
    // otherwise it would fly in from above the viewport.
    window.addEventListener("pageswap", (event) => {
      if (!event.viewTransition) return;
      const photo = document.querySelector(".home-hero__media, .chapter-visual");
      if (photo && photo.getBoundingClientRect().bottom <= 0) {
        photo.style.viewTransitionName = "none";
      }
    });

    const videos = [...document.querySelectorAll("[data-robot-video]")];
    // Offer a single muted preview on desktop. After it stops, the native
    // controls own playback, including after scrolling or switching tabs.
    const previewDevice = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    const previewed = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (!entry.isIntersecting) {
          video.pause();
        } else if (entry.intersectionRatio >= 0.5 && !document.hidden && previewDevice.matches
                   && !reduceMotion && !saveData && !previewed.has(video)) {
          previewed.add(video);
          video.play().catch(() => {});
        }
      }
    }, { threshold: [0, 0.5] });

    for (const video of videos) {
      const card = video.closest(".demo-card");
      video.addEventListener("play", () => {
        previewed.add(video);
        card?.classList.add("is-playing");
      });
      video.addEventListener("pause", () => card?.classList.remove("is-playing"));
      video.addEventListener("ended", () => card?.classList.remove("is-playing"));
      observer.observe(video);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) videos.forEach(video => video.pause());
    });

    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest?.("a");
        const selection = window.getSelection();
        if (!link || !selection || selection.isCollapsed || !selection.toString().trim()) return;
        if (selection.containsNode(link, true)) event.preventDefault();
      },
      true,
    );

    const normalizedPath = (value) => value.replace(/\/+$/, "") || "/";
    const currentPath = normalizedPath(window.location.pathname);
    document.querySelectorAll("#nav-menu a").forEach((link) => {
      const linkUrl = new URL(link.href, window.location.href);
      const isCurrentPage = normalizedPath(linkUrl.pathname) === currentPath;
      link.classList.toggle("is-current", isCurrentPage);
      if (isCurrentPage) link.setAttribute("aria-current", "page");
      else if (!link.hash) link.removeAttribute("aria-current");
    });

    const navLinks = [...document.querySelectorAll('#nav-menu a[href*="#"]')];
    const navTargets = navLinks
      .map((link) => {
        const hash = new URL(link.href, window.location.href).hash;
        const section =
          hash === "#home"
            ? document.querySelector('[data-nav-section="home"]')
            : hash
              ? document.querySelector(hash)
              : null;
        return section ? { id: hash.slice(1), link, section } : null;
      })
      .filter(Boolean);

    if (navTargets.length) {
      const setCurrent = (id) => {
        navTargets.forEach(({ id: targetId, link }) => {
          const current = targetId === id;
          link.classList.toggle("is-current", current);
          if (current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      };

      setCurrent("home");

      const navObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          const match = navTargets.find(({ section }) => section === visible.target);
          if (match) setCurrent(match.id);
        },
        {
          rootMargin: "-12% 0px -68% 0px",
          threshold: [0.01, 0.12, 0.3],
        },
      );

      navTargets.forEach(({ section }) => navObserver.observe(section));
    }

    const navToggle = document.querySelector("#nav-toggle");
    const navToggleLabel = document.querySelector('label[for="nav-toggle"]');

    const syncNavState = () => {
      if (!navToggle || !navToggleLabel) return;
      navToggleLabel.setAttribute("aria-expanded", String(navToggle.checked));
      navToggleLabel.setAttribute("aria-label", navToggle.checked ? "Close menu" : "Open menu");
    };

    if (navToggle && navToggleLabel) {
      navToggleLabel.setAttribute("role", "button");
      navToggleLabel.setAttribute("tabindex", "0");
      navToggleLabel.setAttribute("aria-controls", "nav-menu");
      syncNavState();

      navToggle.addEventListener("change", syncNavState);
      navToggleLabel.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        navToggle.checked = !navToggle.checked;
        navToggle.dispatchEvent(new Event("change"));
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !navToggle.checked) return;
        navToggle.checked = false;
        syncNavState();
        navToggleLabel.focus();
      });
    }

    document.querySelectorAll("#nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        if (!navToggle) return;
        navToggle.checked = false;
        syncNavState();
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio, { once: true });
  } else {
    initPortfolio();
  }
})();
