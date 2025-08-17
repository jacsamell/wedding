// Enhanced parallax scrolling effect
document.addEventListener('DOMContentLoaded', function() {
    const parallaxElements = document.querySelectorAll('.parallax-layer');
    const body = document.body;
    
    // Update parallax on scroll with enhanced effects
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // No longer updating body parallax to prevent jumping
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const rect = element.getBoundingClientRect();
            const visible = rect.bottom >= 0 && rect.top <= windowHeight;
            
            if (visible) {
                const yPos = -(scrolled * speed);
                
                // Add subtle rotation for leaf elements
                const rotation = element.classList.contains('leaf-layer') ? 
                    Math.sin(scrolled * 0.001) * 3 : 0;
                
                element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
            }
        });
        
        // Parallax for pseudo-elements (floating leaves)
        const hero = document.querySelector('.hero');
        if (hero) {
            const leafOffset = scrolled * 0.15;
            hero.style.setProperty('--leaf-offset', `${leafOffset}px`);
        }
    }
    
    // Throttle function for performance
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply parallax on scroll with throttling
    window.addEventListener('scroll', throttle(updateParallax, 10));
    
    // Initial call
    updateParallax();
});

// Intersection Observer for all animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class with delay if specified
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .scale-in, .reveal-text, .letter-animate, .draw-line, .rotate-in, .blur-in, .detail-card, .menu-category, .info-card, .shimmer, .count-up, .cascade-in, .gift-content');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Special handling for letter animations
    const letterAnimateElements = document.querySelectorAll('.letter-animate');
    letterAnimateElements.forEach(element => {
        const text = element.textContent;
        element.innerHTML = text.split('').map(letter => 
            letter === ' ' ? ' ' : `<span>${letter}</span>`
        ).join('');
    });
    
    // Number counter animation
    const countUpElements = document.querySelectorAll('.count-up');
    countUpElements.forEach(element => {
        const endValue = parseInt(element.textContent);
        element.textContent = '0';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(element, endValue);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(element);
    });
    
    function animateCounter(element, endValue) {
        const duration = 2000;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(endValue * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// RSVP button interaction (placeholder for future functionality)
document.addEventListener('DOMContentLoaded', function() {
    const rsvpButton = document.querySelector('.rsvp-button');
    
    if (rsvpButton) {
        rsvpButton.addEventListener('click', function() {
            // Placeholder for RSVP functionality
            // Will be connected to the backend later
            alert('RSVP form will be available soon. Please check back later!');
        });
    }
});

// Add parallax to mouse movement on hero section (subtle effect)
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        hero.addEventListener('mousemove', function(e) {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 20;
            
            heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        hero.addEventListener('mouseleave', function() {
            heroContent.style.transform = 'translate(0, 0)';
        });
    }
});

// Magnetic button effect
document.addEventListener('DOMContentLoaded', function() {
    const magneticButtons = document.querySelectorAll('.rsvp-button');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Reduce the effect strength
            const moveX = x * 0.15;
            const moveY = y * 0.15;
            
            button.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.transform = 'translate(0, 0)';
        });
    });
    
    // Subtle hover effect for detail cards
    const detailCards = document.querySelectorAll('.detail-card');
    detailCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (this.classList.contains('visible')) {
                this.style.transform = 'scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('visible')) {
                this.style.transform = 'scale(1)';
            }
        });
    });
});

// Preload images for better performance
function preloadImages() {
    const images = [
        // Add actual image URLs here when you have them
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call preload when page loads
window.addEventListener('load', preloadImages);
