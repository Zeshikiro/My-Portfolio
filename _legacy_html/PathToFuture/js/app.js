document.addEventListener('DOMContentLoaded', () => {
  // Shared State Initialization
  window.PathToFuture = {
    state: {
      roadmap: JSON.parse(localStorage.getItem('p2f_roadmap') || '{}'),
      quizScores: JSON.parse(localStorage.getItem('p2f_quiz_scores') || '{"correct":0,"total":0}'),
      sqlProgress: JSON.parse(localStorage.getItem('p2f_sql_progress') || '{}'),
      streak: parseInt(localStorage.getItem('p2f_streak') || '0'),
      lastActive: localStorage.getItem('p2f_last_active') || null,
      badges: JSON.parse(localStorage.getItem('p2f_badges') || '[]')
    },
    save(key, value) {
      this.state[key] = value;
      localStorage.setItem('p2f_' + key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    notify(event, data) {
      document.dispatchEvent(new CustomEvent('p2f:' + event, { detail: data }));
    }
  };

  // Streak Management
  const today = new Date().toISOString().split('T')[0];
  const lastActive = window.PathToFuture.state.lastActive;
  
  if (lastActive === today) {
    // Already active today, keep streak
  } else if (lastActive) {
    const lastActiveDate = new Date(lastActive);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastActive === yesterdayStr) {
      // Was active yesterday, increment streak
      window.PathToFuture.save('streak', window.PathToFuture.state.streak + 1);
    } else {
      // Older than yesterday, reset streak
      window.PathToFuture.save('streak', 1);
    }
  } else {
    // First time
    window.PathToFuture.save('streak', 1);
  }
  // Update last active to today
  window.PathToFuture.save('lastActive', today);

  // Navbar
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // Mobile toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Hero Blueprint Canvas Animation
  const canvas = document.getElementById('blueprint-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 45;

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
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'; // cyan with low opacity
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connecting lines
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 - dist / 800})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
  }

  // Hero Stat Counter Animation
  const statNumbers = document.querySelectorAll('.hero-stat-number[data-target]');
  if (statNumbers.length > 0) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'), 10);
          const duration = 2000;
          const startTime = performance.now();
          
          const updateCounter = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            
            const currentVal = Math.floor(easeProgress * target);
            entry.target.innerText = currentVal + (progress === 1 ? '+' : '');
            
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          };
          
          requestAnimationFrame(updateCounter);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => statObserver.observe(stat));
  }

  // Scroll Reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Handle staggered reveals if multiple siblings are revealed together
          const parent = entry.target.parentElement;
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll('.reveal'));
            const index = siblings.indexOf(entry.target);
            if (index !== -1) {
              entry.target.style.transitionDelay = `${index * 100}ms`;
            }
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    reveals.forEach(reveal => revealObserver.observe(reveal));
  }
});
