import { $$ } from './utils';

interface MagneticElement extends HTMLElement {
    dataset: {
        magneticStrength?: string;
    };
}

export function initInteractions(): void {
    initMagneticButtons();
    initDetailCardHovers();
    initAccommodationLinks();
    initRippleEffects();
    initGiftSparkles();
    initScrollProgress();
}

function initMagneticButtons(): void {
    const selectors = '.rsvp-button, .detail-card, .hero-text, .menu-category';
    const elements = $$<MagneticElement>(selectors);
    
    elements.forEach(element => {
        const strength = parseFloat(element.dataset.magneticStrength || '0.15');
        let rafId: number | null = null;
        
        element.addEventListener('mousemove', function(e: MouseEvent) {
            if (rafId) return;
            
            rafId = requestAnimationFrame(() => {
                const rect = this.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const x = e.clientX - rect.left - centerX;
                const y = e.clientY - rect.top - centerY;
                
                const moveX = x * strength;
                const moveY = y * strength;
                
                if (element.matches('.detail-card, .menu-category')) {
                    const rotateX = y * 0.05;
                    const rotateY = -x * 0.05;
                    this.style.transform = 
                        `translate(${moveX}px, ${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                } else {
                    this.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
                
                rafId = null;
            });
        });
        
        element.addEventListener('mouseleave', function() {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            this.style.transform = 'translate(0, 0) rotateX(0) rotateY(0)';
        });
    });
}

function initDetailCardHovers(): void {
    const cards = $$<HTMLElement>('.detail-card');
    
    cards.forEach(card => {
        let isVisible = false;
        
        card.addEventListener('animation:visible', () => {
            isVisible = true;
        });
        
        card.addEventListener('mouseenter', function() {
            if (isVisible) {
                this.style.transform = 'scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (isVisible) {
                this.style.transform = 'scale(1)';
            }
        });
    });
}

function initAccommodationLinks(): void {
    const links = $$<HTMLElement>('.info-link');
    
    links.forEach(link => {
        link.addEventListener('mousemove', function(e: MouseEvent) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.setProperty('--mouse-x', `${x}px`);
            this.style.setProperty('--mouse-y', `${y}px`);
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.removeProperty('--mouse-x');
            this.style.removeProperty('--mouse-y');
        });
    });
}





function initRippleEffects(): void {
    const elements = $$<HTMLElement>('button, .detail-card');
    
    elements.forEach(element => {
        element.classList.add('ripple-container');
        
        element.addEventListener('click', function(e: MouseEvent) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            ripple.addEventListener('animationend', () => ripple.remove());
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initGiftSparkles(): void {
    const giftTarget = document.querySelector<HTMLElement>('.gift-card')
        || document.querySelector<HTMLElement>('.gift-section');
    
    if (giftTarget) {
        let sparkleInterval: ReturnType<typeof setInterval>;
        
        giftTarget.addEventListener('mouseenter', () => {
            const createSparkles = () => {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const sparkle = document.createElement('div');
                        sparkle.className = 'gift-sparkle';
                        sparkle.innerHTML = '✨';
                        
                        const side = Math.random() > 0.5 ? 'left' : 'right';
                        sparkle.style[side] = Math.random() * 30 + '%';
                        sparkle.style.top = Math.random() * 100 + '%';
                        
                        giftTarget.appendChild(sparkle);
                        
                        setTimeout(() => sparkle.remove(), 2000);
                    }, i * 200);
                }
            };
            
            createSparkles();
            sparkleInterval = setInterval(createSparkles, 1500);
        });
        
        giftTarget.addEventListener('mouseleave', () => {
            clearInterval(sparkleInterval);
        });
    }
}

function initScrollProgress(): void {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const progress = scrollTop / documentHeight;
        
        progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });
}
