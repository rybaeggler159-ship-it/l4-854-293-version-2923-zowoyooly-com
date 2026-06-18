(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var active = 0;
      var show = function (index) {
        active = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show((active + 1) % slides.length);
        }, 5000);
      }
    }

    var filterRoot = document.querySelector(".filter-panel");
    if (filterRoot) {
      var searchInput = filterRoot.querySelector("[data-search-input]");
      var regionSelect = filterRoot.querySelector("[data-filter-region]");
      var typeSelect = filterRoot.querySelector("[data-filter-type]");
      var yearSelect = filterRoot.querySelector("[data-filter-year]");
      var categorySelect = filterRoot.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-result]");
      var normalize = function (value) {
        return String(value || "").toLowerCase().trim();
      };
      var apply = function () {
        var q = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize(card.dataset.title + " " + card.dataset.region + " " + card.dataset.type + " " + card.dataset.year + " " + card.dataset.category);
          var ok = true;
          if (q && text.indexOf(q) === -1) ok = false;
          if (region && normalize(card.dataset.region) !== region) ok = false;
          if (type && normalize(card.dataset.type) !== type) ok = false;
          if (year && normalize(card.dataset.year) !== year) ok = false;
          if (category && normalize(card.dataset.category) !== category) ok = false;
          card.style.display = ok ? "" : "none";
          if (ok) shown += 1;
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      };
      [searchInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    }

    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var button = wrap.querySelector(".player-button");
      var source = wrap.getAttribute("data-source");
      var initialized = false;
      var start = function () {
        if (!video || !source) return;
        if (!initialized) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            wrap.hlsInstance = hls;
          } else {
            video.src = source;
          }
          initialized = true;
        }
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", start);
        video.addEventListener("play", function () {
          wrap.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          wrap.classList.remove("is-playing");
        });
      }
    });
  });
})();
