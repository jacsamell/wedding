import { $$, createObserver, easing } from './utils';
import { initEnhancedEffects } from './enhanced-effects';

const ANIMATION_SELECTORS = [
    '.fade-in-up', '.slide-in-left', '.slide-in-right', '.scale-in',
    '.reveal-text', '.letter-animate', '.draw-line', '.rotate-in',
    '.blur-in', '.detail-card', '.menu-category', '.info-card',
    '.shimmer', '.count-up', '.gift-content'
].join(', ');

export function initAnimations(): void {
    observeAnimatedElements();
    initLetterAnimations();
    initCountUpAnimations();
    initHeroEffects();
    initEnvelopeAnimation();
    initScrollIndicator();
    initPremiumEffects();
    initTreeBreathing();
    initGentleLeaves();
    initEnhancedEffects();
}

function observeAnimatedElements(): void {
    const elements = $$(ANIMATION_SELECTORS);
    
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target as HTMLElement;
                const delay = parseInt(element.dataset.delay || '0');
                
                setTimeout(() => {
                    element.classList.add('visible');
                    element.dispatchEvent(new CustomEvent('animation:visible'));
                }, delay);
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    elements.forEach(element => observer.observe(element));
}

function initLetterAnimations(): void {
    $$<HTMLElement>('.letter-animate').forEach(element => {
        const text = element.textContent || '';
        const letters = text.split('').map(letter => 
            letter === ' ' ? '&nbsp;' : `<span>${letter}</span>`
        );
        
        element.innerHTML = letters.join('');
        element.setAttribute('aria-label', text);
    });
}

function initCountUpAnimations(): void {
    $$<HTMLElement>('.count-up').forEach(element => {
        const endValue = parseInt(element.textContent || '0');
        const duration = parseInt(element.dataset.duration || '2000');
        
        element.textContent = '0';
        element.dataset.endValue = endValue.toString();
        
        const observer = createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target as HTMLElement, endValue, duration);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(element);
    });
}

function animateCounter(
    element: HTMLElement, 
    endValue: number, 
    duration: number = 2000
): void {
    const startTime = performance.now();
    const startValue = parseInt(element.textContent || '0');
    
    function updateCounter(currentTime: number): void {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing.easeOutQuart(progress);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        
        element.textContent = currentValue.toString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.dispatchEvent(new CustomEvent('countup:complete'));
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function initHeroEffects(): void {
    const hero = document.querySelector<HTMLElement>('.hero');
    const heroContent = document.querySelector<HTMLElement>('.hero-content');
    
    if (!hero || !heroContent) return;
    
    let rafId: number | null = null;
    
    const handleMouseMove = (e: MouseEvent): void => {
        if (rafId) return;
        
        rafId = requestAnimationFrame(() => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 20;
            
            heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
            rafId = null;
        });
    };
    
    hero.addEventListener('mousemove', handleMouseMove);
    
    hero.addEventListener('mouseleave', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        heroContent.style.transform = 'translate(0, 0)';
    });
}

function initEnvelopeAnimation(): void {
    const envelope = document.querySelector<HTMLElement>('.envelope');
    const scrollIndicator = document.querySelector<HTMLElement>('.scroll-indicator');
    
    if (!envelope) return;
    
    envelope.addEventListener('click', function() {
        this.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        
        setTimeout(() => {
            const countdownSection = document.querySelector<HTMLElement>('.countdown-section');
            countdownSection?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    });
    
    setTimeout(() => {
        envelope.classList.add('hint');
        envelope.setAttribute('aria-label', 'Click to open');
        
        setTimeout(() => {
            envelope.classList.remove('hint');
        }, 1000);
    }, 2000);
    
    if (scrollIndicator) {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset;
                    const maxScroll = 150;
                    const opacity = Math.max(0, 1 - (scrollTop / maxScroll));
                    
                    scrollIndicator.style.opacity = opacity.toString();
                    scrollIndicator.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
                    
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}

function initScrollIndicator(): void {
    const indicator = document.querySelector<HTMLElement>('.scroll-indicator');
    if (!indicator) return;

    const scrollToNext = () => {
        const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[];
        const heroIndex = sections.findIndex(s => s.id === 'home');
        const next = sections[heroIndex + 1] || sections[0];
        next?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    indicator.style.pointerEvents = 'auto';
    indicator.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToNext();
    });
}

function initPremiumEffects(): void {
    // Add sparkles to section titles
    $$<HTMLElement>('.section-title').forEach(title => {
        title.addEventListener('mouseenter', () => createSparkles(title));
    });
    
    // Add text reveal effects
    $$('.reveal-text').forEach(element => {
        const observer = createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(element);
    });
    
    // Add cascade effects to grids
    $$('.details-grid, .menu-items, .info-grid').forEach(grid => {
        const children = grid.children;
        const observer = createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(grid);
    });
    
    // Dynamic typography effects on scroll
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        const heroText = document.querySelector<HTMLElement>('.names');
        
        if (heroText) {
            const scale = Math.max(0.8, 1 - (scrollY * 0.0005));
            const opacity = Math.max(0, 1 - (scrollY * 0.002));
            
            heroText.style.transform = `scale(${scale})`;
            heroText.style.opacity = opacity.toString();
        }
    }, { passive: true });
}

function createSparkles(element: HTMLElement): void {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-effect';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.innerHTML = '✨';
            
            element.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1500);
        }, i * 200);
    }
}

function initTreeBreathing(): void {
    // Add subtle breathing animation to the tree
    let breathingPhase = 0;
    
    function animateTreeBreathing() {
        breathingPhase += 0.01;
        const breathScale = 1 + Math.sin(breathingPhase) * 0.02;
        const breathOpacity = 0.7 + Math.sin(breathingPhase * 0.7) * 0.1;
        
        document.body.style.setProperty('--tree-breath-scale', breathScale.toString());
        document.body.style.setProperty('--tree-breath-opacity', breathOpacity.toString());
        
        requestAnimationFrame(animateTreeBreathing);
    }
    
    animateTreeBreathing();
}

function initGentleLeaves(): void {
    const leafContainer = document.querySelector<HTMLElement>('.floating-leaves');
    
    if (leafContainer) {
        const leafSvg = encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path fill='#2e7d32' d='M12 34c6-14 22-18 34-14 5 2 6 8 3 13-6 10-20 13-29 11l-5 5c-1 1-3-1-2-2l5-5c-3-4-5-5-6-8z'/><path fill='#1b5e20' d='M18 40c8 2 20-1 26-10 3-4 1-8-2-9 3 3 2 6 0 9-5 8-16 11-24 10z'/><path fill='#388e3c' d='M28 21c3 0 6 1 8 2-6-1-11 2-14 5-3 3-5 7-6 11-1-3 1-8 4-11 2-3 5-6 8-7z'/></svg>`);

        const randomInRange = (min: number, max: number): number => min + Math.random() * (max - min);
        const makeLeaf = (): string => {
            const delay = randomInRange(0, 14);
            const duration = randomInRange(22, 34);
            const sway = randomInRange(10, 26);
            const spin = randomInRange(10, 28);
            const drift = randomInRange(40, 120);
            const opacity = randomInRange(0.35, 0.65).toFixed(2);
            const size = randomInRange(28, 40);
            return `
            <div class="gentle-leaf" style="opacity:${opacity}; animation-delay:${delay}s; animation-duration:${duration}s; --sway:${sway}px; --spin:${spin}deg; --drift:${drift}px;">
                <img class="leaf-img" style="width:${size}px; height:${size}px;" src="data:image/svg+xml;utf8,${leafSvg}" alt="leaf" />
            </div>`;
        };

        const leaves: string[] = [];
        const count = 7;
        for (let i = 0; i < count; i++) leaves.push(makeLeaf());
        leafContainer.innerHTML = leaves.join('');
    }
}
