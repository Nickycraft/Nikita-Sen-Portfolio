/* Nikita Sen portfolio — interactions
   theme toggle · cursor pill · scroll reveal · header state · mobile menu */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle (light / dark, persisted) ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  var root = document.documentElement;

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("ns-theme", theme);
    } catch (e) {}
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
    setTheme(currentTheme());
  }

  /* ---------- header state on scroll ---------- */
  var header = document.getElementById("site-header");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY >= 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var open = hamburger.classList.toggle("is-open");
      mobileMenu.classList.toggle("is-open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (!mobileMenu.classList.contains("is-open")) return;
      if (header.contains(e.target)) return;
      closeMenu();
    });
  }

  /* ---------- smooth scroll (accounts for fixed header) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(top, 0), behavior: prefersReduced ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.setAttribute("data-shown", "");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- custom cursor pill ---------- */
  var pill = document.getElementById("cursor-pill");
  var pillText = document.getElementById("cursor-text");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (pill && pillText && canHover && !prefersReduced) {
    pill.style.display = "block";

    var mouseX = -200;
    var mouseY = -200;
    var pillX = -200;
    var pillY = -200;
    var typeTimer = null;
    var hideTimer = null;

    document.addEventListener("pointermove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function typeText(text) {
      clearTimeout(typeTimer);
      pillText.innerHTML = "";
      var i = 0;
      (function step() {
        if (i <= text.length) {
          pillText.innerHTML = text.slice(0, i) + '<span class="caret">|</span>';
          i++;
          typeTimer = setTimeout(step, 32);
        } else {
          pillText.textContent = text;
        }
      })();
    }

    function showPill(text) {
      clearTimeout(hideTimer);
      typeText(text);
      pill.classList.add("is-visible");
      hideTimer = setTimeout(hidePill, 3800);
    }

    function hidePill() {
      pill.classList.remove("is-visible");
    }

    document.addEventListener("pointerover", function (e) {
      var host = e.target.closest("[data-cursor]");
      if (host) {
        var label = host.getAttribute("data-cursor");
        if (label) showPill(label);
      }
    });

    (function loop() {
      pillX += (mouseX - pillX) * 0.28;
      pillY += (mouseY - pillY) * 0.28;
      pill.style.transform = "translate3d(" + (pillX + 14) + "px," + (pillY + 16) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- pause other videos when one plays ---------- */
  var videos = document.querySelectorAll(".work-media-video video");
  videos.forEach(function (video) {
    video.addEventListener("play", function () {
      videos.forEach(function (other) {
        if (other !== video) other.pause();
      });
    });
  });
})();
