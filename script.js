/* ============================================================
   كنافة البرنس — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initMenuTabs();
    initCarousel();
    initRevealAnimations();
    initSmoothScroll();
});

/* ============================================================
   GOLDEN PARTICLES (Hero Background)
   ============================================================ */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.fadeDir = 1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            this.opacity += this.fadeSpeed * this.fadeDir;
            if (this.opacity >= 0.6) this.fadeDir = -1;
            if (this.opacity <= 0.05) this.fadeDir = 1;

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 168, 67, ${this.opacity})`;
            ctx.fill();

            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 168, 67, ${this.opacity * 0.15})`;
            ctx.fill();
        }
    }

    const particleCount = Math.min(Math.floor(window.innerWidth * 0.06), 80);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible
    const heroSection = document.getElementById('hero');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate();
            } else {
                cancelAnimationFrame(animationId);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(heroSection);
    animate(); // Start initially
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

/* ============================================================
   MENU TABS
   ============================================================ */
function initMenuTabs() {
    const tabs = document.querySelectorAll('.menu-tab');
    const panels = document.querySelectorAll('.menu-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const panelId = `panel-${tab.dataset.tab}`;
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
                // Re-trigger reveal on new panel content
                panel.querySelectorAll('.reveal').forEach(el => {
                    el.classList.add('active');
                });
            }
        });
    });
}

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    let autoPlayInterval;

    // Create dots
    for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function goTo(index) {
        currentIndex = index;
        // RTL: use positive translateX
        track.style.transform = `translateX(${currentIndex * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function goNext() {
        goTo(currentIndex < totalCards - 1 ? currentIndex + 1 : 0);
    }

    function goPrev() {
        goTo(currentIndex > 0 ? currentIndex - 1 : totalCards - 1);
    }

    // In RTL, "next" button (left chevron) should go to next, and "prev" (right chevron) should go to prev
    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', goPrev);

    // Auto-play
    function startAutoPlay() {
        autoPlayInterval = setInterval(goNext, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    startAutoPlay();

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Touch swipe support
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            // RTL: swipe directions are reversed
            if (diff < 0) {
                goNext();
            } else {
                goPrev();
            }
        }
        isDragging = false;
        startAutoPlay();
    }, { passive: true });
}

/* ============================================================
   REVEAL ON SCROLL (Intersection Observer)
   ============================================================ */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
