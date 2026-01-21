// Theme toggle logic
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
} else {
    document.documentElement.classList.remove('dark')
}

// Main functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Fancybox
    if (typeof Fancybox !== 'undefined') {
        Fancybox.bind("[data-fancybox]", {
            // Your custom options
        });
        
        // Auto-wrap images in prose content with Fancybox links if they aren't already
        const articleImages = document.querySelectorAll('.prose img');
        articleImages.forEach(img => {
            if (img.parentElement.tagName !== 'A') {
                const wrapper = document.createElement('a');
                wrapper.href = img.src;
                wrapper.setAttribute('data-fancybox', 'gallery');
                wrapper.setAttribute('data-caption', img.alt || '');
                
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
            }
        });
    }

    // Expose functions to global scope for event handlers
    window.toggleTheme = function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark')
            localStorage.theme = 'light'
            updateGiscusTheme('light')
        } else {
            document.documentElement.classList.add('dark')
            localStorage.theme = 'dark'
            updateGiscusTheme('dark')
        }
    };
    
    window.toggleSearch = function() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.classList.toggle('hidden');
            if (!modal.classList.contains('hidden')) {
                const input = document.getElementById('search-input');
                if (input) input.focus();
            }
        }
    };
    
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    };
});

function updateGiscusTheme(theme) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    
    const message = {
        setConfig: {
            theme: theme === 'dark' ? 'dark' : 'light'
        }
    };
    
    iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app');
}
