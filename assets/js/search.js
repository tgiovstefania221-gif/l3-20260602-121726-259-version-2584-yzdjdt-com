(function () {
    var data = window.MOVIE_INDEX || [];
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-result-count]");

    if (!form || !results || !count) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var keywordInput = form.querySelector("[name='q']");
    var regionInput = form.querySelector("[name='region']");
    var typeInput = form.querySelector("[name='type']");

    keywordInput.value = params.get("q") || "";
    regionInput.value = params.get("region") || "";
    typeInput.value = params.get("type") || "";

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function render(items) {
        count.textContent = "共找到 " + items.length + " 部影片";

        results.innerHTML = items.slice(0, 120).map(function (item) {
            return "<article class=\"movie-card\">" +
                "<a href=\"" + escapeHtml(item.url) + "\" class=\"card-link\">" +
                    "<div class=\"poster-wrap\">" +
                        "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                        "<span class=\"year-badge\">" + escapeHtml(item.year || "精选") + "</span>" +
                        "<span class=\"play-dot\">▶</span>" +
                    "</div>" +
                    "<div class=\"card-body\">" +
                        "<h3>" + escapeHtml(item.title) + "</h3>" +
                        "<p>" + escapeHtml(item.oneLine) + "</p>" +
                        "<div class=\"meta-row\">" +
                            "<span>" + escapeHtml(item.region) + "</span>" +
                            "<span>" + escapeHtml(item.type) + "</span>" +
                            "<span>" + escapeHtml(item.genre) + "</span>" +
                        "</div>" +
                    "</div>" +
                "</a>" +
            "</article>";
        }).join("");
    }

    function apply() {
        var keyword = keywordInput.value.trim().toLowerCase();
        var region = regionInput.value;
        var type = typeInput.value;
        var filtered = data.filter(function (item) {
            var haystack = [
                item.title,
                item.region,
                item.type,
                item.genre,
                (item.tags || []).join(" "),
                item.oneLine
            ].join(" ").toLowerCase();

            return (!keyword || haystack.indexOf(keyword) !== -1) &&
                (!region || item.region === region) &&
                (!type || item.type === type);
        });

        render(filtered);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var next = new URLSearchParams();

        if (keywordInput.value.trim()) {
            next.set("q", keywordInput.value.trim());
        }

        if (regionInput.value) {
            next.set("region", regionInput.value);
        }

        if (typeInput.value) {
            next.set("type", typeInput.value);
        }

        history.replaceState(null, "", "search.html" + (next.toString() ? "?" + next.toString() : ""));
        apply();
    });

    keywordInput.addEventListener("input", apply);
    regionInput.addEventListener("change", apply);
    typeInput.addEventListener("change", apply);
    apply();
})();
