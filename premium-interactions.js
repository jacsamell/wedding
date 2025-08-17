// Premium Interactions and Effects

// Custom Cursor
document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.createElement('div');
    const cursorFollower = document.createElement('div');
    cursor.className = 'cursor';
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorFollower);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Main cursor
        cursorX += (mouseX - cursorX) * 0.3;
        cursorY += (mouseY - cursorY) * 0.3;
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';

        // Follower
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        cursorFollower.style.left = followerX - 20 + 'px';
        cursorFollower.style.top = followerY - 20 + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .detail-card, .menu-category');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursorFollower.style.transform = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorFollower.style.transform = 'scale(1)';
        });
    });
});

// Scroll Progress Bar
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const progress = scrollTop / documentHeight;
        
        progressBar.style.transform = `scaleX(${progress})`;
    });
});

// Ambient Particles
document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = 10 + Math.random() * 10 + 's';
        particlesContainer.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 20000);
    }

    // Create particles periodically
    setInterval(createParticle, 2000);
    
    // Initial particles
    for(let i = 0; i < 5; i++) {
        setTimeout(createParticle, i * 400);
    }
});

// Enhanced Magnetic Effects
document.addEventListener('DOMContentLoaded', function() {
    const magneticElements = document.querySelectorAll('.detail-card, .hero-text, .menu-category');
    
    magneticElements.forEach(elem => {
        elem.classList.add('magnetic');
        
        elem.addEventListener('mousemove', function(e) {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = x * 0.1;
            const moveY = y * 0.1;
            const rotateX = y * 0.05;
            const rotateY = -x * 0.05;
            
            elem.style.transform = `translate(${moveX}px, ${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        elem.addEventListener('mouseleave', function() {
            elem.style.transform = 'translate(0, 0) rotateX(0) rotateY(0)';
        });
    });
});

// Text Split Animation
document.addEventListener('DOMContentLoaded', function() {
    const splitTextElements = document.querySelectorAll('.section-title');
    
    splitTextElements.forEach(element => {
        if (!element.classList.contains('letter-animate')) {
            const text = element.textContent;
            const words = text.split(' ');
            
            element.innerHTML = words.map(word => 
                `<span class="split-word">${word}</span>`
            ).join(' ');
            
            element.classList.add('split-text');
        }
    });
});

// Premium Reveal Animations
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.story-content, .menu-description, .gallery-placeholder, .gift-content');
    
    revealElements.forEach(element => {
        element.classList.add('reveal-scale');
    });
    
    // Add to intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
});

// Morph Background Effect
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.our-story, .event-details, .menu-preview');
    
    sections.forEach(section => {
        const morphBg = document.createElement('div');
        morphBg.className = 'morph-bg';
        section.style.position = 'relative';
        section.insertBefore(morphBg, section.firstChild);
    });
});

// Smooth Scroll with Parallax Calculation
let ticking = false;
function updateParallaxDepth() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const speed = 0.5;
            
            // Update CSS variables for ultra-smooth parallax
            document.documentElement.style.setProperty('--scroll', scrolled);
            document.documentElement.style.setProperty('--scroll-speed', scrolled * speed);
            
            ticking = false;
        });
        ticking = true;
    }
}
window.addEventListener('scroll', updateParallaxDepth);

// Premium Button Ripple Effect
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button, .detail-card');
    
    buttons.forEach(button => {
        button.classList.add('premium-button');
        
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.className = 'ripple';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Section Transition Effects
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section:not(.hero)');
    
    sections.forEach(section => {
        section.classList.add('section-transition');
    });
});

// Dynamic Typography on Scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroText = document.querySelector('.names');
    
    if (heroText) {
        const scale = 1 + (scrolled * 0.0003);
        const opacity = 1 - (scrolled * 0.001);
        
        if (opacity > 0) {
            heroText.style.transform = `scale(${Math.min(scale, 1.2)})`;
            heroText.style.opacity = Math.max(opacity, 0);
        }
    }
});

// Initialize Premium Effects
window.addEventListener('load', () => {
    document.body.classList.add('premium-loaded');
    
    // Add data attributes for text effects
    const heroNames = document.querySelector('.names');
    if (heroNames) {
        heroNames.setAttribute('data-text', heroNames.textContent);
    }
});

// Gift Section Sparkle Effect
document.addEventListener('DOMContentLoaded', function() {
    const giftSection = document.querySelector('.gift-section');
    
    if (giftSection) {
        let sparkleTimeout;
        
        giftSection.addEventListener('mouseenter', function() {
            // Create sparkles periodically while hovering
            const createSparkles = () => {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const sparkle = document.createElement('div');
                        sparkle.className = 'sparkle-gift';
                        
                        // Random position around the gift boxes
                        const side = Math.random() > 0.5 ? 'left' : 'right';
                        if (side === 'left') {
                            sparkle.style.left = Math.random() * 30 + '%';
                        } else {
                            sparkle.style.right = Math.random() * 30 + '%';
                        }
                        sparkle.style.top = Math.random() * 100 + '%';
                        
                        giftSection.appendChild(sparkle);
                        
                        setTimeout(() => sparkle.remove(), 2000);
                    }, i * 200);
                }
            };
            
            createSparkles();
            sparkleTimeout = setInterval(createSparkles, 1500);
        });
        
        giftSection.addEventListener('mouseleave', function() {
            clearInterval(sparkleTimeout);
        });
    }
});

// Accommodation Links Interaction
document.addEventListener('DOMContentLoaded', function() {
    const infoLinks = document.querySelectorAll('.info-link');
    
    infoLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.setProperty('--mouse-x', `${x}px`);
            this.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
