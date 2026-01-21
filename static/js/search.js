let index;
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

async function initSearch() {
    try {
        const response = await fetch('/search_index.zh.json');
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        index = elasticlunr.Index.load(data);
    } catch (e) {
        console.log('Falling back to en index');
        try {
            const response = await fetch('/search_index.en.json');
            const data = await response.json();
            index = elasticlunr.Index.load(data);
        } catch (e) {
            console.error('Error loading search index:', e);
        }
    }
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    if (!index || !term) {
        searchResults.innerHTML = '';
        return;
    }
    
    const results = index.search(term, {
        fields: {
            title: {boost: 2},
            body: {boost: 1}
        },
        expand: true
    });

    searchResults.innerHTML = results.slice(0, 10).map(r => {
        const doc = index.documentStore.getDoc(r.ref);
        return `
            <li class="group cursor-pointer select-none rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <a href="${doc.id}" class="block">
                    <span class="font-medium text-gray-900 dark:text-white">${doc.title}</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">${doc.description || ''}</p>
                </a>
            </li>
        `;
    }).join('');
});

initSearch();
