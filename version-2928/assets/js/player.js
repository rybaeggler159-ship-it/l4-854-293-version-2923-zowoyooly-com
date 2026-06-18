(function () {
  window.initMoviePlayer = function (url) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play-button");
    if (!video || !button || !url) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;
    var pendingPlay = false;
    var mode = "";
    var manifestReady = false;

    function playNow() {
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        mode = "native";
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        mode = "hls";
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          manifestReady = true;
          if (pendingPlay) {
            playNow();
          }
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        mode = "direct";
        video.src = url;
      }
    }

    function startPlayback() {
      pendingPlay = true;
      button.classList.add("is-hidden");
      loadVideo();
      if (mode !== "hls" || manifestReady) {
        playNow();
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
