document.addEventListener('DOMContentLoaded', () => {
    // Map of alert types to their styling and icons
    const alertTypes = {
        'NOTE': {
            classes: 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-800 dark:text-blue-200',
            title: 'Note',
            icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        },
        'TIP': {
            classes: 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-800 dark:text-green-200',
            title: 'Tip',
            icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-1.44 0l-.548-5.478z" /></svg>'
        },
        'IMPORTANT': {
            classes: 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-800 dark:text-purple-200',
            title: 'Important',
            icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>'
        },
        'WARNING': {
            classes: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 text-yellow-800 dark:text-yellow-200',
            title: 'Warning',
            icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
        },
        'CAUTION': {
            classes: 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-800 dark:text-red-200',
            title: 'Caution',
            icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        }
    };

    // Find all blockquotes within the prose content
    document.querySelectorAll('.prose blockquote').forEach(blockquote => {
        const firstP = blockquote.querySelector('p');
        if (!firstP) return;

        // Check for GFM alert syntax: [!TYPE]
        const match = firstP.textContent.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        
        if (match) {
            const type = match[1].toUpperCase();
            const config = alertTypes[type];
            
            // Add identifying class and base styles
            blockquote.classList.add('gfm-alert', 'not-italic', 'rounded-r-lg', 'border-l-4', 'p-4', 'my-4');
            
            // Add specific color/style classes
            config.classes.split(' ').forEach(cls => blockquote.classList.add(cls));
            
            // Remove the [!TYPE] text from the first paragraph
            // We use innerHTML to preserve other formatting, but need to be careful with the text node
            firstP.innerHTML = firstP.innerHTML.replace(/^\s*\[![a-zA-Z]+\]\s*(\<br\>)?\s*/i, '');

            // Create header with icon and title
            const header = document.createElement('div');
            header.className = 'flex items-center gap-2 font-bold mb-2 select-none';
            header.innerHTML = `${config.icon}<span>${config.title}</span>`;
            
            // Insert header before the first paragraph
            blockquote.insertBefore(header, firstP);
        }
    });
});
