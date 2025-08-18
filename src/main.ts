import { $$ } from './utils';
import { initCountdown } from './countdown';
import { initNavigation } from './navigation';
import { initParallax } from './parallax';
import { initAnimations } from './animations';
import { initInteractions } from './interactions';
import { initGallery } from './gallery';
import { initWeather } from './weather';
import { initRSVP } from './rsvp';
import { initSpotify } from './spotify';


class WeddingApp {
    private cleanupFunctions: Array<() => void> = [];

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        try {
            await this.domReady();
            
            this.unregisterServiceWorkers();
            this.initSmoothScroll();
            this.initFeatures();
            this.preloadAssets();
            
            this.logPerformance();
        } catch (error) {
            console.error('Failed to initialize wedding app:', error);
        }
    }

    private domReady(): Promise<void> {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => resolve());
            } else {
                resolve();
            }
        });
    }

    private initFeatures(): void {
        const parallaxCleanup = initParallax();
        if (typeof parallaxCleanup === 'function') {
            this.cleanupFunctions.push(parallaxCleanup);
        }
        
        initAnimations();
        initCountdown();
        initNavigation();
        initInteractions();
        initGallery();
        initWeather();
        initRSVP();
        initSpotify();
    }

    private initSmoothScroll(): void {
        const links = $$<HTMLAnchorElement>('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (!targetId) return;
                
                const target = document.querySelector(targetId);
                target?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            });
        });
    }

    private async unregisterServiceWorkers(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log('Service worker unregistered:', registration.scope);
                }
            } catch (error) {
                console.error('Failed to unregister service workers:', error);
            }
        }
    }

    private preloadAssets(): void {
        const criticalImages = [
            'images/elm.png',
            'images/pres.png',
            'images/engadge/IMG_3007.JPG',
            'images/engadge/IMG_5918.jpg',
            'images/engadge/IMG-20240513-WA0042.jpg',
            'images/engadge/IMG-20240513-WA0044.jpg'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    private logPerformance(): void {
        if (!('performance' in window)) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (perfData) {
                    console.log('Page Load Performance:', {
                        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                        totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                    });
                }
            }, 0);
        });
    }

    public destroy(): void {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
    }
}

const app = new WeddingApp();

// HMR handling for development (Vite)
if (import.meta && (import.meta as any).hot) {
    (import.meta as any).hot.dispose(() => {
        app.destroy();
    });
}
