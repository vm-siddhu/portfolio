/* ===================================================================
   SIDDHU PADALA — PORTFOLIO
   Main JavaScript: Three.js 3D Hero, GSAP Animations, Interactions
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =================== GSAP REGISTER PLUGINS (first!) ===================
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


    // =================== INIT ===================
    // No preloader — hero animations fire immediately
    triggerHeroAnimations();


    // =================== THREE.JS 3D HERO ===================
    function initThreeJS() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create floating geometry group
        const group = new THREE.Group();
        scene.add(group);

        // === Icosahedron wireframe (primary supporting visual) ===
        const icoGeometry = new THREE.IcosahedronGeometry(2.4, 1);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.14          // reduced — supporting, not dominant
        });
        const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        group.add(icosahedron);

        // === Subtle inner sphere glow ===
        const sphereGeometry = new THREE.SphereGeometry(1.3, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.03,         // nearly invisible
            wireframe: false
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        group.add(sphere);

        // === Single orbit ring only (removed the two busier outer rings) ===
        const torusConfigs = [
            { radius: 3.8, tube: 0.012, rotationX: Math.PI * 0.5, rotationY: 0, opacity: 0.1, speed: 0.07 }
        ];

        const tori = [];
        torusConfigs.forEach(config => {
            const geometry = new THREE.TorusGeometry(config.radius, config.tube, 16, 100);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: config.opacity
            });
            const torus = new THREE.Mesh(geometry, material);
            torus.rotation.x = config.rotationX;
            torus.rotation.y = config.rotationY;
            group.add(torus);
            tori.push({ mesh: torus, speed: config.speed });
        });

        // === Particle Atmosphere — thinned out and faded ===
        const particlesCount = 200;
        const particlePositions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            particlePositions[i] = (Math.random() - 0.5) * 25;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.03,
            transparent: true,
            opacity: 0.18,         // halved — barely visible background stars
            sizeAttenuation: true
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Camera position
        camera.position.z = 7;
        camera.position.y = 0.5;

        // Responsive group position
        const isMobile = window.innerWidth <= 992;
        group.position.x = isMobile ? 0 : 2.5;
        group.position.y = isMobile ? -1 : 0.2; // Move lower on mobile to be behind/under text
        group.scale.setScalar(isMobile ? 0.8 : 1);

        // Mouse interaction
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Update responsive position on resize
            const isMobile = window.innerWidth <= 992;
            group.position.x = isMobile ? 0 : 2.5;
            group.position.y = isMobile ? -1 : 0.2;
            group.scale.setScalar(isMobile ? 0.8 : 1);
        });

        // Animation loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // === Advanced Anti-Gravity Lerp Logic ===
            // Subtly update target based on mouse, but with a floaty bias
            const floatX = Math.sin(elapsed * 0.5) * 0.1;
            const floatY = Math.cos(elapsed * 0.4) * 0.1;

            targetX += (mouseX * 0.5 + floatX - targetX) * 0.05;
            targetY += (mouseY * 0.5 + floatY - targetY) * 0.05;

            // === Multi-Layered Depth Intensities ===
            // 1. Central Icosahedron (Moves Least: 0.6)
            icosahedron.rotation.x = elapsed * 0.15 + targetY * 0.6;
            icosahedron.rotation.y = elapsed * 0.2 + targetX * 0.6;
            sphere.rotation.y = -elapsed * 0.08;

            // 2. Torus Rings (Moves Most: 1.2 to 1.8)
            tori.forEach((t, i) => {
                const intensity = 1.2 + i * 0.3; // Increasing intensity for outer rings
                t.mesh.rotation.z = elapsed * t.speed;
                t.mesh.rotation.x = t.mesh.rotation.x + (targetY * 0.005 * intensity);
                t.mesh.rotation.y = t.mesh.rotation.y + (targetX * 0.005 * intensity);

                // Add subtle position shift for each layer
                t.mesh.position.x = targetX * 0.4 * intensity;
                t.mesh.position.y = targetY * 0.4 * intensity;
            });

            // 3. Particle Field (Background Motion: 0.2)
            particles.rotation.y = elapsed * 0.02 + targetX * 0.2;
            particles.rotation.x = elapsed * 0.01 + targetY * 0.2;
            particles.position.x = targetX * 0.8;
            particles.position.y = targetY * 0.8;

            // Anti-Gravity Group Floating (Hero Context)
            const isMobile = window.innerWidth <= 992;
            const baseX = isMobile ? 0 : 2.5;
            const baseY = isMobile ? -1 : 0.2;

            group.position.x = baseX + targetX * 0.5;
            group.position.y = baseY + Math.sin(elapsed * 0.6) * 0.4 + targetY * 0.5;
            group.rotation.y = targetX * 0.2;
            group.rotation.x = -targetY * 0.1;

            // Subtle pulsing — stays in the 0.10–0.16 range
            icoMaterial.opacity = 0.13 + Math.sin(elapsed * 0.8) * 0.03;

            renderer.render(scene, camera);
        }

        animate();
    }

    initThreeJS();


    // =================== GSAP HERO ANIMATIONS ===================
    function triggerHeroAnimations() {
        // Redesigned: Snappier initial delay (0.4s) and more energetic entrance
        const tl = gsap.timeline({ delay: 0.4, defaults: { ease: 'power4.out', duration: 0.8 } });

        tl.fromTo('#heroCanvas',
            { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8 },
            0
        )
            .to('.hero__tag', {
                opacity: 1, x: 0, duration: 0.6
            }, 0.2) // Slide in from left
            .to('.hero__title-word', {
                y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'back.out(1.7)'
            }, '-=0.4') // Pop with a slight overshoot
            .to('.hero__description', {
                opacity: 1, y: 0, duration: 0.7
            }, '-=0.5')
            .to('.hero__actions', {
                opacity: 1, y: 0, stagger: 0.1, duration: 0.7
            }, '-=0.5')
            .to('.hero__scroll-indicator', {
                opacity: 1, y: 0, duration: 0.8
            }, '-=0.3')
            .fromTo('.hero__social-rail',
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.8 }
                , '-=0.5');
    }


    // =================== GSAP SCROLL ANIMATIONS ===================
    // Helper function for scroll-triggered animations
    function createScrollReveal(selector, fromVars, triggerSelector, stagger = 0) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        const trigger = triggerSelector ? document.querySelector(triggerSelector) : elements[0];
        if (!trigger) return;

        gsap.set(elements, { opacity: 0, ...fromVars });

        ScrollTrigger.create({
            trigger: trigger,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(elements, {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: stagger,
                    ease: 'power3.out',
                    clearProps: 'transform'
                });
            }
        });
    }

    // Section headers
    gsap.utils.toArray('.section__header').forEach(header => {
        const children = header.children;
        gsap.set(children, { opacity: 0, y: 40 });

        ScrollTrigger.create({
            trigger: header,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(children, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: 'power3.out'
                });
            }
        });
    });

    // About content
    createScrollReveal('.about__lead, .about__text', { y: 30 }, '.about__content', 0.12);

    // About highlights
    createScrollReveal('.about__highlight', { x: -30 }, '.about__highlights', 0.12);

    // About stats
    const statsEls = document.querySelectorAll('.about__stat');
    if (statsEls.length) {
        gsap.set(statsEls, { opacity: 0, scale: 0.8 });

        ScrollTrigger.create({
            trigger: '.about__stats',
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(statsEls, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'back.out(1.7)',
                    onComplete: animateCounters
                });
            }
        });
    }

    // Experience timeline items
    createScrollReveal('.timeline__item', { y: 40 }, '.experience__grid', 0.15);

    // Project cards
    createScrollReveal('.project-card', { y: 50 }, '.projects__grid', 0.15);

    // Skill categories
    createScrollReveal('.skill-category', { y: 40 }, '.skills__grid', 0.12);

    // Credential cards
    createScrollReveal('.credential-card', { y: 30 }, '.credentials__grid', 0.1);

    // Contact info cards
    createScrollReveal('.contact__info-card, .contact__cv-card', { x: -30 }, '.contact__info', 0.1);

    // Contact form
    createScrollReveal('.contact__form', { x: 30 }, '.contact__grid');

    // Footer
    createScrollReveal('.footer__top, .footer__bottom', { y: 20 }, '.footer', 0.15);


    // =================== COUNTER ANIMATION ===================
    function animateCounters() {
        document.querySelectorAll('.about__stat-value[data-value]').forEach(counter => {
            const target = parseFloat(counter.dataset.value);
            const isDecimal = target % 1 !== 0;
            const obj = { val: 0 };

            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                    counter.textContent = isDecimal ? obj.val.toFixed(2) : Math.floor(obj.val);
                }
            });
        });
    }


    // =================== CUSTOM CURSOR ===================
    const cursorOuter = document.getElementById('cursorOuter');
    const cursorInner = document.getElementById('cursorInner');

    if (cursorOuter && cursorInner) {
        let mouseX = 0, mouseY = 0;
        let outerX = 0, outerY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Inner dot follows instantly
            cursorInner.style.left = mouseX + 'px';
            cursorInner.style.top = mouseY + 'px';
        });

        // Outer crosshair follows with smooth lag
        function renderCursor() {
            outerX += (mouseX - outerX) * 0.15;
            outerY += (mouseY - outerY) * 0.15;
            cursorOuter.style.left = outerX + 'px';
            cursorOuter.style.top = outerY + 'px';
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        // Hover effects on interactive elements
        const interactables = document.querySelectorAll('a, button, .project-card, .skill-category, .glass-card, .about__highlight, input, textarea');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOuter.classList.add('hover');
                cursorInner.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorOuter.classList.remove('hover');
                cursorInner.classList.remove('hover');
            });
        });

        // Click animation
        document.addEventListener('mousedown', () => cursorOuter.classList.add('click'));
        document.addEventListener('mouseup', () => cursorOuter.classList.remove('click'));

        // Hide on leave window
        document.addEventListener('mouseleave', () => {
            cursorOuter.style.opacity = '0';
            cursorInner.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorOuter.style.opacity = '1';
            cursorInner.style.opacity = '1';
        });
    }


    // =================== NAVBAR ===================
    const nav = document.getElementById('mainNav');

    window.addEventListener('scroll', () => {
        // Scrolled state
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Back to top button
        const btt = document.getElementById('backToTop');
        if (btt) {
            if (window.scrollY > 500) {
                btt.classList.add('visible');
            } else {
                btt.classList.remove('visible');
            }
        }

        // Active nav link
        updateActiveNavLink();
    });

    // Active navigation link tracking
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinksAll = document.querySelectorAll('.nav__link');

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    }

    // =================== SMOOTH SCROLL FOR ALL ANCHOR LINKS ===================
    // This handles nav links, "Let's Talk" button, hero buttons, etc.
    function smoothScrollTo(targetEl, offset = 80) {
        if (!targetEl) return;
        gsap.to(window, {
            duration: 0.4,
            scrollTo: { y: targetEl, offsetY: offset },
            ease: 'power2.out'
        });
    }

    // Attach to all internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href.length <= 1) return; // skip bare "#" links

            e.preventDefault();
            const targetEl = document.querySelector(href);
            if (targetEl) {
                smoothScrollTo(targetEl);
            }

            // Close mobile menu if open
            const mm = document.getElementById('mobileMenu');
            const hb = document.getElementById('hamburger');
            if (mm && mm.classList.contains('active')) {
                mm.classList.remove('active');
                if (hb) hb.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: 0 },
                ease: 'power3.inOut'
            });
        });
    }


    // =================== MOBILE MENU ===================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            if (mobileMenu.classList.contains('active')) {
                document.body.classList.add('no-scroll');

                // Use gsap.set + gsap.to to ensure clean animation every time
                gsap.set('.mobile-menu__link', { opacity: 0, y: 30 });
                gsap.to('.mobile-menu__link', {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power3.out',
                    delay: 0.3
                });
            } else {
                document.body.classList.remove('no-scroll');
            }
        });

        document.querySelectorAll('.mobile-menu__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }


    // =================== CONTACT FORM (Web3Forms) ===================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const originalHTML = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Success state
                    submitBtn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    gsap.fromTo(submitBtn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });

                    if (formStatus) {
                        formStatus.textContent = '✓ Your message has been sent successfully!';
                        formStatus.className = 'form-status form-status--success';
                    }

                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Something went wrong');
                }
            } catch (error) {
                // Error state
                submitBtn.innerHTML = '<span>Failed to Send</span><i class="fas fa-exclamation-triangle"></i>';
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

                if (formStatus) {
                    formStatus.textContent = '✗ Failed to send. Please try emailing me directly.';
                    formStatus.className = 'form-status form-status--error';
                }
            }

            // Reset button after delay
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        });
    }


    // FLOATING PARTICLES (CSS-based) — disabled to reduce hero clutter
    // function createParticles() { ... }


    // =================== MAGNETIC EFFECT ON BUTTONS ===================
    const magneticButtons = document.querySelectorAll('.btn--primary, .nav__cta');

    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

    // =================== 3D PLATE TILT EFFECT FOR CARDS ===================
    const tiltCards = document.querySelectorAll('.project-card, .skill-category, .about__highlight, .glass-card, .about__stat');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Get mouse position relative to card boundaries
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center points
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation amount (further refined: stats highest, general mid, projects lowest)
            const isStatCard = card.classList.contains('about__stat');
            const isProjectCard = card.classList.contains('project-card');

            let intensity = 12; // default
            if (isStatCard) intensity = 18;
            if (isProjectCard) intensity = 7; // Reduced for projects section as requested

            const rotateX = ((y - centerY) / centerY) * -intensity;
            const rotateY = ((x - centerX) / centerX) * intensity;

            // Apply 3D transform properties
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Reset translation on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });

        // Ensure smooth transition on initial hover and leave
        card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease';
        // But remove transition during active mousemove for instant follow
        card.addEventListener('mouseenter', () => {
            setTimeout(() => {
                card.style.transition = 'none';
            }, 400); // 400ms is the duration of our CSS transition
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease';
        });
    });


    // =================== PARALLAX ON SCROLL ===================
    gsap.to('.hero__content', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: -100,
        opacity: 0.3
    });

    gsap.to('#heroCanvas', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: -60,
        scale: 1.1
    });


    // =================== TEXT SCRAMBLE EFFECT FOR LOGO ===================
    const logoText = document.querySelector('.nav__logo-text');
    if (logoText) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
        const original = logoText.textContent;

        logoText.parentElement.addEventListener('mouseenter', () => {
            let iteration = 0;
            const interval = setInterval(() => {
                logoText.textContent = original.split('').map((char, idx) => {
                    if (idx < iteration) return original[idx];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');

                iteration += 1 / 2;
                if (iteration >= original.length) {
                    logoText.textContent = original;
                    clearInterval(interval);
                }
            }, 40);
        });
    }

    // =================== GLOBAL LINE-GRID BACKGROUND (Cursor Warp) ===================
    // Draws a subtle line grid with tall rectangular cells (height > width).
    // Bends/distorts around cursor for a smooth gravity-well effect.
    (function initGridBackground() {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // --- Config ---
        const GRID_X = 140;           // geometric spacing
        const GRID_Y = 220;           // slightly taller rectangular vertical pacing 
        const SEGMENTS = 40;          // higher resolution mapping for smoother curves
        const WARP_RADIUS = 250;      // wider cursor reach
        const WARP_STRENGTH = 25;     // slightly stronger pull for dramatic effect
        const LINE_OPACITY = 0.015;   // barely visible, premium minimal look
        const LINE_COLOR = '255,255,255';
        const LERP_SPEED = 0.06;
        const DRIFT_SPEED = 0.4;      // infinite upward drift speed

        let timeOffset = 0; // Tracks scroll drift

        // Cursor tracking
        let rawCX = -9999, rawCY = -9999;
        let cx = -9999, cy = -9999;

        window.addEventListener('mousemove', (e) => {
            rawCX = e.clientX;
            rawCY = e.clientY;
        });

        // Resize
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 120);
        });

        // Displacement function
        function displace(px, py) {
            const dx = px - cx;
            const dy = py - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= WARP_RADIUS || dist === 0) return { dx: 0, dy: 0 };

            const t = 1 - dist / WARP_RADIUS;
            const strength = WARP_STRENGTH * t * t * (3 - 2 * t);

            return {
                dx: -(dx / dist) * strength,
                dy: -(dy / dist) * strength,
            };
        }

        // Draw a single warped line
        function drawWarpedLine(x0, y0, x1, y1) {
            ctx.beginPath();
            for (let i = 0; i <= SEGMENTS; i++) {
                const t = i / SEGMENTS;
                const px = x0 + (x1 - x0) * t;
                const py = y0 + (y1 - y0) * t;
                const d = displace(px, py);
                const wx = px + d.dx;
                const wy = py + d.dy;
                if (i === 0) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
        }

        function draw() {
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Draw grid lines
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${LINE_OPACITY})`;
            ctx.lineWidth = 1;
            ctx.lineCap = 'butt';

            // Calculate smooth infinite wrapping offsets
            const offsetX = (timeOffset * 0.4) % GRID_X;
            const offsetY = timeOffset % GRID_Y;

            // Vertical lines (moving rightwards slowly)
            for (let x = -GRID_X; x <= w + GRID_X; x += GRID_X) {
                drawWarpedLine(x + offsetX, -GRID_Y, x + offsetX, h + GRID_Y);
            }

            // Horizontal lines (moving downwards slowly)
            for (let y = -GRID_Y; y <= h + GRID_Y; y += GRID_Y) {
                drawWarpedLine(-GRID_X, y + offsetY, w + GRID_X, y + offsetY);
            }
        }

        function animate() {
            timeOffset += DRIFT_SPEED;
            
            cx += (rawCX - cx) * LERP_SPEED;
            cy += (rawCY - cy) * LERP_SPEED;

            draw();
            requestAnimationFrame(animate);
        }

        animate();
    })();


});
