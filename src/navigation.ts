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

    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const hero = $('.hero');
        const heroHeight = hero?.offsetHeight || 600;

        elements.nav!.classList.toggle('visible', scrollTop > heroHeight - 100);

        if (scrollTop > lastScroll && scrollTop > heroHeight) {
            elements.nav!.style.transform = 'translateY(-100%)';
        } else if (elements.nav!.classList.contains('visible')) {
            elements.nav!.style.transform = 'translateY(0)';
        }

        lastScroll = scrollTop;
        updateActiveSection(scrollTop);
    }, 100);

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}


