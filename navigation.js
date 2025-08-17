// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navigation = document.querySelector('.navigation');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    let lastScrollTop = 0;
    
    // Show/hide navigation on scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            navigation.classList.add('visible');
        } else {
            navigation.classList.remove('visible');
        }
        
        // Hide nav when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > 500) {
            navigation.style.transform = 'translateY(-100%)';
        } else {
            if (navigation.classList.contains('visible')) {
                navigation.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveSection() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveSection);
    highlightActiveSection();
});

// Add countdown timer to navigation
document.addEventListener('DOMContentLoaded', function() {
    const navContainer = document.querySelector('.nav-container');
    const countdown = document.createElement('div');
    countdown.className = 'nav-countdown';
    navContainer.appendChild(countdown);
    
    function updateCountdown() {
        const weddingDate = new Date('March 22, 2026').getTime();
        const now = new Date().getTime();
        const difference = weddingDate - now;
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        countdown.textContent = `${days} days to go`;
        
        if (difference < 0) {
            countdown.textContent = 'Today is the day!';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60); // Update every minute
});
