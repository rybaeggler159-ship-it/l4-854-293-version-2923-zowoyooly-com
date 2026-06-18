(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setHero(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setHero(activeIndex + 1);
      }, 5000);
    }

    setHero(0);

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var filterInput = document.querySelector("[data-filter-input]");

    if (query && filterInput) {
      filterInput.value = query;
    }

    function applyFilter() {
      var input = document.querySelector("[data-filter-input]");
      var yearSelect = document.querySelector("[data-year-select]");
      var genreSelect = document.querySelector("[data-genre-select]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var term = normalize(input ? input.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var genre = normalize(genreSelect ? genreSelect.value : "");

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-haystack"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var matched = true;

        if (term && haystack.indexOf(term) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (genre && cardGenre.indexOf(genre) === -1 && haystack.indexOf(genre) === -1) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-input], [data-year-select], [data-genre-select]")).forEach(function (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    });

    applyFilter();
  });
})();
