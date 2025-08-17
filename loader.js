// Premium loading animation
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="elm-tree-loader">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="treeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" style="stop-color:#b8935f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e4d5b7;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path class="tree-trunk" d="M100 150 L100 180 M95 150 L95 180 M105 150 L105 180" 
                          stroke="url(#treeGradient)" stroke-width="3" fill="none"/>
                    <circle class="tree-crown" cx="100" cy="100" r="50" 
                            fill="none" stroke="url(#treeGradient)" stroke-width="2" opacity="0"/>
                </svg>
            </div>
            <div class="loader-text">
                <span class="letter">J</span>
                <span class="letter">A</span>
                <span class="letter">C</span>
                <span class="letter">O</span>
                <span class="letter">B</span>
                <span class="letter heart">♥</span>
                <span class="letter">S</span>
                <span class="letter">A</span>
                <span class="letter">R</span>
                <span class="letter">A</span>
                <span class="letter">H</span>
            </div>
        </div>
    `;
    document.body.appendChild(loader);

    // Animate loader
    setTimeout(() => {
        loader.classList.add('loading');
    }, 100);

    // Remove loader after animation
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.classList.add('loaded');
            setTimeout(() => {
                loader.remove();
                document.body.classList.add('page-loaded');
            }, 800);
        }, 1500);
    });
});
