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

    // Paper cards: Abstract and BibTeX open in place, one at a time per card.
    document.querySelectorAll(".publication-card").forEach((card) => {
      const toggles = [...card.querySelectorAll(".paper-toggle")];
      toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const open = toggle.getAttribute("aria-expanded") === "true";
          toggles.forEach((other) => {
            const panel = document.getElementById(other.getAttribute("aria-controls"));
            const show = other === toggle && !open;
            other.setAttribute("aria-expanded", String(show));
            if (panel) panel.hidden = !show;
          });
        });
      });

      const copy = card.querySelector(".paper-copy");
      if (copy) {
        const label = copy.textContent;
        copy.addEventListener("click", async () => {
          const text = copy.parentElement.querySelector("code").textContent;
          try {
            await navigator.clipboard.writeText(text);
            copy.textContent = "Copied";
          } catch (error) {
            // Clipboard access can be refused; select the text so Cmd/Ctrl+C works.
            const range = document.createRange();
            range.selectNodeContents(copy.parentElement.querySelector("code"));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            copy.textContent = "Selected — press Ctrl/Cmd+C";
          }
          window.setTimeout(() => { copy.textContent = label; }, 1800);
        });
      }
    });

    // Paper teasers play while the pointer is over the figure. The button
    // does the same for touch and keyboard, and is the only trigger when
    // the visitor prefers reduced motion or is saving data.
    const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    document.querySelectorAll("[data-paper-teaser]").forEach((media) => {
      const teaser = media.querySelector("video");
      const button = media.querySelector(".paper-teaser__button");
      if (!teaser || !button) return;
      let pinned = false;
      const setPlaying = (playing) => {
        media.classList.toggle("is-playing", playing);
        button.setAttribute("aria-pressed", String(playing));
        button.textContent = playing ? "Pause preview" : "Play preview";
      };
      const start = () => teaser.play().then(() => setPlaying(true)).catch(() => {});
      const stop = () => { teaser.pause(); setPlaying(false); };
      button.addEventListener("click", () => {
        pinned = teaser.paused;
        if (teaser.paused) start(); else stop();
      });
      if (!reduceMotion && !saveData) {
        media.addEventListener("mouseenter", () => { if (hoverPointer.matches && !pinned) start(); });
        media.addEventListener("mouseleave", () => { if (hoverPointer.matches && !pinned) stop(); });
      }
    });

    // Photo wall: a pause control for the drift, and a native dialog that
    // shows each photograph full size. Esc closes it, arrow keys and the
    // buttons step through in colour order (left to right across the rows),
    // and a click on the dark area closes it.
    const wall = document.querySelector(".photo-wall");
    const lightbox = document.querySelector(".photo-lightbox");
    if (wall) {
      const pause = wall.querySelector(".photo-wall__pause");
      const setPaused = (paused) => {
        wall.classList.toggle("is-paused", paused);
        if (pause) {
          pause.setAttribute("aria-pressed", String(paused));
          pause.textContent = paused ? "Play motion" : "Pause motion";
        }
      };
      pause?.addEventListener("click", () => setPaused(!wall.classList.contains("is-paused")));

      const originals = [...wall.querySelectorAll(".photo-wall__set:not([aria-hidden]) .photo-wall__tile")]
        .sort((a, b) => a.offsetLeft - b.offsetLeft);
      const order = new Map(originals.map((tile, index) => [tile.dataset.photoFile, index]));
      originals.forEach((tile, index) => {
        tile.setAttribute("aria-label", `Open photograph ${index + 1} of ${originals.length}`);
      });

      if (lightbox && originals.length && typeof lightbox.showModal === "function") {
        const image = lightbox.querySelector("img");
        const caption = lightbox.querySelector("figcaption");
        let current = 0;
        let opener = null;
        let wasPaused = false;
        const show = (index) => {
          current = (index + originals.length) % originals.length;
          const tile = originals[current];
          const alt = tile.querySelector("img").alt;
          image.src = tile.dataset.photoFull;
          image.width = Number(tile.dataset.photoWidth);
          image.height = Number(tile.dataset.photoHeight);
          image.alt = alt || `Photograph ${current + 1}`;
          caption.textContent = `${alt ? `${alt} · ` : ""}${current + 1} / ${originals.length}`;
        };
        wall.querySelectorAll(".photo-wall__tile").forEach((tile) => {
          tile.addEventListener("click", () => {
            opener = tile;
            wasPaused = wall.classList.contains("is-paused");
            setPaused(true);
            show(order.get(tile.dataset.photoFile) ?? 0);
            lightbox.showModal();
          });
        });
        lightbox.querySelector(".photo-lightbox__nav--prev").addEventListener("click", () => show(current - 1));
        lightbox.querySelector(".photo-lightbox__nav--next").addEventListener("click", () => show(current + 1));
        lightbox.querySelector(".photo-lightbox__close").addEventListener("click", () => lightbox.close());
        lightbox.addEventListener("click", (event) => {
          if (event.target === lightbox) lightbox.close();
        });
        lightbox.addEventListener("keydown", (event) => {
          if (event.key === "ArrowLeft") show(current - 1);
          if (event.key === "ArrowRight") show(current + 1);
        });
        lightbox.addEventListener("close", () => {
          setPaused(wasPaused);
          // preventScroll: focusing inside the clipped rows must not shift them.
          opener?.focus({ preventScroll: true });
        });
      }
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
