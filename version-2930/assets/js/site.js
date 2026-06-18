(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function initFilters() {
        var searchInput = qs('[data-filter-search]');
        var typeSelect = qs('[data-filter-type]');
        var yearSelect = qs('[data-filter-year]');
        var categorySelect = qs('[data-filter-category]');
        var list = qs('[data-filter-list]');
        var empty = qs('[data-empty-state]');
        if (!list) {
            return;
        }
        var cards = qsa('[data-movie-card]', list);
        if (searchInput && getParam('q')) {
            searchInput.value = getParam('q');
        }

        function includesText(value, query) {
            return String(value || '').toLowerCase().indexOf(query) !== -1;
        }

        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var ok = true;
                if (query) {
                    ok = ok && includesText(card.getAttribute('data-search'), query);
                }
                if (type) {
                    ok = ok && includesText(card.getAttribute('data-type'), type);
                }
                if (year) {
                    ok = ok && card.getAttribute('data-year') === year;
                }
                if (category) {
                    ok = ok && card.getAttribute('data-category') === category;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    var hlsPromise;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function attachStream(video, source) {
        if (!source || video.getAttribute('data-loaded') === 'true') {
            return Promise.resolve();
        }
        video.setAttribute('data-loaded', 'true');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }
        return loadHlsScript().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else {
                video.src = source;
            }
        }).catch(function () {
            video.src = source;
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var video = qs('video', box);
            var button = qs('[data-player-start]', box);
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-stream');
            function play() {
                attachStream(video, source).then(function () {
                    box.classList.add('is-playing');
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === 'function') {
                        attempt.catch(function () {
                            box.classList.remove('is-playing');
                        });
                    }
                });
            }
            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    box.classList.remove('is-playing');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
