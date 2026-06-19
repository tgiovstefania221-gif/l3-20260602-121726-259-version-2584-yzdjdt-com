(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                schedule();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search"));
        if (!inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            var scope = input.closest("section") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
            if (!cards.length) {
                scope = document;
                cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
            }
            var holder = scope.querySelector(".movie-grid, .category-grid");
            var empty = null;

            function ensureEmpty() {
                if (!holder) {
                    return null;
                }
                if (!empty) {
                    empty = document.createElement("div");
                    empty.className = "empty-state";
                    empty.textContent = "没有找到匹配的影片";
                    holder.appendChild(empty);
                }
                return empty;
            }

            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                var shown = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle("is-filter-hidden", !matched);
                    if (matched) {
                        shown += 1;
                    }
                });
                var state = ensureEmpty();
                if (state) {
                    state.style.display = shown === 0 ? "block" : "none";
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });

    window.initializeMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var streamUrl = options.streamUrl;
        var hls = null;
        var attached = false;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            attach();
            if (button) {
                button.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
}());
