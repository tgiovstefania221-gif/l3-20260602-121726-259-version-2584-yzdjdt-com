(function () {
  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');
  var hlsInstance = null;

  if (!video || !playButton) {
    return;
  }

  function attachSource() {
    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    }
  }

  function startPlayback() {
    attachSource();
    playButton.hidden = true;

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        playButton.hidden = false;
      });
    }
  }

  playButton.addEventListener('click', startPlayback);

  video.addEventListener('play', function () {
    playButton.hidden = true;
  });

  video.addEventListener('pause', function () {
    if (!video.ended && !video.currentTime) {
      playButton.hidden = false;
    }
  });
})();
