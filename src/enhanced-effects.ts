import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initEnhancedEffects(): void {
    initSmoothScrollAnimations();
    initParallaxEnhancements();
    initMagneticElements();
    initTextRevealEffects();
}

function initSmoothScrollAnimations(): void {
    // Enhanced fade-up animations with GSAP
    gsap.fromTo('.fade-in-up', {
        opacity: 0,
        y: 60,
        scale: 0.95
    }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.fade-in-up',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    // Enhanced slide animations
    gsap.fromTo('.slide-in-left', {
        opacity: 0,
        x: -80,
        rotation: -5
    }, {
        opacity: 1,
        x: 0,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)",
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.slide-in-left',
            start: 'top 90%'
        }
    });

    gsap.fromTo('.slide-in-right', {
        opacity: 0,
        x: 80,
        rotation: 5
    }, {
        opacity: 1,
        x: 0,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)",
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.slide-in-right',
            start: 'top 90%'
        }
    });
}

function initParallaxEnhancements(): void {
    // Enhanced parallax for cards
    gsap.utils.toArray('.detail-card').forEach((card: any) => {
        gsap.to(card, {
            y: -30,
            ease: "none",
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });

    // Hero text parallax
    gsap.to('.hero-text', {
        y: -50,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}

function initMagneticElements(): void {
    const magneticElements = document.querySelectorAll('.detail-card, .menu-category, .info-card');
    
    magneticElements.forEach((element) => {
        const el = element as HTMLElement;
        
        element.addEventListener('mouseenter', () => {
            gsap.to(element, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
        
        element.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const mouseEvent = e as MouseEvent;
            const x = mouseEvent.clientX - rect.left - rect.width / 2;
            const y = mouseEvent.clientY - rect.top - rect.height / 2;
            
            gsap.to(element, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
}

function initTextRevealEffects(): void {
    // Enhanced text reveal with GSAP SplitText-like effect
    const revealTexts = document.querySelectorAll('.section-title');
    
    revealTexts.forEach((text) => {
        const chars = text.textContent?.split('') || [];
        text.innerHTML = chars.map(char => 
            char === ' ' ? '&nbsp;' : `<span class="char">${char}</span>`
        ).join('');
        
        gsap.fromTo(text.querySelectorAll('.char'), {
            opacity: 0,
            y: 50,
            rotation: 10
        }, {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.8,
            stagger: 0.03,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: text,
                start: 'top 85%'
            }
        });
    });
}

// Cleanup function
export function cleanupEnhancedEffects(): void {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
