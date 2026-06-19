(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("open");
    });
  }

  function setupCarousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function(panel) {
      var scope = panel.parentElement.querySelector(".filter-scope");
      if (!scope) {
        return;
      }
      var input = panel.querySelector(".filter-input");
      var type = panel.querySelector(".filter-type");
      var year = panel.querySelector(".filter-year");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function apply() {
        var q = normalize(input && input.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = parseInt(year && year.value ? year.value : "0", 10);
        cards.forEach(function(card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
          var okQuery = !q || text.indexOf(q) !== -1;
          var okType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var okYear = !selectedYear || cardYear >= selectedYear;
          card.classList.toggle("is-filtered-out", !(okQuery && okType && okYear));
        });
      }

      [input, type, year].forEach(function(el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  window.MoviePlayer = {
    setup: function(source) {
      ready(function() {
        var video = document.getElementById("video-player");
        var cover = document.getElementById("play-cover");
        if (!video || !source) {
          return;
        }
        var hls = null;
        var attached = false;

        function attach() {
          if (attached) {
            return;
          }
          attached = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }

        function play() {
          attach();
          if (cover) {
            cover.classList.add("is-hidden");
          }
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function() {});
          }
        }

        if (cover) {
          cover.addEventListener("click", play);
        }
        video.addEventListener("click", function() {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function() {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
        window.addEventListener("pagehide", function() {
          if (hls && typeof hls.destroy === "function") {
            hls.destroy();
          }
        });
      });
    }
  };

  ready(function() {
    setupMenu();
    setupCarousel();
    setupFilters();
  });
})();
