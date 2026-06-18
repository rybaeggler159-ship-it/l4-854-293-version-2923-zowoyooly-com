(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function updateCards(target) {
    var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
    var query = (target.getAttribute("data-query") || "").toLowerCase().trim();
    var filter = (target.getAttribute("data-filter") || "").toLowerCase().trim();

    cards.forEach(function (card) {
      var content = (card.getAttribute("data-search") || "").toLowerCase();
      var visible = true;
      if (query && content.indexOf(query) === -1) {
        visible = false;
      }
      if (filter && content.indexOf(filter) === -1) {
        visible = false;
      }
      card.classList.toggle("hidden-by-search", !visible);
    });
  }

  function initSearchAndFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-search-target");
      var target = selector ? document.querySelector(selector) : document;
      if (!target) {
        return;
      }
      input.addEventListener("input", function () {
        target.setAttribute("data-query", input.value || "");
        updateCards(target);
      });
    });

    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var selector = button.getAttribute("data-filter-target");
        var target = selector ? document.querySelector(selector) : document;
        if (!target) {
          return;
        }
        var value = button.getAttribute("data-filter-value") || "";
        target.setAttribute("data-filter", value);
        buttons.forEach(function (item) {
          if (item.getAttribute("data-filter-target") === selector) {
            item.classList.remove("active");
          }
        });
        button.classList.add("active");
        updateCards(target);
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-play-trigger]");
      var stream = shell.getAttribute("data-stream") || "";
      var hlsInstance = null;

      function attachStream() {
        if (!video || !stream || video.getAttribute("data-ready") === "true") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.setAttribute("data-ready", "true");
      }

      function playVideo() {
        attachStream();
        shell.classList.add("is-started");
        if (video && video.play) {
          var playResult = video.play();
          if (playResult && playResult.catch) {
            playResult.catch(function () {});
          }
        }
      }

      if (trigger) {
        trigger.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      shell.addEventListener("click", function (event) {
        if (event.target === video || shell.classList.contains("is-started")) {
          return;
        }
        playVideo();
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initImageState() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initSearchAndFilters();
    initPlayers();
    initImageState();
  });
})();
