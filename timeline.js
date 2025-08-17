// Timeline functionality
document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineLine = document.querySelector('.timeline-line');
    
    // Create progress line
    const progressLine = document.createElement('div');
    progressLine.className = 'timeline-progress';
    timelineLine.appendChild(progressLine);
    
    // Observe timeline items for animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Update progress line on scroll
    function updateProgressLine() {
        const scrolled = window.pageYOffset;
        const timelineSection = document.querySelector('.timeline-section');
        const timelineTop = timelineSection.offsetTop;
        const timelineHeight = timelineSection.offsetHeight;
        
        if (scrolled > timelineTop - window.innerHeight && scrolled < timelineTop + timelineHeight) {
            const progress = (scrolled - (timelineTop - window.innerHeight)) / (timelineHeight + window.innerHeight);
            progressLine.style.height = Math.min(progress * 100, 100) + '%';
        }
    }
    
    window.addEventListener('scroll', updateProgressLine);
    updateProgressLine();
    
    // Check current time and highlight current event
    function highlightCurrentEvent() {
        const now = new Date();
        const weddingDate = new Date('March 22, 2026');
        
        // Only highlight if it's the wedding day
        if (now.toDateString() === weddingDate.toDateString()) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTime = currentHour * 60 + currentMinute;
            
            const eventTimes = [
                { element: 0, time: 15 * 60 + 30 }, // 3:30 PM
                { element: 1, time: 16 * 60 },      // 4:00 PM
                { element: 2, time: 16 * 60 + 30 }, // 4:30 PM
                { element: 3, time: 17 * 60 + 30 }, // 5:30 PM
                { element: 4, time: 19 * 60 },      // 7:00 PM
                { element: 5, time: 20 * 60 }       // 8:00 PM
            ];
            
            // Remove all current classes
            timelineItems.forEach(item => item.classList.remove('current'));
            
            // Find current event
            for (let i = eventTimes.length - 1; i >= 0; i--) {
                if (currentTime >= eventTimes[i].time) {
                    timelineItems[eventTimes[i].element].classList.add('current');
                    break;
                }
            }
        }
    }
    
    // Check every minute
    highlightCurrentEvent();
    setInterval(highlightCurrentEvent, 60000);
    
    // Add hover effects
    timelineItems.forEach(item => {
        const marker = item.querySelector('.timeline-marker');
        const content = item.querySelector('.timeline-content');
        
        content.addEventListener('mouseenter', function() {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 2px solid var(--primary-gold);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: timelineRipple 1s ease-out;
                pointer-events: none;
            `;
            marker.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 1000);
        });
    });
});

// Add CSS for timeline ripple
const timelineStyle = document.createElement('style');
timelineStyle.textContent = `
    @keyframes timelineRipple {
        0% {
            width: 20px;
            height: 20px;
            opacity: 1;
        }
        100% {
            width: 60px;
            height: 60px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(timelineStyle);
