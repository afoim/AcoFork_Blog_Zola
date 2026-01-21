function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function initSearch() {
  var $searchInput = document.getElementById("search-input");
  var $searchResults = document.getElementById("search-results");
  var $searchResultsItems = $searchResults;
  var items = [];

  // Fetch RSS and parse items
  async function fetchRSS() {
    try {
      const response = await fetch('/rss.xml');
      if (!response.ok) return;
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const xmlItems = xml.querySelectorAll('item');
      
      items = Array.from(xmlItems).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        // content:encoded is often in CDATA
        const content = item.getElementsByTagName('content:encoded')[0]?.textContent || description;
        
        // Parse URL path
        let path = link;
        try { path = new URL(link).pathname; } catch(e) {}
        
        // Clean content
        const plainContent = (content || description).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const plainDesc = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

        return {
          title,
          link: path,
          // Searchable: Title + Path + Content
          searchText: (title + ' ' + path + ' ' + plainContent).toLowerCase(),
          rawTitle: title,
          plainContent: plainContent,
          description: plainDesc.slice(0, 100) + (plainDesc.length > 100 ? '...' : '')
        };
      });
      console.log(`Loaded ${items.length} items from RSS`);
    } catch (e) {
      console.error('Failed to load RSS:', e);
    }
  }

  // Simple search function
  function search(term) {
    if (!term) return [];
    const lowerTerm = term.toLowerCase();
    // Filter items where searchText contains the term
    return items.filter(item => item.searchText.includes(lowerTerm));
  }

  // Highlight helper
  function highlight(text, term) {
    if (!term || !text) return text;
    try {
        // Escape regex special characters
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        return text.replace(regex, '<span class="text-blue-600 dark:text-blue-400 font-bold">$1</span>');
    } catch (e) {
        return text;
    }
  }

  // Generate snippet with highlight
  function getSnippet(item, term) {
    const lowerContent = item.plainContent.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const idx = lowerContent.indexOf(lowerTerm);
    
    // If term not found in content (e.g. matched in title or path), return description
    if (idx === -1) {
        // Try to highlight in description if possible, otherwise just return description
        return highlight(item.description, term);
    }

    // Context window
    const start = Math.max(0, idx - 20);
    const end = Math.min(item.plainContent.length, idx + term.length + 60);
    let snippet = item.plainContent.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < item.plainContent.length) snippet = snippet + '...';
    
    return highlight(snippet, term);
  }

  // Render results
  function renderResults(results, term) {
    $searchResultsItems.innerHTML = '';
    if (results.length === 0) return;

    results.slice(0, 10).forEach(item => {
      const li = document.createElement('li');
      li.className = "group cursor-pointer select-none rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0";
      
      const highlightedTitle = highlight(item.rawTitle, term);
      const highlightedSnippet = getSnippet(item, term);
      const highlightedPath = highlight(item.link, term); // Highlight term in path
      
      li.innerHTML = `
        <a href="${item.link}" class="block">
          <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900 dark:text-white">${highlightedTitle}</span>
              <span class="text-xs text-gray-400 dark:text-gray-500 font-mono ml-2">${highlightedPath}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 break-words">${highlightedSnippet}</p>
        </a>
      `;
      $searchResultsItems.appendChild(li);
    });
  }

  // Event listeners
  $searchInput.addEventListener('input', debounce(function(e) {
    const term = e.target.value.trim();
    if (!term) {
      $searchResultsItems.innerHTML = '';
      return;
    }
    const results = search(term);
    renderResults(results, term);
  }, 150));

  // Initialize
  fetchRSS();
}

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  initSearch();
} else {
  document.addEventListener("DOMContentLoaded", initSearch);
}