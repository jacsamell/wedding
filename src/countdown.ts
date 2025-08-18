

const WEDDING_DATE = new Date('March 21, 2026 16:00:00').getTime();

export function initCountdown(): void {
    const navCountdown = document.querySelector<HTMLElement>('#nav-countdown');
    const daysEl = document.querySelector<HTMLElement>('.countdown-section .time-value[data-unit="days"]');
    const hoursEl = document.querySelector<HTMLElement>('.countdown-section .time-value[data-unit="hours"]');
    const minutesEl = document.querySelector<HTMLElement>('.countdown-section .time-value[data-unit="minutes"]');
    const secondsEl = document.querySelector<HTMLElement>('.countdown-section .time-value[data-unit="seconds"]');

    function pad(value: number): string {
        return value.toString().padStart(2, '0');
    }

    function updateCountdown(): void {
        const now = new Date().getTime();
        const difference = WEDDING_DATE - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            if (navCountdown) {
                if (days === 0) {
                    navCountdown.textContent = 'Today is the Day!';
                    navCountdown.classList.add('wedding-day');
                } else if (days === 1) {
                    navCountdown.textContent = 'Tomorrow!';
                    navCountdown.classList.add('almost-here');
                } else {
                    navCountdown.textContent = `${days} days to go`;
                    navCountdown.classList.remove('wedding-day', 'almost-here');
                }
            }

            if (daysEl) daysEl.textContent = String(days);
            if (hoursEl) hoursEl.textContent = pad(hours);
            if (minutesEl) minutesEl.textContent = pad(minutes);
            if (secondsEl) secondsEl.textContent = pad(seconds);
        } else {
            if (navCountdown) {
                navCountdown.textContent = 'Just Married!';
                navCountdown.classList.add('married');
            }

            if (daysEl) daysEl.textContent = '0';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
        }
    }



    setTimeout(() => {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }, 100);
}
