// Countdown Timer Functionality
document.addEventListener('DOMContentLoaded', function() {
    const weddingDate = new Date('March 22, 2026 16:00:00').getTime();
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    let previousValues = {
        days: null,
        hours: null,
        minutes: null,
        seconds: null
    };
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            // Update with flip animation
            updateValue(daysElement, days, previousValues.days, 'days');
            updateValue(hoursElement, hours, previousValues.hours, 'hours');
            updateValue(minutesElement, minutes, previousValues.minutes, 'minutes');
            updateValue(secondsElement, seconds, previousValues.seconds, 'seconds');
            
            previousValues = { days, hours, minutes, seconds };
        } else {
            // Wedding day!
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            
            // Show special message
            const countdownTitle = document.querySelector('.countdown-title');
            if (countdownTitle) {
                countdownTitle.textContent = 'Today is the Day!';
                countdownTitle.style.animation = 'pulse 2s ease-in-out infinite';
            }
        }
    }
    
    function updateValue(element, newValue, oldValue, type) {
        if (newValue !== oldValue) {
            element.classList.add('flip');
            setTimeout(() => {
                element.textContent = padZero(newValue, type);
                element.classList.remove('flip');
                
                // Set data attribute for styling
                const digits = newValue.toString().length;
                element.setAttribute('data-digits', digits);
            }, 300);
        }
    }
    
    function padZero(value, type) {
        if (type === 'days') {
            return value.toString().padStart(3, '0');
        }
        return value.toString().padStart(2, '0');
    }
    
    // Initial update
    updateCountdown();
    
    // Update every second
    setInterval(updateCountdown, 1000);
    
    // Add sparkle effects on hover
    const countdownItems = document.querySelectorAll('.countdown-item');
    countdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            createSparkle(this);
        });
    });
    
    function createSparkle(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        element.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
});

// Add CSS for sparkles
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    .sparkle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--primary-gold);
        border-radius: 50%;
        pointer-events: none;
        animation: sparkleAnim 1s ease-out forwards;
    }
    
    @keyframes sparkleAnim {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(2) rotate(180deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);
