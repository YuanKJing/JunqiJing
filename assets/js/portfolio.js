(() => {
  const initPortfolio = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const root = document.documentElement;
    const allRevealItems = [...document.querySelectorAll("[data-reveal]")];
    const skipLink = document.querySelector(".skip-link");

    if (skipLink && document.body.firstElementChild !== skipLink) {
      document.body.prepend(skipLink);
    }

    document.querySelectorAll(".research-areas, .demo-grid, .news-list, .journey-list").forEach((group) => {
      [...group.children]
        .filter((item) => item.matches("[data-reveal]"))
        .forEach((item, index) => {
          item.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 55}ms`);
        });
    });

    root.classList.add("portfolio-ready");

    const homeTitle = document.querySelector("[data-home-title-write]");
    if (homeTitle && root.classList.contains("portfolio-motion") && !reduceMotion) {
      const startHomeTitle = () => {
        const fontsReady = document.fonts?.ready || Promise.resolve();
        fontsReady.then(() => {
          window.requestAnimationFrame(() => homeTitle.classList.add("is-writing"));
        });
      };

      if (document.readyState === "complete") startHomeTitle();
      else window.addEventListener("load", startHomeTitle, { once: true });
    }

    if (root.classList.contains("portfolio-motion") && !reduceMotion) {
      const firstViewItems = allRevealItems.slice(0, 2);
      const laterItems = allRevealItems.filter((item) => !firstViewItems.includes(item));

      window.requestAnimationFrame(() => {
        firstViewItems.forEach((item, index) => {
          item.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 55}ms`);
          item.classList.add("is-visible");
        });
      });

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.1,
        },
      );

      laterItems.forEach((item) => revealObserver.observe(item));
    } else {
      allRevealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const videos = [...document.querySelectorAll("[data-robot-video]")];
    const visibleVideos = new Set();

    const pauseVideo = (video) => {
      if (!video) return;
      if (!video.paused) video.pause();
      video.closest(".demo-card")?.classList.remove("is-playing");
    };

    const playVideo = (video) => {
      if (!video) return;
      video.muted = true;
      const playRequest = video.play();
      if (playRequest) {
        playRequest
          .then(() => video.closest(".demo-card")?.classList.add("is-playing"))
          .catch(() => video.closest(".demo-card")?.classList.remove("is-playing"));
      }
    };

    videos.forEach((video) => {
      const card = video.closest(".demo-card");
      video.addEventListener("play", () => card?.classList.add("is-playing"));
      video.addEventListener("pause", () => card?.classList.remove("is-playing"));
      video.addEventListener("ended", () => card?.classList.remove("is-playing"));
    });

    if (videos.length && !reduceMotion && !saveData) {
      videos.forEach((video) => {
        video.autoplay = true;
      });

      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              visibleVideos.add(video);
              playVideo(video);
            } else {
              visibleVideos.delete(video);
              pauseVideo(video);
            }
          });
        },
        { threshold: [0, 0.25, 0.55, 0.8] },
      );

      videos.forEach((video) => videoObserver.observe(video));
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        videos.forEach(pauseVideo);
        return;
      }

      if (!reduceMotion && !saveData) visibleVideos.forEach(playVideo);
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
