document.addEventListener('DOMContentLoaded', () => {
    // ========== SECTION SWITCHING ==========
    const contentSectionIds = ['about', 'skills', 'projects', 'education', 'certifications', 'contact'];
    const contentSections = contentSectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    let activeSection = null;

    // Track which sections have already played their animations
    const animatedSections = new Set();

    // Hide all content sections initially
    contentSections.forEach(section => {
        section.style.display = 'none';
    });

    function showSection(sectionId) {
        // If same section, just scroll to it
        if (activeSection === sectionId) {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        // Hide all content sections
        contentSections.forEach(s => {
            s.classList.remove('active-section');
            s.style.display = 'none';
        });

        // Show target section
        const target = document.getElementById(sectionId);
        if (!target) return;

        target.style.display = 'block';
        void target.offsetHeight; // force reflow for animation
        target.classList.add('active-section');
        activeSection = sectionId;

        // Scroll to the section
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);

        // Trigger animations only on first visit
        if (!animatedSections.has(sectionId)) {
            animatedSections.add(sectionId);

            // Reveal animations with staggered delays
            const reveals = target.querySelectorAll('.reveal');
            reveals.forEach((el, i) => {
                setTimeout(() => el.classList.add('active'), i * 80);
            });

            // Counter animations (about section)
            if (sectionId === 'about') {
                triggerCounters(target);
            }

            // Skill bar animations (skills section)
            if (sectionId === 'skills') {
                // Small delay so reveal plays first
                setTimeout(() => triggerSkillBars(target), 400);
            }
        }

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Update URL hash without scrolling
        history.replaceState(null, null, `#${sectionId}`);
    }

    // ========== COUNTER ANIMATION ==========
    const easeOutQuart = t => 1 - (--t) * t * t * t;

    function triggerCounters(container) {
        const statNumbers = container.querySelectorAll('.stat-number');
        statNumbers.forEach(target => {
            const endValue = parseInt(target.getAttribute('data-count'), 10);
            const duration = 1500;
            let startTime = null;

            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const progress = currentTime - startTime;
                const percentage = Math.min(progress / duration, 1);
                target.textContent = Math.floor(easeOutQuart(percentage) * endValue);

                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    target.textContent = endValue;
                }
            };
            requestAnimationFrame(animate);
        });
    }

    // ========== SKILL BAR ANIMATION ==========
    function triggerSkillBars(container) {
        const categories = container.querySelectorAll('.skill-category');
        categories.forEach(category => {
            const bars = category.querySelectorAll('.skill-progress');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-width') + '%';
                    bar.classList.add('animated');
                }, index * 200);
            });
        });
    }

    // ========== NAV CLICK HANDLERS ==========
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            if (contentSectionIds.includes(sectionId)) {
                showSection(sectionId);
            }
        });
    });

    // ========== HERO CTA & IN-PAGE LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip nav links (already handled above) and empty hrefs
        if (anchor.classList.contains('nav-link')) return;

        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;

            if (contentSectionIds.includes(targetId)) {
                e.preventDefault();
                showSection(targetId);
            }
        });
    });

    // ========== NAVBAR SCROLL EFFECT ==========
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ========== MOBILE MENU TOGGLE ==========
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    const toggleMenu = () => {
        const isMenuOpen = navMenu.classList.contains('active');
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? '' : 'hidden';
    };

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', toggleMenu);
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // ========== TYPING ANIMATION ==========
    const typedTextElement = document.getElementById('typed-text');
    if (typedTextElement) {
        const phrases = ['IT Student', 'Lead Developer', 'Problem Solver', 'Tech Enthusiast'];
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentPhrase = phrases[currentPhraseIndex];
            
            if (isDeleting) {
                typedTextElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
                currentCharIndex--;
            } else {
                typedTextElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
                currentCharIndex++;
            }

            let typeSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && currentCharIndex === currentPhrase.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        };

        type();
    }

    // ========== PARTICLE CANVAS ==========
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        let isHeroVisible = true;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
                this.speedY = (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
                this.opacity = Math.random() * 0.4 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle());
            }
        };

        const animateParticles = () => {
            if (!isHeroVisible) {
                animationFrameId = requestAnimationFrame(animateParticles);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 120)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        };

        initParticles();
        animateParticles();

        const heroObserver = new IntersectionObserver((entries) => {
            isHeroVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        
        const heroSection = document.getElementById('hero');
        if(heroSection) heroObserver.observe(heroSection);
    }

    // ========== CERT ACCORDION TOGGLE ==========
    const accordionHeaders = document.querySelectorAll('.cert-accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const content = header.nextElementSibling;

            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.classList.remove('open');
                }
            });

            header.setAttribute('aria-expanded', !isExpanded);
            content.classList.toggle('open', !isExpanded);
        });
    });

    // ========== LIGHTBOX / CERTIFICATE VIEWER ==========
    const lightbox = document.getElementById('lightbox');
    const certCards = document.querySelectorAll('.cert-card[data-cert]');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    
    let currentCertIndex = 0;

    const openLightbox = (index) => {
        currentCertIndex = index;
        const card = certCards[index];
        
        const img = card.querySelector('img');
        const imgSrc = img ? img.src : '';
        const title = card.querySelector('.cert-title').textContent;
        const desc = card.querySelector('.cert-desc').textContent;
        const rotation = card.getAttribute('data-rotate');
        
        if (imgSrc) {
            lightboxImg.src = imgSrc;
            lightboxImg.style.display = 'block';
        } else {
            lightboxImg.src = '';
            lightboxImg.style.display = 'none';
        }

        if (rotation) {
            lightboxImg.classList.add('rotated');
        } else {
            lightboxImg.classList.remove('rotated');
        }
        
        lightboxTitle.textContent = title;
        lightboxDesc.textContent = desc;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    const nextCert = () => {
        let nextIndex = (currentCertIndex + 1) % certCards.length;
        openLightbox(nextIndex);
    };

    const prevCert = () => {
        let prevIndex = (currentCertIndex - 1 + certCards.length) % certCards.length;
        openLightbox(prevIndex);
    };

    if (lightbox && certCards.length > 0) {
        certCards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(index);
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', closeLightbox);
        lightboxNext.addEventListener('click', nextCert);
        lightboxPrev.addEventListener('click', prevCert);
        
        window.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextCert();
            if (e.key === 'ArrowLeft') prevCert();
        });
    }

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const btnSubmit = document.getElementById('btn-submit');
        const formGroups = contactForm.querySelectorAll('.form-group');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            formGroups.forEach(group => {
                const input = group.querySelector('input, textarea');
                group.classList.remove('error');
                
                if (!input.value.trim()) {
                    isValid = false;
                    group.classList.add('error');
                } else if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        isValid = false;
                        group.classList.add('error');
                    }
                }
            });

            if (!isValid) return;

            btnSubmit.classList.add('loading');
            btnSubmit.setAttribute('disabled', 'true');

            setTimeout(() => {
                btnSubmit.classList.remove('loading');
                btnSubmit.classList.add('success');
                
                setTimeout(() => {
                    btnSubmit.classList.remove('success');
                    btnSubmit.removeAttribute('disabled');
                    contactForm.reset();
                }, 2000);
            }, 1500);
        });
        
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            input.addEventListener('input', () => {
                group.classList.remove('error');
            });
        });
    }

    // ========== PHONE MOCKUP FLOAT ==========
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        phoneMockup.classList.add('float');
    }

    // ========== HANDLE INITIAL HASH ==========
    const initialHash = window.location.hash.substring(1);
    if (initialHash && contentSectionIds.includes(initialHash)) {
        // Small delay so the page renders first
        setTimeout(() => showSection(initialHash), 100);
    }
});
