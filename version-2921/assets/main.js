(function () {
    const mobileButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            const open = mobileNav.classList.toggle("is-open");
            mobileButton.setAttribute("aria-expanded", String(open));
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;

        function showSlide(index) {
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
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
        button.addEventListener("click", function () {
            const target = document.getElementById(button.getAttribute("data-scroll-target"));
            const direction = button.getAttribute("data-scroll-dir") === "left" ? -1 : 1;
            if (target) {
                target.scrollBy({
                    left: direction * 420,
                    behavior: "smooth"
                });
            }
        });
    });

    const grid = document.querySelector("[data-card-grid]");
    const pageSearch = document.querySelector("[data-page-search]");
    const sortSelect = document.querySelector("[data-sort-select]");
    const categorySelect = document.querySelector("[data-category-select]");
    const jumpCategory = document.querySelector("[data-jump-category]");

    if (pageSearch && grid) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");
        if (initialQuery) {
            pageSearch.value = initialQuery;
        }
    }

    function getCards() {
        if (!grid) {
            return [];
        }
        return Array.from(grid.children).filter(function (node) {
            return node.matches(".movie-card, .ranking-item");
        });
    }

    function normalize(text) {
        return String(text || "").trim().toLowerCase();
    }

    function filterCards() {
        if (!grid) {
            return;
        }
        const query = normalize(pageSearch ? pageSearch.value : "");
        const category = categorySelect ? categorySelect.value : "all";
        getCards().forEach(function (card) {
            const text = normalize(card.textContent + " " + Object.values(card.dataset).join(" "));
            const matchesQuery = !query || text.includes(query);
            const matchesCategory = category === "all" || card.dataset.category === category;
            card.classList.toggle("is-hidden-card", !(matchesQuery && matchesCategory));
        });
    }

    function sortCards() {
        if (!grid || !sortSelect) {
            return;
        }
        const mode = sortSelect.value;
        const cards = getCards();
        cards.sort(function (a, b) {
            if (mode === "rating") {
                return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
            }
            if (mode === "title") {
                return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
            }
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
        filterCards();
    }

    if (pageSearch) {
        pageSearch.addEventListener("input", filterCards);
        filterCards();
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", sortCards);
    }

    if (jumpCategory) {
        jumpCategory.addEventListener("change", function () {
            if (jumpCategory.value) {
                window.location.href = "./category-" + jumpCategory.value + ".html";
            }
        });
    }

    document.querySelectorAll("[data-view-mode]").forEach(function (button) {
        button.addEventListener("click", function () {
            const mode = button.getAttribute("data-view-mode");
            document.querySelectorAll("[data-view-mode]").forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            if (grid) {
                grid.classList.toggle("is-list", mode === "list");
            }
        });
    });

    document.querySelectorAll("[data-category-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
            const category = button.getAttribute("data-category-filter");
            document.querySelectorAll("[data-category-filter]").forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            document.querySelectorAll(".filter-grid .movie-card").forEach(function (card) {
                const show = category === "all" || card.dataset.category === category;
                card.classList.toggle("is-hidden-card", !show);
            });
        });
    });
})();
