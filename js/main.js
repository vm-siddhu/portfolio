/* ===================================================================
   SIDDHU PADALA — PORTFOLIO
   Main JavaScript: Three.js 3D Hero, GSAP Animations, Interactions
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =================== GSAP REGISTER PLUGINS (first!) ===================
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


    // =================== PRELOADER ===================
    const preloader = document.getElementById('preloader');
    const preloaderCounter = document.querySelector('.preloader-counter');
    let progress = 0;

    const preloaderInterval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(preloaderInterval);
            setTimeout(dismissPreloader, 300);
        }
        preloaderCounter.textContent = Math.floor(progress) + '%';
        document.documentElement.style.setProperty('--preloader-progress', progress + '%');
    }, 60);

    // Add dynamic style for preloader progress
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `.preloader-line::after { width: var(--preloader-progress, 0%); }`;
    document.head.appendChild(styleSheet);

    function dismissPreloader() {
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                preloader.style.display = 'none';
                document.body.classList.remove('no-scroll');
                triggerHeroAnimations();
                // Refresh ScrollTrigger after preloader
                setTimeout(() => ScrollTrigger.refresh(), 100);
            }
        });
    }

    document.body.classList.add('no-scroll');


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

        // === Icosahedron (main centerpiece) ===
        const icoGeometry = new THREE.IcosahedronGeometry(2.2, 1);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        group.add(icosahedron);

        // === Inner sphere (glow core) ===
        const sphereGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4d4d4,
            transparent: true,
            opacity: 0.06,
            wireframe: false
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        group.add(sphere);

        // === Torus ring ===
        const torusGeometry = new THREE.TorusGeometry(3.5, 0.03, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0xa3a3a3,
            transparent: true,
            opacity: 0.2
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.rotation.x = Math.PI * 0.5;
        group.add(torus);

        // === Second Torus ===
        const torus2Geometry = new THREE.TorusGeometry(4.2, 0.02, 16, 100);
        const torus2Material = new THREE.MeshBasicMaterial({
            color: 0x737373,
            transparent: true,
            opacity: 0.12
        });
        const torus2 = new THREE.Mesh(torus2Geometry, torus2Material);
        torus2.rotation.x = Math.PI * 0.35;
        torus2.rotation.y = Math.PI * 0.25;
        group.add(torus2);

        // === Floating particles ===
        const particlesCount = 200;
        const particlePositions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
            particlePositions[i] = (Math.random() - 0.5) * 20;
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xd4d4d4,
            size: 0.03,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Camera position
        camera.position.z = 7;
        camera.position.y = 0.5;

        // Position group slightly to the right
        group.position.x = 2.5;
        group.position.y = 0;

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
        });

        // Animation loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // Smooth mouse follow
            targetX += (mouseX * 0.3 - targetX) * 0.05;
            targetY += (mouseY * 0.3 - targetY) * 0.05;

            // Rotate geometry
            icosahedron.rotation.x = elapsed * 0.15 + targetY * 0.5;
            icosahedron.rotation.y = elapsed * 0.2 + targetX * 0.5;

            sphere.rotation.y = elapsed * 0.1;

            torus.rotation.z = elapsed * 0.1;
            torus.rotation.x = Math.PI * 0.5 + Math.sin(elapsed * 0.3) * 0.1;

            torus2.rotation.z = -elapsed * 0.08;
            torus2.rotation.y = Math.PI * 0.25 + Math.cos(elapsed * 0.2) * 0.1;

            // Floating motion
            group.position.y = Math.sin(elapsed * 0.4) * 0.3;
            group.rotation.y = targetX * 0.3;
            group.rotation.x = targetY * 0.2;

            // Particle rotation
            particles.rotation.y = elapsed * 0.02;
            particles.rotation.x = elapsed * 0.01;

            // Pulsing effect on ico
            const pulse = Math.sin(elapsed * 1.5) * 0.03 + 0.2;
            icoMaterial.opacity = pulse;

            renderer.render(scene, camera);
        }

        animate();
    }

    initThreeJS();


    // =================== GSAP HERO ANIMATIONS ===================
    function triggerHeroAnimations() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('.hero__title-word', {
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power4.out'
        })
            .to('.hero__tag', {
                opacity: 1,
                y: 0,
                duration: 0.8
            }, '-=0.8')
            .to('.hero__description', {
                opacity: 1,
                y: 0,
                duration: 0.8
            }, '-=0.5')
            .to('.hero__actions', {
                opacity: 1,
                y: 0,
                duration: 0.8
            }, '-=0.5')
            .to('.hero__scroll-indicator', {
                opacity: 1,
                duration: 0.8
            }, '-=0.3');
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
        let cx = 0, cy = 0;
        let ox = 0, oy = 0;

        document.addEventListener('mousemove', (e) => {
            cx = e.clientX;
            cy = e.clientY;
            cursorInner.style.left = cx + 'px';
            cursorInner.style.top = cy + 'px';
        });

        function animateCursor() {
            ox += (cx - ox) * 0.12;
            oy += (cy - oy) * 0.12;
            cursorOuter.style.left = ox + 'px';
            cursorOuter.style.top = oy + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effects on interactive elements
        const interactables = document.querySelectorAll('a, button, .project-card, input, textarea');
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
    }


    // =================== NAVBAR ===================
    const nav = document.getElementById('mainNav');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        // Scrolled state
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Scroll progress bar
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollHeight) * 100;
        if (scrollProgress) scrollProgress.style.width = scrolled + '%';

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
            duration: 1,
            scrollTo: { y: targetEl, offsetY: offset },
            ease: 'power3.inOut'
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
                gsap.from('.mobile-menu__link', {
                    y: 30,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'power3.out',
                    delay: 0.2
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


    // =================== PROJECT CARD TILT EFFECT ===================
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });


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


    // =================== FLOATING PARTICLES (CSS-based) ===================
    function createParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: ${Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(163, 163, 163, 0.2)'};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
            `;
            container.appendChild(particle);

            gsap.to(particle, {
                y: `random(-80, 80)`,
                x: `random(-40, 40)`,
                duration: `random(4, 8)`,
                opacity: `random(0.2, 0.8)`,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 3
            });
        }
    }

    createParticles();


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

});
