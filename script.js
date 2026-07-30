document.addEventListener('DOMContentLoaded', () => {
    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Active Nav Link Highlighting & 5. Smooth Scrolling
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const updateActiveLink = () => {
        let currentId = '';
        
        // Find which section is currently in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentId = section.getAttribute('id');
            }
        });
        
        // Handle bottom of page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
            const lastSection = sections[sections.length - 1];
            currentId = lastSection.getAttribute('id');
        }

        // Add 'active' to the corresponding nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink);
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80; // offset for fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Mobile Menu Toggle
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
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // 6. Typing Animation
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

    // 7. Particle Canvas Animation
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
                this.size = Math.random() * 2 + 1; // 1-3px
                this.speedX = (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
                this.speedY = (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
                this.opacity = Math.random() * 0.4 + 0.1; // 0.1-0.5
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around edges
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

                // Draw lines between nearby particles
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

        // Pause canvas animation when hero is out of view
        const heroObserver = new IntersectionObserver((entries) => {
            isHeroVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        
        const heroSection = document.getElementById('hero');
        if(heroSection) heroObserver.observe(heroSection);
    }

    // 8. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // 9. Counter Animation
    const easeOutQuart = t => 1 - (--t) * t * t * t;
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-count'), 10);
                const duration = 1500;
                let startTime = null;

                const animate = (currentTime) => {
                    if (!startTime) startTime = currentTime;
                    const progress = currentTime - startTime;
                    const percentage = Math.min(progress / duration, 1);
                    
                    const currentValue = Math.floor(easeOutQuart(percentage) * endValue);
                    target.textContent = currentValue;

                    if (progress < duration) {
                        requestAnimationFrame(animate);
                    } else {
                        target.textContent = endValue;
                    }
                };

                requestAnimationFrame(animate);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(el => counterObserver.observe(el));

    // 10. Skill Bar Animation
    const skillCategories = document.querySelectorAll('.skill-category');
    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const category = entry.target;
                const progressBars = category.querySelectorAll('.skill-progress');
                
                progressBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.width = bar.getAttribute('data-width') + '%';
                        bar.classList.add('animated');
                    }, index * 200);
                });
                
                observer.unobserve(category);
            }
        });
    }, { threshold: 0.2 });

    skillCategories.forEach(category => skillObserver.observe(category));

    // 11. Lightbox / Certificate Viewer
    const lightbox = document.getElementById('lightbox');
    const certCards = document.querySelectorAll('.cert-card');
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
        
        if (imgSrc) {
            lightboxImg.src = imgSrc;
            lightboxImg.style.display = 'block';
        } else {
            lightboxImg.src = '';
            lightboxImg.style.display = 'none'; // Fallback if no image is present
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
            card.addEventListener('click', () => openLightbox(index));
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

    // 12. Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const btnSubmit = document.getElementById('btn-submit');
        const formGroups = contactForm.querySelectorAll('.form-group');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Basic validation
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

            // Loading state
            btnSubmit.classList.add('loading');
            btnSubmit.setAttribute('disabled', 'true');

            // Simulate sending
            setTimeout(() => {
                btnSubmit.classList.remove('loading');
                btnSubmit.classList.add('success');
                
                // Reset form
                setTimeout(() => {
                    btnSubmit.classList.remove('success');
                    btnSubmit.removeAttribute('disabled');
                    contactForm.reset();
                }, 2000);
            }, 1500);
        });
        
        // Remove error on input
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            input.addEventListener('input', () => {
                group.classList.remove('error');
            });
        });
    }

    // 13. Phone Mockup Float Animation
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        // Ensure the CSS class float is added on page load for the animation
        phoneMockup.classList.add('float');
    }
});
