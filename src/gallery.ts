import { $$, createObserver } from './utils';

export function initGallery(): void {
    initGalleryLightbox();
    initGalleryAnimations();
    initImageOptimization();
}

function initGalleryLightbox(): void {
    const galleryItems = $$<HTMLElement>('.gallery-item');
    let currentIndex = 0;
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            openLightbox(index);
        });
    });
    
    function openLightbox(index: number): void {
        const lightbox = createLightboxElement();
        const images = $$<HTMLImageElement>('.gallery-item img');
        const currentImage = images[index];
        
        if (!currentImage) return;
        
        const lightboxImage = lightbox.querySelector('.lightbox-image') as HTMLImageElement;
        const counter = lightbox.querySelector('.lightbox-counter') as HTMLElement;
        
        lightboxImage.src = currentImage.src;
        lightboxImage.alt = currentImage.alt;
        counter.textContent = `${index + 1} / ${images.length}`;
        
        // Set initial edge states for buttons
        const prevBtn = lightbox.querySelector('.lightbox-prev') as HTMLElement;
        const nextBtn = lightbox.querySelector('.lightbox-next') as HTMLElement;
        prevBtn.classList.toggle('at-edge', currentIndex === 0);
        nextBtn.classList.toggle('at-edge', currentIndex === images.length - 1);
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Animate in
        requestAnimationFrame(() => {
            lightbox.classList.add('active');
        });
        
        // Navigation
        setupLightboxNavigation(lightbox, images, prevBtn, nextBtn);
    }
    
    function createLightboxElement(): HTMLElement {
        const lightbox = document.createElement('div');
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close gallery"></button>
                <button class="lightbox-prev" aria-label="Previous image"></button>
                <button class="lightbox-next" aria-label="Next image"></button>
                <img class="lightbox-image" alt="">
                <div class="lightbox-counter"></div>
            </div>
        `;
        return lightbox;
    }
    
    function setupLightboxNavigation(lightbox: HTMLElement, images: NodeListOf<HTMLImageElement>, prevBtn: HTMLElement, nextBtn: HTMLElement): void {
        const closeBtn = lightbox.querySelector('.lightbox-close') as HTMLElement;
        const lightboxImage = lightbox.querySelector('.lightbox-image') as HTMLImageElement;
        const counter = lightbox.querySelector('.lightbox-counter') as HTMLElement;
        
        function updateImage(): void {
            // Add fade transition
            lightboxImage.style.opacity = '0.5';
            setTimeout(() => {
                lightboxImage.src = images[currentIndex].src;
                lightboxImage.alt = images[currentIndex].alt;
                counter.textContent = `${currentIndex + 1} / ${images.length}`;
                lightboxImage.style.opacity = '1';
                
                // Update button states for edge detection
                prevBtn.classList.toggle('at-edge', currentIndex === 0);
                nextBtn.classList.toggle('at-edge', currentIndex === images.length - 1);
            }, 150);
        }
        
        function closeLightbox(): void {
            lightbox.classList.remove('active');
            setTimeout(() => {
                lightbox.remove();
                document.body.style.overflow = '';
            }, 300);
        }
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex === 0) {
                // At first image - show pulse animation
                prevBtn.classList.add('at-edge');
                setTimeout(() => prevBtn.classList.remove('at-edge'), 600);
                return;
            }
            currentIndex = currentIndex - 1;
            updateImage();
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex === images.length - 1) {
                // At last image - show pulse animation
                nextBtn.classList.add('at-edge');
                setTimeout(() => nextBtn.classList.remove('at-edge'), 600);
                return;
            }
            currentIndex = currentIndex + 1;
            updateImage();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function handleKeydown(e) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        });
    }
}

function initGalleryAnimations(): void {
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target as HTMLElement;
                const delay = parseInt(element.dataset.delay || '0');
                
                setTimeout(() => {
                    element.classList.add('visible');
                }, delay);
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.2 });
    
    $$('.gallery-item').forEach(item => observer.observe(item));
}

function initImageOptimization(): void {
    const images = $$<HTMLImageElement>('.gallery-item img');
    
    images.forEach(img => {
        // Progressive loading effect
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        // Error handling
        img.addEventListener('error', function() {
            this.closest('.gallery-item')?.classList.add('error');
        });
    });
}


