document.addEventListener('DOMContentLoaded', () => {
    // ========== SECTION SWITCHING ==========
    const contentSectionIds = ['hero', 'about', 'skills', 'projects', 'education', 'certifications', 'contact'];
    const contentSections = contentSectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const navLinks = document.querySelectorAll('.nav-link, .nav-logo');
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

        target.style.display = '';
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

        let mouse = { x: null, y: null, radius: 150 };
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
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

                // Mouse interactivity
                if (mouse.x != null && isHeroVisible) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    if (distance < mouse.radius) {
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
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
                        ctx.strokeStyle = `rgba(108, 99, 255, ${0.3 * (1 - distance / 120)})`; // Added a subtle purple tint to connections
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
        if (imgSrc) {
            lightboxImg.src = imgSrc;
            lightboxImg.style.display = 'block';
        } else {
            lightboxImg.src = '';
            lightboxImg.style.display = 'none';
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

    // ========== CONTACT SOCIAL DROPDOWN ==========
    const socialDropdown = document.getElementById('social-dropdown');
    if (socialDropdown) {
        const header = socialDropdown.querySelector('.contact-card-header');
        if (header) {
            header.addEventListener('click', () => {
                socialDropdown.classList.toggle('open');
            });
        }
    }

    // ========== PHONE MOCKUP FLOAT ==========
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        phoneMockup.classList.add('float');
    }

    // ========== HANDLE INITIAL HASH ==========
    const initialHash = window.location.hash.substring(1);
    if (initialHash && contentSectionIds.includes(initialHash)) {
        setTimeout(() => showSection(initialHash), 100);
    } else {
        setTimeout(() => showSection('hero'), 100);
    }

    // ========== NEW INTERACTIVE FEATURES ==========

    // 1. Navbar Sliding Indicator
    const navIndicator = document.getElementById('nav-indicator');
    const updateNavIndicator = () => {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink && navIndicator) {
            const rect = activeLink.getBoundingClientRect();
            const menuRect = navMenu.getBoundingClientRect();
            navIndicator.style.width = `${rect.width}px`;
            navIndicator.style.left = `${rect.left - menuRect.left}px`;
            navIndicator.style.opacity = '1';
        } else if (navIndicator) {
            navIndicator.style.opacity = '0';
        }
    };
    
    // Update indicator when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(updateNavIndicator, 50); // slight delay to allow .active class to apply
        });
    });
    // Call once on load and resize
    setTimeout(updateNavIndicator, 150);
    window.addEventListener('resize', updateNavIndicator);

    // 2. Custom Cursor
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    
    if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let outlineX = mouseX;
        let outlineY = mouseY;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot follows exactly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });
        
        // Smooth follow for outline
        const animateCursor = () => {
            let distX = mouseX - outlineX;
            let distY = mouseY - outlineY;
            
            outlineX = outlineX + (distX * 0.15);
            outlineY = outlineY + (distY * 0.15);
            
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
        
        // Hover states
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .cert-card, .project-card, .stat-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    // 3. Magnetic Hover Buttons
    const magneticElements = document.querySelectorAll('.btn, .social-link, .nav-logo');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Move element slightly towards cursor
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            // Reset transition for snap back
            el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
        
        el.addEventListener('mouseenter', () => {
            // Remove transition for immediate mouse follow
            el.style.transition = 'none';
        });
    });

    // 4. 3D Tilt Cards
    const tiltCards = document.querySelectorAll('.project-card, .stat-card, .cert-card');
    tiltCards.forEach(card => {
        card.classList.add('tilt-card');
        
        // Create glare element
        const glare = document.createElement('div');
        glare.classList.add('tilt-glare');
        card.appendChild(glare);
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate tilt based on cursor position relative to center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
            const tiltY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
            
            // Move glare
            glare.style.opacity = '1';
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            glare.style.opacity = '0';
        });
    });

    // 5. Section Title Decode Effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*0123456789';
    const originalShowSection = showSection;
    
    // We overwrite the existing showSection function to add the decode effect
    window.showSection = function(sectionId) {
        originalShowSection(sectionId);
        
        // Find title in newly active section
        const section = document.getElementById(sectionId);
        if(!section) return;
        
        const title = section.querySelector('.section-title');
        if (title && !title.classList.contains('decoding')) {
            title.classList.add('decoding');
            
            // Wrap text nodes in spans for effect
            const textNodes = [];
            const walk = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while(node = walk.nextNode()) {
                if (node.nodeValue.trim().length > 0) textNodes.push(node);
            }
            
            textNodes.forEach(textNode => {
                const originalText = textNode.nodeValue;
                let iterations = 0;
                
                const interval = setInterval(() => {
                    textNode.nodeValue = originalText.split('')
                        .map((char, index) => {
                            if (index < iterations || char === ' ') return char;
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');
                    
                    iterations += 1/3;
                    
                    if (iterations >= originalText.length) {
                        clearInterval(interval);
                        textNode.nodeValue = originalText;
                        title.classList.remove('decoding');
                    }
                }, 30);
            });
        }
    };
    
    // Replace the internal reference too
    const _showSectionRef = showSection;
    
    // 6. Interactive Terminal
    const terminalToggle = document.getElementById('terminal-toggle');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalClose = document.getElementById('terminal-close');
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');
    
    if (terminalToggle && terminalOverlay) {
        const toggleTerminal = () => {
            terminalOverlay.classList.toggle('active');
            if (terminalOverlay.classList.contains('active')) {
                setTimeout(() => terminalInput.focus(), 100);
            }
        };
        
        terminalToggle.addEventListener('click', toggleTerminal);
        terminalClose.addEventListener('click', toggleTerminal);
        terminalOverlay.addEventListener('click', (e) => {
            if (e.target === terminalOverlay) toggleTerminal();
        });
        
        const printLine = (html, isPrompt = false) => {
            const line = document.createElement('div');
            line.classList.add(isPrompt ? 'terminal-input-line' : 'terminal-line');
            line.innerHTML = html;
            
            // Insert before the actual input line
            const inputContainer = terminalInput.parentElement;
            terminalBody.insertBefore(line, inputContainer);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        };
        
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim().toLowerCase();
                terminalInput.value = '';
                
                // Echo prompt
                printLine(`<span class="terminal-prompt">guest@jrn-portfolio:~$</span> ${cmd}`);
                
                // Handle commands
                if (cmd === '') return;
                
                switch(cmd) {
                    case 'help':
                        printLine('Available commands: <br> - <span class="accent">whoami</span>: About me<br> - <span class="accent">skills</span>: My tech stack<br> - <span class="accent">projects</span>: View projects<br> - <span class="accent">contact</span>: Get email<br> - <span class="accent">socials</span>: View social links<br> - <span class="accent">clear</span>: Clear terminal');
                        break;
                    case 'whoami':
                        printLine('John Ryan Nicolas <br> IT Student & Developer <br> Lead Developer of STEP-UP AR App.');
                        break;
                    case 'skills':
                        printLine('Tech Stack: HTML, CSS, Python, Java, MySQL, Linux, Git, Prompt Engineering.');
                        break;
                    case 'projects':
                        printLine('Featured: <br> - STEP-UP (AR Step Tracker) <br> - Project Website <br> - GitHub Open Source');
                        setTimeout(() => _showSectionRef('projects'), 1000);
                        break;
                    case 'contact':
                        printLine('Email: johnryannicolas43@gmail.com');
                        break;
                    case 'socials':
                        printLine('GitHub: github.com/Zeshikiro <br> LinkedIn: linkedin.com/in/john-ryan-nicolas-21b058332');
                        break;
                    case 'clear':
                        // Remove all lines except the last one (input)
                        const lines = terminalBody.querySelectorAll('.terminal-line, .terminal-input-line:not(:last-child)');
                        lines.forEach(l => l.remove());
                        break;
                    default:
                        printLine(`Command not found: ${cmd}. Type 'help' for available commands.`);
                }
            }
        });
    }

});
