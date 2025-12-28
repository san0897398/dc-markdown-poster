// Mermaid Handler for DC Markdown Poster
// Uses mermaid.ink for rendering + Catbox.moe fallback for URL rehosting

(function () {
    'use strict';

    const CONFIG = {
        mermaidInk: 'https://mermaid.ink/img/pako:',
        mermaidInkBase64: 'https://mermaid.ink/img/',
        maxUrlLength: 2000,  // URL length threshold for Catbox rehosting
        theme: 'default',
        timeoutMs: 15000     // 15 seconds timeout for uploads
    };

    // Cache for uploaded images (mermaid code hash -> catbox URL)
    const uploadCache = new Map();

    /**
     * Simple hash function for caching
     * @param {string} str - Input string to hash
     * @returns {string} - Hash string (base36)
     */
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Encode mermaid code to mermaid.ink URL format
     * Format: {"code": code, "mermaid": {"theme": "default"}}
     * Compressed with Pako deflate + Base64 URL-safe encoding
     *
     * @param {string} code - Mermaid diagram code
     * @param {Object} options - Encoding options
     * @param {string} options.theme - Mermaid theme (default: "default")
     * @returns {string} - Encoded string for mermaid.ink URL
     */
    function encodeMermaid(code, options = {}) {
        const theme = options.theme || CONFIG.theme;

        // Create JSON payload as per mermaid.ink spec
        const payload = JSON.stringify({
            code: code,
            mermaid: { theme: theme }
        });

        console.log('[Mermaid] pako available:', typeof pako !== 'undefined');

        if (typeof pako === 'undefined' || !pako.deflate) {
            console.warn('[Mermaid] pako library not loaded, falling back to simple Base64');
            // Fallback: Simple Base64 encoding (supported by mermaid.ink/img/<base64>)
            // Note: This might produce longer URLs and hit limits faster.
            return btoa(unescape(encodeURIComponent(payload)));
        }

        try {
            // Compress with Pako deflate
            const encoder = new TextEncoder();
            const data = encoder.encode(payload);
            const compressed = pako.deflate(data, { level: 9 });

            // Convert to binary string
            let binary = '';
            for (let i = 0; i < compressed.length; i++) {
                binary += String.fromCharCode(compressed[i]);
            }

            // Base64 URL-safe encoding
            return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
        } catch (e) {
            console.error('[Mermaid] Compression failed:', e);
            // Fallback on error
            return btoa(unescape(encodeURIComponent(payload)));
        }
    }

    /**
     * Check if string contains Korean characters
     * @param {string} str - Input string
     * @returns {boolean}
     */
    function hasKorean(str) {
        return /[가-힣]/.test(str);
    }

    /**
     * Preprocess mermaid code to handle Korean text properly
     * Mermaid parser has issues with unquoted Korean in certain positions
     * @param {string} code - Raw mermaid code
     * @returns {string} - Preprocessed code with Korean text quoted
     */
    function preprocessKorean(code) {
        let result = code;

        // 1. Edge labels: -->|text| -> -->|"text"|
        result = result.replace(/-->\|([^|]+)\|/g, (match, label) => {
            if (hasKorean(label) && !label.startsWith('"')) {
                return `-->|"${label.trim()}"|`;
            }
            return match;
        });

        // 2. Also handle other arrow types with labels
        result = result.replace(/-[-.>]+\|([^|]+)\|/g, (match, label) => {
            if (hasKorean(label) && !label.startsWith('"')) {
                const arrow = match.substring(0, match.indexOf('|'));
                return `${arrow}|"${label.trim()}"|`;
            }
            return match;
        });

        // 3. par/subgraph labels: par text -> par "text"
        result = result.replace(/^(\s*)(par|subgraph)\s+([^"\n][^\n]*?)$/gm, (match, indent, keyword, label) => {
            if (hasKorean(label) && !label.startsWith('"')) {
                return `${indent}${keyword} "${label.trim()}"`;
            }
            return match;
        });

        // 4. Node labels with brackets: [text] -> ["text"]
        result = result.replace(/\[([^\]"]+)\]/g, (match, content) => {
            if (hasKorean(content)) {
                return `["${content}"]`;
            }
            return match;
        });

        // 5. Diamond nodes: {text} -> {"text"}
        result = result.replace(/\{([^}"]+)\}/g, (match, content) => {
            if (hasKorean(content)) {
                return `{"${content}"}`;
            }
            return match;
        });

        // 6. Sequence diagram messages: A->>B: text -> A->>B: "text"
        result = result.replace(/(->>|-->>|->|-->|--\)|--x)\s*([^:\n]+):\s*([^\n]+)$/gm, (match, arrow, target, message) => {
            if (hasKorean(message) && !message.trim().startsWith('"')) {
                return `${arrow}${target}: "${message.trim()}"`;
            }
            return match;
        });

        return result;
    }

    /**
     * Optimize mermaid code for compression
     * @param {string} code - Raw mermaid code
     * @returns {string} - Optimized code
     */
    function optimizeCode(code) {
        let result = code.trim();

        // Preprocess Korean text (add quotes where needed)
        result = preprocessKorean(result);

        // Remove leading whitespace and collapse newlines
        result = result
            .replace(/^[ \t]+/gm, '')  // Remove leading whitespace
            .replace(/\n{2,}/g, '\n'); // Collapse multiple newlines

        return result;
    }

    /**
     * Get mermaid.ink URL for a diagram
     * @param {string} code - Mermaid diagram code
     * @param {Object} options - Options
     * @param {string} options.theme - Mermaid theme
     * @param {string} options.type - Image type (png, svg)
     * @returns {string} - mermaid.ink URL
     */
    function getMermaidInkUrl(code, options = {}) {
        const optimizedCode = optimizeCode(code);
        const encoded = encodeMermaid(optimizedCode, options);
        const type = options.type || 'png';

        // Use standard pako URL if pako was used (checked by presence of '-' or '_')
        // Or if simple base64, use /img/ endpoint
        if (typeof pako !== 'undefined' && pako.deflate) {
            return `${CONFIG.mermaidInk}${encoded}?type=${type}`;
        } else {
            return `${CONFIG.mermaidInkBase64}${encoded}?type=${type}`;
        }
    }

    /**
     * Helper to wrap sendMessage in a timeout
     */
    function sendMessageWithTimeout(message, timeoutMs = CONFIG.timeoutMs) {
        return new Promise((resolve, reject) => {
            if (!chrome?.runtime?.sendMessage) {
                reject(new Error('chrome.runtime.sendMessage not available'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error(`Request timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            chrome.runtime.sendMessage(message, (response) => {
                clearTimeout(timeoutId);

                if (chrome.runtime.lastError) {
                    // Check for specific service worker errors
                    if (chrome.runtime.lastError.message.includes('receiving end does not exist')) {
                        reject(new Error('Background service worker is not active.'));
                    } else {
                        reject(new Error(chrome.runtime.lastError.message));
                    }
                    return;
                }

                if (response && response.success) {
                    resolve(response.url);
                } else {
                    reject(new Error(response?.error || 'Unknown error from background'));
                }
            });
        });
    }

    /**
     * Rehost an image URL to Catbox.moe
     * Uses background service worker for cross-origin request
     *
     * @param {string} imageUrl - The URL of the image to rehost
     * @returns {Promise<string>} - Catbox.moe URL (https://files.catbox.moe/xxx.png)
     */
    async function rehostToCatbox(imageUrl) {
        console.log('[Mermaid] Rehosting to Catbox...');
        return sendMessageWithTimeout({ type: 'REHOST_TO_CATBOX', imageUrl });
    }

    /**
     * Send message to background script for cross-origin fetch + upload
     * @param {string} mermaidUrl - mermaid.ink URL
     * @returns {Promise<string>} - Uploaded image URL
     */
    function sendToBackground(mermaidUrl) {
        console.log('[Mermaid] Sending to background...');
        return sendMessageWithTimeout({ type: 'FETCH_AND_UPLOAD', mermaidUrl });
    }

    /**
     * Fetch and upload via background script
     * @param {string} code - Mermaid diagram code
     * @returns {Promise<string>} - Catbox.moe image URL
     */
    async function fetchAndUpload(code) {
        const cacheKey = hashCode(code);

        // Check cache first
        if (uploadCache.has(cacheKey)) {
            console.log(`[Mermaid] Cache hit: ${cacheKey}`);
            return uploadCache.get(cacheKey);
        }

        const mermaidUrl = getMermaidInkUrl(code);
        console.log(`[Mermaid] URL length: ${mermaidUrl.length}`);

        // Send to background for fetch + upload
        const imageUrl = await sendToBackground(mermaidUrl);
        console.log(`[Mermaid] Image URL: ${imageUrl}`);

        // Cache the result
        uploadCache.set(cacheKey, imageUrl);

        return imageUrl;
    }

    /**
     * Render Mermaid code to HTML img tag
     *
     * Strategy:
     * 1. Generate mermaid.ink URL
     * 2. If URL length > 2000 or forceRehost option, use Catbox rehosting
     * 3. Otherwise, fetch and upload directly via background script
     *
     * @param {string} code - Mermaid diagram code
     * @param {Object} options - Render options
     * @param {boolean} options.forceRehost - Force Catbox rehosting even for short URLs
     * @param {string} options.theme - Mermaid theme
     * @returns {Promise<string>} - HTML img tag
     */
    async function renderMermaid(code, options = {}) {
        const theme = options.theme || CONFIG.theme;
        // Use global style injector if available, but default to minimal strings if not
        const STYLES = window.DCMDStyleInjector?.getStyles ? window.DCMDStyleInjector.getStyles(theme) : {};

        const trimmedCode = code.trim();
        const altPreview = trimmedCode.substring(0, 100).replace(/\n/g, ' ').replace(/"/g, "'");

        try {
            let imageUrl;
            // FORCE STRATEGY: Always fetch and upload to Catbox.
            console.log('[Mermaid] Force-uploading to Catbox for stability...');

            try {
                imageUrl = await fetchAndUpload(trimmedCode);
            } catch (uploadError) {
                console.error('[Mermaid] Upload failed:', uploadError);
                throw uploadError; // Propagate to fallback
            }

            // MOBILE-SAFE OUTPUT: Minimal IMG tag
            // We strip the outer div complexity to prevent mobile apps from converting it to text/ASCII
            return `<img src="${imageUrl}" 
                         alt="Mermaid Diagram" 
                         style="width: 100%; max-width: 100%; display: block; border-radius: 4px; margin: 12px 0;">`;

        } catch (error) {
            console.error('[Mermaid] Render failed:', error);

            // FAILSAVE FALLBACK: use mermaid.ink URL directly
            try {
                const mermaidUrl = getMermaidInkUrl(trimmedCode, options);
                console.warn(`[Mermaid] Falling back to direct URL: ${mermaidUrl.length} chars`);

                // Fallback also uses minimal tag
                return `<img src="${mermaidUrl}" 
                             alt="Mermaid Diagram (Fallback)" 
                             style="width: 100%; max-width: 100%; display: block; margin: 12px 0;"
                             onerror="this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<br><span style=\\'color:red\\'>Mermaid Render Failed</span>')">`;
            } catch (fallbackError) {
                const errorBoxStyle = STYLES.errorBox || "color:red; border:1px solid red; padding:10px;";
                return `<div style="${errorBoxStyle}"><strong>[Antigravity Error]</strong><br/>${error.message}</div>`;
            }
        }
    }

    /**
     * Get catbox image URL only (without img tag)
     * @param {string} code - Mermaid diagram code
     * @returns {Promise<string>} - Catbox.moe URL
     */
    async function getImageUrl(code) {
        return await fetchAndUpload(code.trim());
    }

    /**
     * Synchronous version - returns mermaid.ink URL (for compatibility)
     * @param {string} code - Mermaid diagram code
     * @param {Object} options - Options
     * @returns {string} - mermaid.ink URL
     */
    function getDirectUrl(code, options = {}) {
        return getMermaidInkUrl(code.trim(), options);
    }

    /**
     * Get Mermaid Diagram as Blob (using Background Fetch)
     * @param {string} code - Mermaid diagram code
     * @param {Object} options - Options
     * @returns {Promise<Blob>} - Blob object of the diagram image
     */
    async function getDiagramBlob(code, options = {}) {
        const theme = options.theme || CONFIG.theme;
        // Adjust theme for Mermaid.ink (it supports 'dark', 'default', 'forest', 'neutral')
        // We map 'antigravity' -> 'dark', 'light' -> 'default'
        const mermaidTheme = theme === 'light' ? 'default' : 'dark';

        // Generate Ink URL
        const mermaidUrl = getMermaidInkUrl(code, { theme: mermaidTheme, ...options });

        console.log('[Mermaid] Fetching Blob from:', mermaidUrl);

        // Fetch via Background
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'FETCH_BLOB_BASE64',
                url: mermaidUrl
            }, (response) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                if (response && response.success) {
                    // Convert Base64 to Blob
                    if (window.DCMDInjector && window.DCMDInjector.dataURLtoBlob) {
                        resolve(window.DCMDInjector.dataURLtoBlob(response.base64));
                    } else {
                        // Fallback if DCMDInjector not loaded yet?
                        reject(new Error("DCMDInjector not found for blob conversion"));
                    }
                } else {
                    reject(new Error(response.error || 'Unknown background error'));
                }
            });
        });
    }

    // Export API
    window.DCMDMermaid = {
        // Main API
        renderMermaid,        // async - full render with Catbox fallback
        renderToUrl: renderMermaid, // alias for compatibility
        getDiagramBlob,       // async - returns Blob of the diagram

        // URL generation
        encodeMermaid,        // sync - encode mermaid code for URL
        getMermaidInkUrl,     // sync - get mermaid.ink URL
        getDirectUrl,         // sync - alias for getMermaidInkUrl

        // Upload functions
        getImageUrl,          // async - returns Catbox URL
        rehostToCatbox,       // async - rehost URL to Catbox

        // Legacy aliases
        render: renderMermaid,
        renderToImage: renderMermaid,

        // Configuration
        config: CONFIG,

        // Utilities
        optimizeCode,
        preprocessKorean,
        hashCode
    };

    // Test helper - can be called from console
    window.testMermaid = async function (code) {
        const testCode = code || `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`;

        console.log('=== Mermaid Test ===');
        console.log('Input code:', testCode);

        const url = window.DCMDMermaid.getDirectUrl(testCode);
        console.log('mermaid.ink URL:', url);
        console.log('URL length:', url.length);

        try {
            const catboxUrl = await window.DCMDMermaid.getImageUrl(testCode);
            console.log('Catbox URL:', catboxUrl);
            return catboxUrl;
        } catch (e) {
            console.error('Upload failed:', e);
            return url;
        }
    };
})();
