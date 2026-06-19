(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-dot') || '0');
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  const list = document.querySelector('[data-movie-list]');
  const listSearch = document.querySelector('[data-list-search]');
  const regionSelect = document.querySelector('[data-list-region]');
  const kindSelect = document.querySelector('[data-list-kind]');

  if (list) {
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const regions = new Set();
    const kinds = new Set();

    cards.forEach(function (card) {
      const region = card.getAttribute('data-region') || '';
      const kind = card.getAttribute('data-genre') || '';
      if (region) {
        regions.add(region);
      }
      kind.split(/[，,、/ ]+/).forEach(function (part) {
        if (part) {
          kinds.add(part);
        }
      });
    });

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      Array.from(values).sort().forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(regionSelect, regions);
    fillSelect(kindSelect, kinds);

    function filterList() {
      const query = (listSearch && listSearch.value ? listSearch.value : '').trim().toLowerCase();
      const region = regionSelect && regionSelect.value ? regionSelect.value : '';
      const kind = kindSelect && kindSelect.value ? kindSelect.value : '';

      cards.forEach(function (card) {
        const haystack = card.getAttribute('data-search') || '';
        const cardRegion = card.getAttribute('data-region') || '';
        const cardKind = card.getAttribute('data-genre') || '';
        const matchedQuery = !query || haystack.indexOf(query) !== -1;
        const matchedRegion = !region || cardRegion === region;
        const matchedKind = !kind || cardKind.indexOf(kind) !== -1;
        card.style.display = matchedQuery && matchedRegion && matchedKind ? '' : 'none';
      });
    }

    [listSearch, regionSelect, kindSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterList);
        control.addEventListener('change', filterList);
      }
    });
  }

  const forms = Array.from(document.querySelectorAll('[data-site-search]'));
  const searchData = window.SEARCH_MOVIES || [];

  function renderSearch(panel, query) {
    const words = query.trim().toLowerCase();
    if (!panel || !words) {
      if (panel) {
        panel.classList.remove('open');
        panel.innerHTML = '';
      }
      return;
    }

    const results = searchData.filter(function (movie) {
      return movie.text.indexOf(words) !== -1;
    }).slice(0, 12);

    panel.innerHTML = results.length ? results.map(function (movie) {
      return '<a class="search-item" href="' + movie.url + '">' +
        '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + movie.title + '</strong><span>' + movie.meta + '</span></span>' +
        '</a>';
    }).join('') : '<div class="search-item"><span><strong>暂无匹配影片</strong><span>可尝试更换关键词</span></span></div>';
    panel.classList.add('open');
  }

  forms.forEach(function (form) {
    const input = form.querySelector('input[type="search"]');
    const panel = form.querySelector('[data-search-panel]');
    if (!input || !panel) {
      return;
    }

    input.addEventListener('input', function () {
      renderSearch(panel, input.value);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const first = panel.querySelector('a');
      if (first) {
        window.location.href = first.href;
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('open');
      }
    });
  });

  const player = document.querySelector('[data-player]');

  if (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const url = player.getAttribute('data-play');
    let ready = false;
    let hls = null;

    function attachPlayer() {
      if (!video || !url || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attachPlayer();
      player.classList.add('playing');
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
