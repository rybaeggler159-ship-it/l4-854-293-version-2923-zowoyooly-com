(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector("[data-player]");
    var layer = document.querySelector("[data-play-layer]");

    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (attached || !stream) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);

        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 900);
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      if (layer) {
        layer.classList.add("is-hidden");
      }

      attachStream().then(function () {
        var playPromise = video.play();

        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            if (layer) {
              layer.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
