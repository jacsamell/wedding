// Performance Optimizations

// Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageOptions = {
        threshold: 0,
        rootMargin: '0px 0px 50px 0px'
    };
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, imageOptions);
    
    images.forEach(img => imageObserver.observe(img));
});

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        'images/elm.png',
        'styles.css',
        'premium-effects.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        
        if (resource.endsWith('.css')) {
            link.as = 'style';
        } else if (resource.match(/\.(jpg|jpeg|png|webp)$/)) {
            link.as = 'image';
        }
        
        document.head.appendChild(link);
    });
}

// Optimize animations on low-end devices
function optimizeForPerformance() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        document.body.classList.add('reduce-motion');
        
        // Disable complex animations
        const style = document.createElement('style');
        style.textContent = `
            .reduce-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Detect low-end devices
    const isLowEnd = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
    
    if (isLowEnd) {
        document.body.classList.add('low-end-device');
        
        // Simplify effects for better performance
        const style = document.createElement('style');
        style.textContent = `
            .low-end-device .parallax-layer {
                transform: none !important;
            }
            .low-end-device .morph-bg,
            .low-end-device .floating-leaves {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }
}

// Defer non-critical CSS
function deferNonCriticalCSS() {
    const nonCriticalStyles = [
        'timeline.css',
        'countdown.css'
    ];
    
    nonCriticalStyles.forEach(stylesheet => {
        const link = document.querySelector(`link[href="${stylesheet}"]`);
        if (link) {
            link.media = 'print';
            link.onload = function() { this.media = 'all'; };
        }
    });
}

// Progressive Web App - Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed'));
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    preloadCriticalResources();
    optimizeForPerformance();
    deferNonCriticalCSS();
});

// Monitor performance
window.addEventListener('load', function() {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${pageLoadTime}ms`);
        
        // Send to analytics if needed
        if (pageLoadTime > 3000) {
            console.warn('Page load time is above 3 seconds. Consider optimization.');
        }
    }
});
