import { $, $$, throttle } from './utils';

interface NavigationElements {
    nav: HTMLElement | null;
    toggle: HTMLElement | null;
    menu: HTMLElement | null;
    links: NodeListOf<HTMLAnchorElement>;
    sections: NodeListOf<HTMLElement>;
}

export function initNavigation(): void {
    const elements: NavigationElements = {
        nav: $('.navigation'),
        toggle: $('.nav-toggle'),
        menu: $('.nav-menu'),
        links: $$<HTMLAnchorElement>('.nav-link'),
        sections: $$<HTMLElement>('section[id]')
    };
    
    if (!elements.nav) return;

    let lastScroll = 0;
    let isMenuOpen = false;
    let scrollTimeout: number;

    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide nav when at the very top
        if (scrollTop < 50) {
            elements.nav!.classList.remove('visible');
            elements.nav!.style.transform = 'translateY(0)'; // Reset transform when hidden by opacity
        } else {
            elements.nav!.classList.add('visible');
            
            // Only handle scroll direction hiding when nav is visible
            if (scrollTop > lastScroll && scrollTop > 300) {
                elements.nav!.style.transform = 'translateY(-100%)';
            } else {
                elements.nav!.style.transform = 'translateY(0)';
            }
        }

        lastScroll = scrollTop;
        updateActiveSection(scrollTop);
    }, 50); // Reduced throttle time for better responsiveness

    // Handle scroll end to ensure nav state is correct after fast scrolling
    function handleScrollEnd(): void {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < 50) {
            elements.nav!.classList.remove('visible');
            elements.nav!.style.transform = 'translateY(0)';
        } else {
            elements.nav!.classList.add('visible');
            elements.nav!.style.transform = 'translateY(0)';
        }
    }

    function onScroll(): void {
        handleScroll();
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Set new timeout for scroll end detection
        scrollTimeout = window.setTimeout(handleScrollEnd, 150);
    }

    function updateActiveSection(scrollY: number): void {
        elements.sections.forEach(section => {
            const { offsetTop, offsetHeight } = section;
            const sectionId = section.getAttribute('id');

            if (scrollY > offsetTop - 100 && scrollY <= offsetTop + offsetHeight) {
                elements.links.forEach(link => {
                    link.classList.toggle('active', 
                        link.getAttribute('href') === `#${sectionId}`);
                });
            }
        });
    }

    function toggleMenu(open?: boolean): void {
        isMenuOpen = open ?? !isMenuOpen;
        
        elements.toggle?.classList.toggle('active', isMenuOpen);
        elements.menu?.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        if (isMenuOpen) {
            document.addEventListener('click', handleOutsideClick);
        } else {
            document.removeEventListener('click', handleOutsideClick);
        }
    }

    function handleOutsideClick(e: MouseEvent): void {
        const target = e.target as Node;
        if (!elements.nav?.contains(target)) {
            toggleMenu(false);
        }
    }

    elements.toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    elements.links.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    // Don't call handleScroll on init - let nav start hidden
}


