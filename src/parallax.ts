import { $$, throttle } from './utils';

interface ParallaxElement extends HTMLElement {
    dataset: {
        speed?: string;
    };
}

export function initParallax(): (() => void) | void {
    const elements = $$<ParallaxElement>('.parallax-layer');
    const hero = document.querySelector<HTMLElement>('.hero');
    const bodyBg = document.body;
    
    if (!elements.length) return;

    let rafId: number | null = null;

    const updateParallax = throttle(() => {
        if (rafId) return;
        
        rafId = requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // Enhanced elm tree background parallax
            const treeParallaxStrength = 0.3;
            const treeOffset = scrolled * treeParallaxStrength;
            const treeRotation = Math.sin(scrolled * 0.0005) * 2;
            const treeScale = 1 + (scrolled * 0.00008);
            
            // Apply tree parallax to body pseudo-element via CSS custom properties
            bodyBg.style.setProperty('--tree-offset-y', `${treeOffset}px`);
            bodyBg.style.setProperty('--tree-rotation', `${treeRotation}deg`);
            bodyBg.style.setProperty('--tree-scale', `${Math.min(treeScale, 1.2)}`);
            
            // Layer parallax effects
            elements.forEach(element => {
                const speed = parseFloat(element.dataset.speed || '0.5');
                const rect = element.getBoundingClientRect();
                const visible = rect.bottom >= 0 && rect.top <= windowHeight;
                
                if (visible) {
                    const yPos = -(scrolled * speed);
                    let rotation = 0;
                    let xPos = 0;
                    
                    if (element.classList.contains('leaf-layer')) {
                        rotation = Math.sin(scrolled * 0.001) * 5;
                        xPos = Math.sin(scrolled * 0.0008) * 10;
                    }
                    
                    element.style.transform = `translateY(${yPos}px) translateX(${xPos}px) rotate(${rotation}deg)`;
                }
            });
            
            // Enhanced floating leaves with tree movement
            if (hero) {
                const leafOffset = scrolled * 0.15;
                const leafSway = Math.sin(scrolled * 0.002) * 20;
                hero.style.setProperty('--leaf-offset', `${leafOffset}px`);
                hero.style.setProperty('--leaf-sway', `${leafSway}px`);
            }
            
            rafId = null;
        });
    }, 8);
    
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    
    updateParallax();
    
    return () => {
        window.removeEventListener('scroll', updateParallax);
        window.removeEventListener('resize', updateParallax);
        if (rafId) cancelAnimationFrame(rafId);
    };
}
