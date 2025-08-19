import { $ } from './utils';
import { API_CONFIG, apiCall } from './config';

export function initSpotify(): void {
    const spotifySection = $('#spotify');
    if (!spotifySection) return;

    // const playlistUrl = 'https://open.spotify.com/playlist/0pm5pbUgvyQtdJdcAIffNO';
    // const embedUrl = playlistUrl.replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/');
    
    const spotifyContainer = $('.spotify-container');
    if (!spotifyContainer) return;

    // Create the search section first
    const playlistInfo = document.createElement('div');
    playlistInfo.className = 'playlist-info';
    playlistInfo.innerHTML = `
        <div class="song-request-section">

            <div class="song-search-container">
                <div class="search-input-wrapper">
                    <input type="text" id="song-search" class="song-search-input" placeholder="Search for a song or artist...">
                    <button type="button" id="search-btn" class="search-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
                <div id="search-results" class="search-results"></div>
            </div>
            
            <form id="song-request-form" class="song-request-form" style="display: none;">
                <h4 class="selected-song-title">Selected Song</h4>
                <div class="selected-song-info">
                    <input type="text" name="songName" placeholder="Song name" required readonly>
                    <input type="text" name="artistName" placeholder="Artist name" required readonly>
                </div>
                <input type="text" name="yourName" placeholder="Your name (optional)">
                <input type="hidden" name="spotifyUri" value="">
                <div class="button-group">
                    <button type="button" class="cancel-btn">Search Again</button>
                    <button type="submit" class="submit-request-btn">
                        <span class="btn-text">Send Request</span>
                        <span class="btn-loading" style="display: none;">Sending...</span>
                    </button>
                </div>
            </form>
            <div id="request-message" class="request-message"></div>
        </div>
    `;
    
    // Append search section first
    spotifyContainer.appendChild(playlistInfo);
    
    // Playlist embed hidden for now - only allowing additions
    // const iframeWrapper = document.createElement('div');
    // iframeWrapper.className = 'spotify-iframe-wrapper';
    // 
    // const iframe = document.createElement('iframe');
    // iframe.src = `${embedUrl}?utm_source=generator&theme=0`;
    // iframe.width = '100%';
    // iframe.height = '380';
    // iframe.frameBorder = '0';
    // iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    // iframe.loading = 'lazy';
    // 
    // iframeWrapper.appendChild(iframe);
    // spotifyContainer.appendChild(iframeWrapper);
    
    // Handle song search
    const searchInput = document.getElementById('song-search') as HTMLInputElement;
    const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
    const searchResults = document.getElementById('search-results') as HTMLElement;
    const songRequestForm = document.getElementById('song-request-form') as HTMLFormElement;
    const songSearchContainer = spotifyContainer.querySelector('.song-search-container') as HTMLElement;
    
    let searchTimeout: NodeJS.Timeout;
    
    // Search function
    async function searchSongs(query: string) {
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }
        
        try {
            searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
            
            const data = await apiCall(`${API_CONFIG.SPOTIFY_API_URL}/search`, {
                method: 'POST',
                body: JSON.stringify({ query })
            });
            
            if (data.tracks && data.tracks.length > 0) {
                searchResults.innerHTML = data.tracks.map((track: any) => `
                    <div class="search-result-item" data-track='${JSON.stringify(track)}'>
                        <div class="track-info">
                            ${track.image ? `<img src="${track.image}" alt="${track.name}" class="track-image">` : ''}
                            <div class="track-details">
                                <div class="track-name">${track.name}</div>
                                <div class="track-artist">${track.artists}</div>
                                <div class="track-album">${track.album}</div>
                            </div>
                        </div>
                        <button type="button" class="select-track-btn">Select</button>
                    </div>
                `).join('');
                
                // Add click handlers to results
                searchResults.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', function(this: HTMLElement) {
                        const trackData = JSON.parse(this.getAttribute('data-track') || '{}');
                        selectTrack(trackData);
                    });
                });
            } else {
                searchResults.innerHTML = '<div class="no-results">No songs found. Try a different search.</div>';
            }
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="search-error">Search failed. Please try again.</div>';
        }
    }
    
    // Select track function
    function selectTrack(track: any) {
        // Hide search, show form
        songSearchContainer.style.display = 'none';
        songRequestForm.style.display = 'flex';
        
        // Fill in the form
        (songRequestForm.querySelector('[name="songName"]') as HTMLInputElement).value = track.name;
        (songRequestForm.querySelector('[name="artistName"]') as HTMLInputElement).value = track.artists;
        (songRequestForm.querySelector('[name="spotifyUri"]') as HTMLInputElement).value = track.uri;
    }
    
    // Search input handler
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchSongs((e.target as HTMLInputElement).value);
        }, 300);
    });
    
    // Search button handler
    searchBtn.addEventListener('click', () => {
        searchSongs(searchInput.value);
    });
    
    // Enter key handler
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchSongs(searchInput.value);
        }
    });
    
    // Cancel button handler
    const cancelBtn = songRequestForm.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            songRequestForm.style.display = 'none';
            songSearchContainer.style.display = 'block';
            songRequestForm.reset();
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }
    
    // Handle song request form submission
    if (songRequestForm) {
        songRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(songRequestForm);
            const requestData = {
                songName: formData.get('songName') as string,
                artistName: formData.get('artistName') as string,
                yourName: formData.get('yourName') as string || 'Anonymous',
                message: formData.get('message') as string || '',
                spotifyUri: formData.get('spotifyUri') as string || '',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ip: 'client-side'
            };
            
            const submitBtn = songRequestForm.querySelector('.submit-request-btn') as HTMLButtonElement;
            const btnText = submitBtn.querySelector('.btn-text') as HTMLElement;
            const btnLoading = submitBtn.querySelector('.btn-loading') as HTMLElement;
            const messageDiv = document.getElementById('request-message') as HTMLElement;
            
            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;
            
            try {
                // Submit song request to API
                await apiCall(`${API_CONFIG.SPOTIFY_API_URL}/add-song`, {
                    method: 'POST',
                    body: JSON.stringify(requestData)
                });
                
                // Show success message
                messageDiv.innerHTML = `
                    <div class="success-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Song request sent!</span>
                    </div>
                `;
                messageDiv.classList.add('show');
                
                // Reset form
                songRequestForm.reset();
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    messageDiv.classList.remove('show');
                }, 5000);
                
            } catch (error) {
                console.error('Error submitting song request:', error);
                messageDiv.innerHTML = `
                    <div class="error-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Request failed. Try again.</span>
                    </div>
                `;
                messageDiv.classList.add('show');
            } finally {
                // Reset button state
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
    
    observeSpotifySection();
}

function observeSpotifySection(): void {
    const spotifySection = $('#spotify');
    if (!spotifySection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(spotifySection);
}
