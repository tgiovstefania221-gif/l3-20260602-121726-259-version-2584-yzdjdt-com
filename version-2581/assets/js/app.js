(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    function initMobileNavigation() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = document.body.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        nav.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                document.body.classList.remove("nav-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var track = carousel.querySelector("[data-hero-track]");
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        if (!track || slides.length === 0) {
            return;
        }

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            track.style.transform = "translateX(-" + current * 100 + "%)";

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                goTo(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                goTo(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                goTo(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                goTo(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);

        goTo(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-page]"));

        toolbars.forEach(function (toolbar) {
            var scope = toolbar.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var search = toolbar.querySelector(".js-search");
            var region = toolbar.querySelector(".js-region");
            var type = toolbar.querySelector(".js-type");
            var year = toolbar.querySelector(".js-year");
            var reset = toolbar.querySelector(".js-reset-filter");
            var count = toolbar.querySelector(".js-result-count");
            var empty = scope.querySelector(".js-empty-state");

            function applyFilter() {
                var query = normalize(search && search.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        matched = false;
                    }

                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        matched = false;
                    }

                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    card.hidden = !matched;

                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visibleCount);
                }

                if (empty) {
                    empty.hidden = visibleCount !== 0;
                }
            }

            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }

                    if (region) {
                        region.value = "";
                    }

                    if (type) {
                        type.value = "";
                    }

                    if (year) {
                        year.value = "";
                    }

                    applyFilter();
                });
            }

            applyFilter();
        });
    }

    function initGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll(".js-global-search"));

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";

                if (!value) {
                    event.preventDefault();
                    window.location.href = form.getAttribute("action") || "archive.html";
                }
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query) {
            var searchInput = document.querySelector(".js-search");

            if (searchInput) {
                searchInput.value = query;
                searchInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var hlsInstance = null;
            var hasLoaded = false;

            if (!video || !button) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || "";
                }
            }

            function playVideo() {
                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setStatus("播放器已加载，请再次点击视频控件开始播放。 ");
                    });
                }
            }

            function loadSource() {
                var source = video.getAttribute("data-src");

                if (!source) {
                    setStatus("未找到播放源。 ");
                    return;
                }

                button.classList.add("is-hidden");

                if (hasLoaded) {
                    playVideo();
                    return;
                }

                hasLoaded = true;
                setStatus("正在加载 HLS 播放源... ");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源加载完成。 ");
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放源加载失败，请刷新页面或更换浏览器。 ");
                        }
                    });
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("播放源加载完成。 ");
                        playVideo();
                    }, { once: true });
                    return;
                }

                video.src = source;
                setStatus("当前浏览器可能不支持 HLS，已尝试直接加载 m3u8 地址。 ");
                playVideo();
            }

            button.addEventListener("click", loadSource);
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
                setStatus("");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initBackToTop() {
        var button = document.querySelector(".back-to-top");

        if (!button) {
            return;
        }

        function update() {
            button.classList.toggle("is-visible", window.scrollY > 480);
        }

        button.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    ready(function () {
        initMobileNavigation();
        initHeroCarousel();
        initGlobalSearch();
        initFilters();
        initPlayers();
        initBackToTop();
    });
}());
