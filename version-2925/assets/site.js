(function () {
    const ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    ready(function () {
        const menuButton = document.querySelector('[data-menu-toggle]');
        const mobileMenu = document.querySelector('[data-mobile-menu]');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-open');
            });
        }

        const hero = document.querySelector('[data-hero]');

        if (hero) {
            const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
            const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
            const prev = hero.querySelector('[data-hero-prev]');
            const next = hero.querySelector('[data-hero-next]');
            let active = 0;
            let timer = null;

            const show = function (index) {
                if (!slides.length) {
                    return;
                }

                active = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === active);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === active);
                });
            };

            const start = function () {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5600);
            };

            const stop = function () {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            };

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot') || 0));
                    start();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(active - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(active + 1);
                    start();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
            const input = scope.querySelector('[data-search-input]');
            const year = scope.querySelector('[data-filter-year]');
            const region = scope.querySelector('[data-filter-region]');
            const cards = Array.from(scope.querySelectorAll('.movie-card'));
            const empty = scope.querySelector('[data-empty-state]');

            const apply = function () {
                const query = input ? input.value.trim().toLowerCase() : '';
                const selectedYear = year ? year.value : '';
                const selectedRegion = region ? region.value : '';
                let visible = 0;

                cards.forEach(function (card) {
                    const text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    const cardYear = card.getAttribute('data-year') || '';
                    const cardRegion = card.getAttribute('data-region') || '';
                    const matchQuery = !query || text.indexOf(query) !== -1;
                    const matchYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
                    const matchRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) !== -1;
                    const matched = matchQuery && matchYear && matchRegion;

                    card.classList.toggle('is-filtered-out', !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            };

            [input, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });

        document.querySelectorAll('video[data-stream]').forEach(function (video) {
            const stream = video.getAttribute('data-stream');
            const shell = video.closest('.player-shell');
            const startButton = shell ? shell.querySelector('[data-player-action="play"]') : null;
            const status = shell ? shell.querySelector('[data-player-status]') : null;
            let attached = false;
            let hlsInstance = null;

            const setStatus = function (message, hidden) {
                if (!status) {
                    return;
                }

                status.textContent = message || '';
                status.classList.toggle('is-hidden', Boolean(hidden));
            };

            const attachStream = function () {
                if (attached || !stream) {
                    return;
                }

                attached = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('', true);
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                setStatus('播放暂时不可用，请稍后重试', false);
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('', true);
                    }, { once: true });
                } else {
                    video.src = stream;
                    setStatus('', true);
                }
            };

            attachStream();

            if (startButton) {
                startButton.addEventListener('click', function () {
                    attachStream();
                    startButton.classList.add('is-hidden');
                    const playPromise = video.play();

                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {
                            startButton.classList.remove('is-hidden');
                        });
                    }
                });
            }

            video.addEventListener('play', function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (startButton && video.currentTime === 0) {
                    startButton.classList.remove('is-hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
