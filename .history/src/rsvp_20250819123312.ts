import { API_CONFIG, apiCall } from './config';

interface GuestData {
    id: number;
    name: string;
    dietary: string;
    attending: boolean;
    saved?: boolean;
}

export function initRSVP(): void {
    const guestList = document.querySelector<HTMLElement>('#guest-list');
    const addGuestBtn = document.querySelector<HTMLButtonElement>('#add-guest');
    
    if (!guestList || !addGuestBtn) return;

    const guestContainer = guestList as HTMLElement;
    let nextId = 1;
    const guests = new Map<number, GuestData>();

    function createGuestCard(data?: Partial<GuestData>): HTMLElement {
        const id = data?.id || nextId++;
        const name = data?.name ?? '';
        const dietary = data?.dietary ?? '';
        const attending = data?.attending ?? false;
        const saved = data?.saved ?? false;

        // Add guest data to map first
        guests.set(id, { id, name, dietary, attending, saved });

        const card = document.createElement('div');
        card.className = 'guest-card new-entry';
        card.dataset.id = String(id);
        
        // Remove the new-entry class after animation completes
        setTimeout(() => card.classList.remove('new-entry'), 300);

        const cardHTML = `
            <div class="guest-row ${!attending ? 'not-attending' : ''}">
                <div class="guest-info">
                    <div class="guest-number">Guest ${guests.size}</div>
                    <div class="guest-fields">
                        <input id="guest-name-${id}" type="text" name="guest[${id}][name]" 
                               placeholder="Full name" value="${escapeHtml(name)}" required />
                        <input id="guest-dietary-${id}" type="text" name="guest[${id}][dietary]" 
                               placeholder="Dietary requirements (optional)" value="${escapeHtml(dietary)}" />
                    </div>
                </div>
                <div class="guest-actions">
                    <div class="guest-attendance">
                        <span class="attendance-label">Attending?</span>
                        <input type="checkbox" id="attending-${id}" class="attendance-toggle" ${attending ? 'checked' : ''}>
                        <label for="attending-${id}" class="attendance-switch">
                            <span class="switch-track">
                                <span class="switch-handle"></span>
                                <span class="switch-icons">
                                    <span class="icon-yes">✓</span>
                                    <span class="icon-no">✕</span>
                                </span>
                            </span>
                            <span class="attendance-text">
                                <span class="text-yes">Yes</span>
                                <span class="text-no">No</span>
                            </span>
                        </label>
                    </div>
                    <button type="button" class="guest-save ${saved ? 'saved' : ''}" aria-label="Save guest">
                        <span class="save-text">Save</span>
                        <span class="save-icon">✓</span>
                    </button>
                </div>
            </div>
        `;
        
        card.innerHTML = cardHTML;

        // Get all interactive elements
        const saveBtn = card.querySelector<HTMLButtonElement>('.guest-save');
        const nameInput = card.querySelector<HTMLInputElement>(`#guest-name-${id}`);
        const dietaryInput = card.querySelector<HTMLInputElement>(`#guest-dietary-${id}`);
        const attendanceToggle = card.querySelector<HTMLInputElement>(`#attending-${id}`);
        const guestRow = card.querySelector<HTMLElement>('.guest-row');

        saveBtn?.addEventListener('click', async () => {
            if (!nameInput?.value.trim()) {
                nameInput?.classList.add('shake');
                nameInput?.focus();
                setTimeout(() => nameInput?.classList.remove('shake'), 600);
                return;
            }

            // Update guest data
            const guestData = guests.get(id);
            if (guestData) {
                guestData.name = nameInput.value.trim();
                guestData.dietary = dietaryInput?.value.trim() || '';
                guestData.attending = attendanceToggle?.checked ?? true;
                guestData.saved = true;
            }

            // Trigger save animation
            saveBtn.classList.add('saving');
            
            // Simulate API save delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            saveBtn.classList.remove('saving');
            saveBtn.classList.add('saved');
            
            // Success ripple effect
            createSuccessRipple(saveBtn);
            
            // Success feedback on the card
            card.classList.add('saved-success');
            setTimeout(() => card.classList.remove('saved-success'), 2000);
        });

        // Attendance toggle handler
        attendanceToggle?.addEventListener('change', () => {
            const isAttending = attendanceToggle.checked;
            const guestData = guests.get(id);
            if (guestData) {
                guestData.attending = isAttending;
                guestData.saved = false;
                saveBtn?.classList.remove('saved');
            }
            
            if (isAttending) {
                guestRow?.classList.remove('not-attending');
                // Trigger celebration animation only if not a new entry
                if (!card.classList.contains('new-entry')) {
                    card.classList.add('celebrating');
                    createFireworks(card);
                    setTimeout(() => card.classList.remove('celebrating'), 3000);
                }
            } else {
                guestRow?.classList.add('not-attending');
                // Trigger sad animation only if not a new entry
                if (!card.classList.contains('new-entry')) {
                    card.classList.add('declining');
                    setTimeout(() => card.classList.remove('declining'), 800);
                }
            }
        });

        // Input change listeners to reset save state
        [nameInput, dietaryInput].forEach(input => {
            input?.addEventListener('input', () => {
                const guestData = guests.get(id);
                if (guestData?.saved) {
                    guestData.saved = false;
                    saveBtn?.classList.remove('saved');
                    card.classList.remove('saved-success');
                }
            });
        });



        return card;
    }

    function createSuccessRipple(button: HTMLElement): void {
        const ripple = document.createElement('span');
        ripple.className = 'success-ripple';
        const rect = button.getBoundingClientRect();
        ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) * 2 + 'px';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    }

    function createFireworks(card: HTMLElement): void {
        const fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks-container';
        card.appendChild(fireworksContainer);

        // Create multiple waves of fireworks over 3 seconds
        const waves = [
            { count: 3, delay: 0 },      // First wave immediately
            { count: 4, delay: 600 },    // Second wave at 0.6s
            { count: 5, delay: 1200 },   // Third wave at 1.2s
            { count: 4, delay: 1800 },   // Fourth wave at 1.8s
            { count: 3, delay: 2400 }    // Final wave at 2.4s
        ];

        waves.forEach(wave => {
            for (let i = 0; i < wave.count; i++) {
                setTimeout(() => {
                    const burst = document.createElement('div');
                    burst.className = 'firework-burst';
                    
                    // Random position within the card with better distribution
                    const x = 10 + Math.random() * 80; // 10% to 90% horizontally
                    const y = 20 + Math.random() * 60; // 20% to 80% vertically
                    burst.style.left = `${x}%`;
                    burst.style.top = `${y}%`;
                    
                    // Vary particle count for visual interest
                    const particleCount = 8 + Math.floor(Math.random() * 8); // 8-15 particles
                    
                    // Create particles for this burst
                    for (let j = 0; j < particleCount; j++) {
                        const particle = document.createElement('span');
                        particle.className = 'firework-particle';
                        const angle = (j / particleCount) * 360;
                        particle.style.setProperty('--angle', `${angle}deg`);
                        particle.style.setProperty('--delay', `${Math.random() * 0.3}s`);
                        particle.style.setProperty('--distance', `${60 + Math.random() * 40}px`); // Vary explosion size
                        burst.appendChild(particle);
                    }
                    
                    fireworksContainer.appendChild(burst);
                    
                    // Remove burst after animation
                    setTimeout(() => burst.remove(), 1800);
                }, wave.delay + (i * 150)); // Stagger within each wave
            }
        });

        // Remove container after all animations complete (3 seconds max)
        setTimeout(() => fireworksContainer.remove(), 3000);
    }



    function addGuest(data?: Partial<GuestData>): void {
        const card = createGuestCard(data);
        guestContainer.appendChild(card);
        
        // Focus on name input (without scroll for initial load)
        if (guests.size > 1) {
            requestAnimationFrame(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const nameInput = card.querySelector<HTMLInputElement>('input[type="text"]');
                nameInput?.focus();
            });
        }
    }

    // Initialize event listeners
    addGuestBtn.addEventListener('click', () => {
        // Add animation class to the actions container
        const actionsContainer = addGuestBtn.parentElement;
        if (actionsContainer) {
            actionsContainer.classList.add('adding');
            setTimeout(() => actionsContainer.classList.remove('adding'), 400);
        }
        addGuest();
    });

    // Initialize with one default guest (not attending)
    const existing = guestContainer.querySelectorAll('.guest-card').length;
    if (existing === 0) {
        addGuest();
    }
}

function escapeHtml(value: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return value.replace(/[&<>"']/g, (m) => map[m]);
}