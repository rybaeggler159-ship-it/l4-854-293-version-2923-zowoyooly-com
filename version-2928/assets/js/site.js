(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var menuPanel = document.querySelector("[data-menu-panel]");
  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", function () {
      menuPanel.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (value) {
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      }
    });
  });

  var filterInput = document.querySelector("[data-filter-input]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var activeValue = "";

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function applyFilter() {
    var query = normalize(filterInput ? filterInput.value.trim() : "");
    var chip = normalize(activeValue);
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var type = normalize(card.getAttribute("data-type"));
      var queryMatched = !query || text.indexOf(query) !== -1;
      var chipMatched = !chip || text.indexOf(chip) !== -1 || type.indexOf(chip) !== -1;
      card.classList.toggle("is-hidden-card", !(queryMatched && chipMatched));
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
      filterInput.value = initialQuery;
    }
    filterInput.addEventListener("input", applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      activeValue = button.getAttribute("data-filter-value") || "";
      applyFilter();
    });
  });

  applyFilter();
})();
