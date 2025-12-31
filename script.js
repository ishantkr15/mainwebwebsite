document.addEventListener('DOMContentLoaded', () => {
    // --- PRELOADER REMOVED - INSTANT LOAD --- 
    document.querySelectorAll('.delay-100, .delay-200, .delay-300').forEach(el => {
        el.style.animationPlayState = 'running';
    });

    // Navbar Logic
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('shadow-lg');
                navbar.style.background = 'rgba(0, 0, 0, 0.4)';
            } else {
                navbar.classList.remove('shadow-lg');
                navbar.style.background = 'rgba(255, 255, 255, 0.03)';
            }
        });
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default action
            e.stopPropagation(); // Stop bubbling
            mobileMenu.classList.toggle('hidden');

            // Toggle body scroll
            if (mobileMenu.classList.contains('hidden')) {
                document.body.style.overflow = '';
            } else {
                // Only lock scroll for the full-screen menu (fixed)
                if (window.getComputedStyle(mobileMenu).position === 'fixed') {
                    document.body.style.overflow = 'hidden';
                }
            }

            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars-staggered');
                } else {
                    icon.classList.remove('fa-bars-staggered');
                    icon.classList.add('fa-xmark');
                }
            }
        });

        // Close menu when clicking links
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                document.body.style.overflow = '';
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars-staggered');
                }
            });
        });
    } else {
        console.error('Mobile menu elements not found:', { btn: !!mobileMenuBtn, menu: !!mobileMenu });
    }

    // Parallax
    // --- PARALLAX BACKGROUND EFFECT ---
    const blobs = document.querySelectorAll('.liquid-blob');
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.1; // Scale down movement
        mouseY = (e.clientY - window.innerHeight / 2) * 0.1;
    });

    function animateParallax() {
        // Smooth lerp for background
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 0.5; // Different speeds for depth
            const x = targetX * speed;
            const y = targetY * speed;
            blob.style.transform = `translate(${x}px, ${y}px) scale(${1 + Math.abs(x / 500)})`;
        });

        requestAnimationFrame(animateParallax);
    }
    animateParallax();

    // Ripple
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });

    // --- LIQUID PHYSICS ENGINE (Spring Simulation) ---
    const tiltElements = document.querySelectorAll('.glass-panel');

    tiltElements.forEach(el => {
        // Physics State
        const state = {
            rotX: 0, rotY: 0,           // Current Values
            targetRotX: 0, targetRotY: 0, // Target Values (Mouse)
            velX: 0, velY: 0            // Velocity
        };

        const config = {
            tension: 120,    // Stiffness of spring
            friction: 12     // Damping (lower = more wobbly)
        };

        let isHovering = false;
        let animationId = null;

        function updatePhysics() {
            // Spring Force = (Target - Current) * Tension
            // Damping = -Velocity * Friction
            // Acceleration = Force + Damping

            const forceX = (state.targetRotX - state.rotX) * (config.tension * 0.001);
            const forceY = (state.targetRotY - state.rotY) * (config.tension * 0.001);

            state.velX += forceX - (state.velX * config.friction * 0.01);
            state.velY += forceY - (state.velY * config.friction * 0.01);

            state.rotX += state.velX;
            state.rotY += state.velY;

            // Apply Transform
            el.style.transform = `perspective(1000px) rotateX(${state.rotX}deg) rotateY(${state.rotY}deg) scale(${isHovering ? 1.02 : 1})`;

            // Stop loop if resting near zero and not hovering
            if (!isHovering && Math.abs(state.rotX) < 0.01 && Math.abs(state.rotY) < 0.01 && Math.abs(state.velX) < 0.01) {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                return;
            }

            animationId = requestAnimationFrame(updatePhysics);
        }

        el.addEventListener('mousemove', (e) => {
            isHovering = true;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate Target Rotation
            // Max rotation += 15deg
            state.targetRotX = -((y - rect.height / 2) / rect.height * 15);
            state.targetRotY = (x - rect.width / 2) / rect.width * 15;

            if (!animationId) updatePhysics();
        });

        el.addEventListener('mouseleave', () => {
            isHovering = false;
            state.targetRotX = 0;
            state.targetRotY = 0;
            // Loop continues until spring settles
        });

        // Initial kick to ensure loop structure works if they enter/exit fast
        el.addEventListener('mouseenter', () => {
            if (!animationId) updatePhysics();
        });
    });
    const magneticBtns = document.querySelectorAll('.btn-liquid, .btn-glow, .float-icon');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // Budget Slider (REMOVED) - Logic cleaned up


    // Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up'); entry.target.style.opacity = '1'; observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-on-scroll').forEach(el => {
        el.style.opacity = '0'; el.classList.remove('fade-in-up'); observer.observe(el);
    });

    // --- DEMO MODAL LOGIC (UPDATED) ---
    const demoConfig = {
        'clean': 'https://en.wikipedia.org/wiki/Clean_design',
        'modern': 'https://en.wikipedia.org/wiki/Modern_architecture',
        'business': 'https://en.wikipedia.org/wiki/Business',
        'portfolio': 'https://en.wikipedia.org/wiki/Artist_portfolio',
    };

    const modal = document.getElementById('previewModal');
    const modalIframe = document.getElementById('previewIframe');

    // Elements for Toggle
    const deviceWrapper = document.getElementById('deviceWrapper');
    const lidContainer = document.getElementById('lidContainer');
    const macBase = document.getElementById('macBase');
    const macNotch = document.getElementById('macNotch');
    const phoneIsland = document.getElementById('phoneIsland');

    window.openPreview = (key) => {
        const url = demoConfig[key];
        if (modal && modalIframe && url) {
            modalIframe.src = url;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';

            setDeviceMode('desktop');
            modal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
        }
    };

    window.setDeviceMode = (mode) => {
        const desktopBtn = document.getElementById('btnDesktop');
        const mobileBtn = document.getElementById('btnMobile');

        if (mode === 'desktop') {
            // UI State
            desktopBtn.classList.add('active'); mobileBtn.classList.remove('active');

            // Device State -> MacBook
            deviceWrapper.className = 'macbook-mockup device-wrapper';
            lidContainer.className = 'macbook-lid';

            macBase.classList.remove('hidden');
            macNotch.classList.remove('hidden');
            phoneIsland.classList.add('hidden');

        } else {
            // UI State
            mobileBtn.classList.add('active'); desktopBtn.classList.remove('active');

            // Device State -> iPhone
            deviceWrapper.className = 'iphone-mockup device-wrapper';

            // BUGFIX: iPhone Height Issue
            // We remove 'macbook-lid' styling but ADD 'h-full-important' to let inner content expand
            lidContainer.className = 'h-full-important';

            macBase.classList.add('hidden');
            macNotch.classList.add('hidden');
            phoneIsland.classList.remove('hidden');
        }
    }

    const closeModal = () => {
        if (modal) {
            modal.classList.add('hidden'); modal.classList.remove('flex');
            document.body.style.overflow = 'auto'; if (modalIframe) modalIframe.src = '';
        }
    };

    document.getElementById('closeModal')?.addEventListener('click', closeModal);
});
