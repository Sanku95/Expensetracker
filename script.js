(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var nav = document.getElementById("site-nav");
  var navToggle = document.querySelector(".nav-toggle");

  /* Header state */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile navigation */
  if (header && nav && navToggle) {
    var closeNav = function () {
      header.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    };

    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (header.classList.contains("is-open") && !header.contains(event.target)) {
        closeNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Persona switcher */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".persona-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".persona-panel"));

  function activatePersona(tab, moveFocus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(function (panel) {
      var selected = panel.getAttribute("data-panel") === tab.getAttribute("data-persona");
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);

      if (selected && !reduceMotion) {
        var meterBar = panel.querySelector(".meter span");
        if (meterBar) {
          var targetWidth = meterBar.style.width || "74%";
          meterBar.style.transition = "none";
          meterBar.style.width = "0%";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              meterBar.style.transition = "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
              meterBar.style.width = targetWidth;
            });
          });
        }
        var catBars = panel.querySelectorAll(".cat-bar i");
        catBars.forEach(function (bar, bIdx) {
          var cTarget = bar.style.width;
          bar.style.transition = "none";
          bar.style.width = "0%";
          setTimeout(function () {
            bar.style.transition = "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
            bar.style.width = cTarget;
          }, 60 + bIdx * 40);
        });
      }
    });

    if (moveFocus) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activatePersona(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      var next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }

      if (next) {
        event.preventDefault();
        activatePersona(next, true);
      }
    });
  });

  /* Scroll reveals */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach(function (item) {
      item.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* Hero saving tip: count-up synced with the phone mockup entrance */
  var tipAmount = document.querySelector(".float-card__amount");

  if (tipAmount && !reduceMotion) {
    var tipTarget = parseFloat(tipAmount.getAttribute("data-count-to") || "0", 10);
    var tipPrefix = tipAmount.getAttribute("data-count-prefix") || "";
    var tipStart = null;
    var tipDuration = 1200;

    var settleTip = function () {
      tipAmount.textContent = tipPrefix + tipTarget;
    };

    var tickTip = function (stamp) {
      if (tipStart === null) tipStart = stamp;
      var progress = Math.min((stamp - tipStart) / tipDuration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      tipAmount.textContent = tipPrefix + Math.round(tipTarget * eased);
      if (progress < 1) {
        window.requestAnimationFrame(tickTip);
      } else {
        settleTip();
      }
    };

    window.requestAnimationFrame(function (stamp) {
      tipStart = stamp;
      tickTip(stamp);
    });

    /* guarantee the final value even if frames are throttled */
    window.setTimeout(settleTip, tipDuration + 300);
  }
})();
