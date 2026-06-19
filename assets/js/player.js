(function () {
    var video = document.getElementById("video-player");
    var trigger = document.querySelector("[data-player-trigger]");

    if (!video) {
        return;
    }

    var source = video.getAttribute("data-src");

    function attachSource() {
        if (!source) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = source;
            }
        } else if (window.Hls && window.Hls.isSupported()) {
            if (!video.dataset.hlsReady) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.dataset.hlsReady = "1";
            }
        } else if (!video.src) {
            video.src = source;
        }
    }

    function playVideo() {
        attachSource();
        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {});
        }

        if (trigger) {
            trigger.classList.add("is-hidden");
        }
    }

    if (trigger) {
        trigger.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
    });
})();
