(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const next = document.querySelector(".hero-next");
  const prev = document.querySelector(".hero-prev");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startSlider() {
    if (slides.length <= 1) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.dataset.slide || 0));
      startSlider();
    });
  });

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startSlider();
    });
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      startSlider();
    });
  }

  startSlider();

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      const box = image.closest(".poster, .hero-poster, .detail-poster, .category-cover, .rank-row, .search-result-item");
      if (box) {
        box.classList.add("image-fallback");
      }
      image.style.opacity = "0";
    });
  });

  function attachStream(video) {
    const stream = video.getAttribute("data-stream");

    if (!stream) {
      return Promise.resolve();
    }

    if (video.dataset.ready === "1") {
      return video.play();
    }

    video.dataset.ready = "1";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return video.play();
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve(video.play());
        });
      });
    }

    video.src = stream;
    return video.play();
  }

  document.querySelectorAll(".video-box").forEach(function (box) {
    const video = box.querySelector("video");
    const button = box.querySelector(".video-play");

    if (!video || !button) {
      return;
    }

    function begin() {
      attachStream(video).then(function () {
        box.classList.add("playing");
      }).catch(function () {
        box.classList.add("playing");
        video.controls = true;
      });
    }

    button.addEventListener("click", begin);
    video.addEventListener("play", function () {
      box.classList.add("playing");
    });
  });

  document.querySelectorAll(".filter-bar").forEach(function (bar) {
    const input = bar.querySelector(".filter-input");
    const year = bar.querySelector(".filter-year");
    const grid = bar.parentElement.querySelector(".category-movie-grid");

    if (!input || !year || !grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    function applyFilter() {
      const q = input.value.trim().toLowerCase();
      const selected = year.value;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(" ").toLowerCase();
        const cardYear = Number(card.dataset.year || 0);
        const keywordOk = !q || text.indexOf(q) !== -1;
        const yearOk = !selected || (selected === "2020" ? cardYear <= 2020 : String(cardYear) === selected);
        card.classList.toggle("is-hidden", !(keywordOk && yearOk));
      });
    }

    input.addEventListener("input", applyFilter);
    year.addEventListener("change", applyFilter);
  });

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchSummary = document.getElementById("searchSummary");

  if (searchInput && searchResults && searchSummary && Array.isArray(window.SITE_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    searchInput.value = initial;

    function renderSearch() {
      const q = searchInput.value.trim().toLowerCase();
      const items = window.SITE_INDEX.filter(function (item) {
        const text = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.category
        ].join(" ").toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 80);

      searchSummary.textContent = q ? "搜索结果" : "推荐浏览";
      searchResults.innerHTML = items.map(function (item) {
        return [
          "<a class=\"search-result-item\" href=\"" + item.url + "\">",
          "<img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
          "<span>",
          "<h2>" + escapeHtml(item.title) + "</h2>",
          "<p>" + escapeHtml(item.year + " · " + item.region + " · " + item.genre) + "</p>",
          "</span>",
          "</a>"
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    searchInput.addEventListener("input", renderSearch);
    renderSearch();
  }
})();
