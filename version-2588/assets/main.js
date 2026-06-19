(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var panels = selectAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var grid = panel.parentElement.querySelector('[data-movie-grid]');

    if (!grid) {
      return;
    }

    var cards = selectAll('.movie-card, .rank-card', grid);
    var searchInput = panel.querySelector('.movie-search-input');
    var yearFilter = panel.querySelector('.year-filter');
    var regionFilter = panel.querySelector('.region-filter');
    var result = panel.querySelector('[data-filter-result]');

    function uniqueValues(attribute) {
      var values = cards.map(function (card) {
        return card.getAttribute(attribute) || '';
      }).filter(Boolean);

      return Array.from(new Set(values));
    }

    function fillSelect(select, values, numericDesc) {
      if (!select || select.options.length > 1) {
        return;
      }

      values.sort(function (a, b) {
        if (numericDesc) {
          return Number(b) - Number(a);
        }

        return a.localeCompare(b, 'zh-CN');
      }).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(yearFilter, uniqueValues('data-year'), true);
    fillSelect(regionFilter, uniqueValues('data-region'), false);

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var shouldShow = matchesQuery && matchesYear && matchesRegion;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [searchInput, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
