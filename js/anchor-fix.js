document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行以确保页面渲染完成
    setTimeout(function() {
        if (!window.location.hash || window.location.hash.length <= 1) return;

        try {
            var rawHash = window.location.hash.substring(1);
            var decodedHash = decodeURIComponent(rawHash);
            var target = null;

            // 1. 尝试直接 ID 匹配 (原始)
            target = document.getElementById(rawHash);

            // 2. 尝试解码后的 ID 匹配
            if (!target) {
                target = document.getElementById(decodedHash);
            }

            // 3. 尝试不区分大小写的 ID 匹配
            if (!target) {
                var lowerHash = decodedHash.toLowerCase();
                var allElements = document.querySelectorAll('[id]');
                for (var i = 0; i < allElements.length; i++) {
                    if (allElements[i].id.toLowerCase() === lowerHash) {
                        target = allElements[i];
                        break;
                    }
                }
            }

            // 4. Fallback: 尝试匹配标题文本内容 (针对 Zola 可能生成的 ID 与文本不一致的情况)
            if (!target) {
                var headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                var normalize = function(str) {
                    return str.toLowerCase().replace(/\s+/g, '').replace(/[#\-\.]/g, '');
                };
                var normalizedHash = normalize(decodedHash);
                
                for (var i = 0; i < headers.length; i++) {
                    var headerText = normalize(headers[i].innerText);
                    // 检查哈希是否包含在标题文本中，或者完全匹配
                    if (headerText === normalizedHash || headerText.includes(normalizedHash) || normalizedHash.includes(headerText)) {
                        target = headers[i];
                        // 优先给 ID 赋值以便后续可以直接定位 (可选)
                        // if (!target.id) target.id = decodedHash;
                        break;
                    }
                }
            }

            if (target) {
                console.log('Anchor found:', target);
                // 使用 scrollIntoView 平滑滚动
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                console.warn('Anchor not found for hash:', rawHash);
            }

        } catch (e) {
            console.error('Anchor fix error:', e);
        }
    }, 100); // 100ms 延迟
});
