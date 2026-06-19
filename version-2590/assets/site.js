(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var category = categoryFilter ? categoryFilter.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (category && card.getAttribute("data-category") !== category) {
          matched = false;
        }
        card.classList.toggle("is-hidden-card", !matched);
      });
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        searchInput.value = q;
      }
      searchInput.addEventListener("input", applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilters);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener("change", applyFilters);
    }
    if (searchInput || yearFilter || categoryFilter) {
      applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      var video = shell.querySelector(".video-player");
      var trigger = shell.querySelector("[data-player-trigger]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-source");
      var hls = null;

      function hideTrigger() {
        if (trigger) {
          trigger.classList.add("is-hidden");
        }
      }

      function ensureSource() {
        if (video.getAttribute("data-ready") === "yes") {
          return Promise.resolve();
        }
        video.setAttribute("data-ready", "yes");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            setTimeout(resolve, 1500);
          });
        }
        video.src = source;
        return Promise.resolve();
      }

      function startPlayback() {
        ensureSource().then(function () {
          hideTrigger();
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              video.controls = true;
            });
          }
        });
      }

      if (trigger) {
        trigger.addEventListener("click", startPlayback);
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", hideTrigger);
    });
  });
})();
