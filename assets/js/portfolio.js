(() => {
  const initPortfolio = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);

    const allRevealItems = [...document.querySelectorAll("[data-reveal]")];
    const heroRevealItems = allRevealItems.filter((item) => item.closest(".portfolio-hero"));
    const revealItems = allRevealItems.filter((item) => !item.closest(".portfolio-hero"));
    if (document.documentElement.classList.contains("portfolio-motion") && !reduceMotion) {
      window.requestAnimationFrame(() => {
        heroRevealItems.forEach((item, index) => {
          item.style.transitionDelay = `${Math.min(index, 6) * 45}ms`;
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
          threshold: 0.12,
        },
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      allRevealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const videos = [...document.querySelectorAll("[data-robot-video]")];
    let activeVideo = null;

    const pauseVideo = (video) => {
      if (!video || video.paused) return;
      video.pause();
    };

    if (videos.length && !reduceMotion && !saveData) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
            .forEach((entry) => {
              const video = entry.target;
              if (entry.isIntersecting && entry.intersectionRatio >= 0.58) {
                if (activeVideo && activeVideo !== video) pauseVideo(activeVideo);
                activeVideo = video;
                video.muted = true;
                const playRequest = video.play();
                if (playRequest) playRequest.catch(() => {});
              } else if (activeVideo === video || !entry.isIntersecting) {
                pauseVideo(video);
                if (activeVideo === video) activeVideo = null;
              }
            });
        },
        {
          threshold: [0, 0.25, 0.58, 0.8],
        },
      );

      videos.forEach((video) => videoObserver.observe(video));
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        videos.forEach(pauseVideo);
        activeVideo = null;
      }
    });

    const navLinks = [
      ...document.querySelectorAll('#nav-menu a[href*="#"]'),
    ];
    const navTargets = navLinks
      .map((link) => {
        const hash = new URL(link.href, window.location.href).hash;
        const section = hash ? document.querySelector(hash) : null;
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    if (navTargets.length) {
      const setCurrent = (id) => {
        navTargets.forEach(({ link, section }) => {
          const current = section.id === id;
          link.classList.toggle("is-current", current);
          if (current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      };

      const navObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setCurrent(visible.target.id);
        },
        {
          rootMargin: "-18% 0px -64% 0px",
          threshold: [0.02, 0.2, 0.5],
        },
      );

      navTargets.forEach(({ section }) => navObserver.observe(section));
    }

    const navToggle = document.querySelector("#nav-toggle");
    document.querySelectorAll("#nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navToggle) navToggle.checked = false;
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio, { once: true });
  } else {
    initPortfolio();
  }
})();
