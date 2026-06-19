(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function initMobileMenu() {
    var toggle = byId('mobile-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHeaderSearch() {
    var forms = document.querySelectorAll('[data-header-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var keyword = input ? input.value.trim() : '';
        if (keyword) {
          window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-dot]'));
    var current = 0;

    function show(index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.hidden = i !== current;
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
      var image = slides[current].getAttribute('data-bg');
      if (image) {
        hero.style.setProperty('--hero-image', 'url("' + image + '")');
      }
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var keyword = panel.querySelector('[data-filter-keyword]');
    var category = panel.querySelector('[data-filter-category]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var clear = panel.querySelector('[data-filter-clear]');

    function apply() {
      var k = normalize(keyword && keyword.value);
      var c = normalize(category && category.value);
      var r = normalize(region && region.value);
      var y = normalize(year && year.value);
      var shown = 0;

      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
        var ok = true;
        if (k && hay.indexOf(k) === -1) {
          ok = false;
        }
        if (c && normalize(card.getAttribute('data-category')) !== c) {
          ok = false;
        }
        if (r && normalize(card.getAttribute('data-region')) !== r) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [keyword, category, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (category) {
          category.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && keyword) {
      keyword.value = q;
    }
    apply();
  }

  window.initMoviePlayer = function (source, videoId, buttonId) {
    var video = byId(videoId);
    var button = byId(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var loaded = false;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      button.classList.add('is-hidden');
      video.controls = true;
      var runner = video.play();
      if (runner && runner.catch) {
        runner.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderSearch();
    initHero();
    initFilters();
  });
})();
