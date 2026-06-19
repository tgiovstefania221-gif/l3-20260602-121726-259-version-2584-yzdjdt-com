(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
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

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var textInput = scope.querySelector("[data-filter-text]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

            function apply() {
                var keyword = normalize(textInput && textInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);

                cards.forEach(function (card) {
                    var searchable = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region")
                    ].join(" ").toLowerCase();
                    var matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
                    var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
                    card.classList.toggle("is-hidden", !(matchesKeyword && matchesYear && matchesType));
                });
            }

            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card compact-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
            "<a class=\"poster-wrap\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
            "<span class=\"play-circle\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-page-form]");
        var input = document.querySelector("[data-search-input]");
        var resultBox = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var subtitle = document.querySelector("[data-search-subtitle]");
        if (!form || !input || !resultBox || typeof SiteMovies === "undefined") {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function render(value) {
            var keyword = normalize(value);
            if (!keyword) {
                return;
            }
            var words = keyword.split(/\s+/).filter(Boolean);
            var matches = SiteMovies.filter(function (movie) {
                var source = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" "));
                return words.every(function (word) {
                    return source.indexOf(word) !== -1;
                });
            }).slice(0, 120);

            if (title) {
                title.textContent = "搜索结果";
            }
            if (subtitle) {
                subtitle.textContent = "与“" + value + "”相关的视频内容";
            }
            if (!matches.length) {
                resultBox.innerHTML = "<div class=\"search-empty\">暂无匹配结果</div>";
                return;
            }
            resultBox.innerHTML = matches.map(cardHtml).join("");
        }

        render(query);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.history.replaceState(null, "", url);
            render(value);
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
