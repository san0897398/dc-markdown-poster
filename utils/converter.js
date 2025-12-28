// DC Markdown Converter
// Converts Markdown to HTML with Placeholders for diagrams (Smart Paste Strategy)

(function () {
    'use strict';

    // Access global Antigravity Styles (loaded by style-injector.js)
    const STYLES = window.DCMDStyleInjector?.STYLES || {};

    // Escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Convert Markdown to HTML with Placeholders for diagrams
     * @param {string} markdown 
     * @param {string} theme 
     * @returns {Promise<{html: string, diagrams: Array<{id: string, code: string}>}>}
     */
    async function convert(markdown, theme = 'antigravity') {
        const rawStyles = window.DCMDStyleInjector?.getStyles ? window.DCMDStyleInjector.getStyles(theme) : {};

        // DEFAULTS (Fallback if Injection Fails)
        const DEFAULTS = {
            pre: 'background: #272727; color: #D4D4D4; padding: 15px; overflow-x: auto; border-radius: 4px;',
            code: 'background: #333; color: #ea8E8E; padding: 2px 4px; border-radius: 3px;',
            tableWrapper: 'overflow-x: auto; margin: 16px 0; border: none; border-radius: 3px;',
            table: 'border-collapse: collapse; width: auto; max-width: 100%; font-size: 14px; border: 1px solid #333; margin: 0;',
            th: 'background-color: #252525; font-weight: 600; text-align: left; padding: 7px 9px; border: 1px solid #333; color: #D4D4D4;',
            td: 'padding: 7px 9px; border: 1px solid #333; color: #D4D4D4;',
            trEven: 'background-color: transparent;'
        };

        // Sanitize Styles & Merge Defaults
        const STYLES = { ...DEFAULTS };
        for (const key in rawStyles) {
            if (typeof rawStyles[key] === 'string') {
                STYLES[key] = rawStyles[key].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/"/g, "'").trim();
            }
        }

        // 0. Extract ASCII Blocks (Storage for Auto-Detection)
        const asciiBlocks = [];
        const asciiPlaceholder = "%%ASCII_%%";
        // Note: Explicit ```ascii and auto-detected blocks are handled in Step 2.

        // 1. Extract Mermaid Blocks
        const mermaidBlocks = [];
        const mermaidPlaceholder = "%%MERMAID_%%";
        let processedMarkdown = markdown.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (match, code) => {
            const index = mermaidBlocks.length;
            mermaidBlocks.push(code.trim());
            return `${mermaidPlaceholder}${index}%%`;
        });

        // 2. Extract Code Blocks (Auto-Detect ASCII)
        const codeBlocks = [];
        processedMarkdown = processedMarkdown.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (match, lang, code) => {
            const cleanCode = code.replace(/\r/g, ''); // Normalize line endings
            const lowerLang = lang.toLowerCase();

            // Heuristic: Auto-detect ASCII Art if no language or 'text'/'txt'
            // Criteria: 
            // 1. Multiline
            // 2. Box-drawing characters OR Classic ASCII patterns (+--+, |  |, -->)
            if (!lowerLang || lowerLang === 'text' || lowerLang === 'txt' || lowerLang === 'ascii') {
                const isMultiline = cleanCode.includes('\n');
                const hasBoxDrawing = /[\u2500-\u257F]/.test(cleanCode); // ┌ └ ┐ ┘ ─ │ ...
                const hasClassicBox = /(\+[-=]{2,}\+)|(\|[\s\w]+\|)/.test(cleanCode); // +---+ or | Text |
                const hasArrows = /[-=]{2,}>|<[-=]{2,}/.test(cleanCode); // --> or <--
                // Exclude common code block patterns if necessary, but these are strong signals.

                if (isMultiline && (hasBoxDrawing || hasClassicBox || hasArrows || lowerLang === 'ascii')) {
                    // Divert to ASCII Block processing
                    const index = asciiBlocks.length;
                    asciiBlocks.push(cleanCode.trimEnd());
                    return `${asciiPlaceholder}${index}%%`;
                }
            }

            // Standard Code Block
            const index = codeBlocks.length;
            codeBlocks.push({ lang, code: cleanCode });
            return `%%CODEBLOCK_${index}%%`;
        });

        // 3. Extract Inline Code
        const inlineCodes = [];
        processedMarkdown = processedMarkdown.replace(/`([^`]+)`/g, (match, code) => {
            const index = inlineCodes.length;
            inlineCodes.push(code);
            return `%%INLINECODE_${index}%%`;
        });

        // 4. Manual Markdown Parsing (Headers, Styles, etc)
        let html = processedMarkdown;

        // Helper to generate IDs
        function slugify(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\uAC00-\uD7A3\-]+/g, '') // Remove all non-word chars (preserving Korean)
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
        }

        // Headers
        html = html.replace(/^#### (.+)$/gm, (m, t) => `<h4 id="${slugify(t)}" style="${STYLES.p}">${t}</h4>`);
        html = html.replace(/^### (.+)$/gm, (m, t) => `<h3 id="${slugify(t)}" style="${STYLES.h3}">${t}</h3>`);
        html = html.replace(/^## (.+)$/gm, (m, t) => `<h2 id="${slugify(t)}" style="${STYLES.h2}">${t}</h2>`);
        html = html.replace(/^# (.+)$/gm, (m, t) => `<h1 id="${slugify(t)}" style="${STYLES.h1}">${t}</h1>`);

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, `<strong style="${STYLES.strong}"><em style="${STYLES.em}">$1</em></strong>`);
        html = html.replace(/\*\*(.+?)\*\*/g, `<strong style="${STYLES.strong}">$1</strong>`);
        html = html.replace(/\*(.+?)\*/g, `<em style="${STYLES.em}">$1</em>`);
        html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

        // Links and images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<div style="${STYLES.imgContainer}"><img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; vertical-align: middle;"></div>`);
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            // Fix: Strip external base URL if it's an anchor link (e.g. from Claude copy-paste)
            // Regex checks for http(s)://...#slug
            const anchorMatch = url.match(/^https?:\/\/[^#]*(#.+)$/);
            if (anchorMatch) {
                return `<a href="${anchorMatch[1]}" style="${STYLES.a}" target="_self">${text}</a>`;
            }
            // Standard Anchor
            if (url.startsWith('#')) {
                return `<a href="${url}" style="${STYLES.a}" target="_self">${text}</a>`;
            }
            return `<a href="${url}" style="${STYLES.a}" target="_blank">${text}</a>`;
        });

        // Blockquotes
        html = html.replace(/^> (.+)$/gm, `<blockquote style="${STYLES.blockquote}">$1</blockquote>`);

        // HR
        html = html.replace(/^---$/gm, `<hr style="${STYLES.hr}">`);

        // Tables Pre-processing
        html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
            const cells = content.split('|').map(c => c.trim());
            if (cells.every(c => /^-+$/.test(c))) {
                return '%%TABLE_SEP%%';
            }
            return `%%TABLE_ROW%%${JSON.stringify(cells)}%%END_ROW%%`;
        });

        // ... Table Processing omitted (unchanged) ...

        // Lists (Simplified TOC - Remove Hyperlinks to prevent server filter issues)
        html = html.replace(/^(\s*)[-*] (.+)$/gm, (match, space, content) => {
            // Check if content is a TOC link [Title](#slug) - strip the link, keep text
            const tocMatch = content.match(/\[([^\]]+)\]\(#[^)]*\)/);
            if (tocMatch) {
                // Extract just the text, render as plain bullet point
                const plainText = tocMatch[1];
                return `<li style="${STYLES.li}">• ${plainText}</li>`;
            }
            // Check if already processed as <a href="#...">
            const anchorMatch = content.match(/<a href="#[^"]*"[^>]*>([^<]+)<\/a>/);
            if (anchorMatch) {
                const plainText = anchorMatch[1];
                return `<li style="${STYLES.li}">• ${plainText}</li>`;
            }
            return `<li style="${STYLES.li}">${content}</li>`;
        });
        html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, `<ul style="${STYLES.ul}; display: block; list-style-type: none; padding-left: 0; margin: 0.5em 0;">$&</ul>`);
        html = html.replace(/^\d+\. (.+)$/gm, `<li style="${STYLES.li}">$1</li>`); // Simple OL

        // Table Rows Processing
        const tableMatches = html.match(/((?:%%TABLE_ROW%%.*?%%END_ROW%%|%%TABLE_SEP%%)\n*)+/g);
        if (tableMatches) {
            tableMatches.forEach(tableBlock => {
                const rows = tableBlock.match(/%%TABLE_ROW%%(.*?)%%END_ROW%%/g);
                if (!rows) return;

                let tableHtml = `<table style="${STYLES.table}"><tbody>`;
                let isHeader = true;

                rows.forEach((row, idx) => {
                    const cellsJson = row.replace('%%TABLE_ROW%%', '').replace('%%END_ROW%%', '');
                    if (cellsJson === '%%TABLE_SEP%%') {
                        isHeader = false;
                        return;
                    }

                    try {
                        const cells = JSON.parse(cellsJson);
                        const validCells = cells.filter(c => c !== '');

                        // Use STYLES.trEven if available for zebra striping
                        let trStyle = '';
                        if (!isHeader && idx % 2 === 0) {
                            trStyle = STYLES.trEven || '';
                        }

                        tableHtml += `<tr style="${trStyle}">`;
                        validCells.forEach(cell => {
                            if (isHeader) {
                                tableHtml += `<th style="${STYLES.th}">${cell}</th>`;
                            } else {
                                tableHtml += `<td style="${STYLES.td}">${cell}</td>`;
                            }
                        });
                        tableHtml += '</tr>';
                    } catch (e) { }
                });

                tableHtml += '</tbody></table>';

                // Wrap in scroll container
                const wrappedTable = `<div style="${STYLES.tableWrapper || 'overflow-x:auto; margin: 24px 0; border: 1px solid #ddd; border-radius: 6px;'}">${tableHtml}</div>`;

                html = html.replace(tableBlock, wrappedTable);
            });
        }

        html = html.replace(/%%TABLE_SEP%%\n?/g, '');



        // Paragraphs
        const lines = html.split('\n');
        html = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('%%') || trimmed.endsWith('%%')) return line;
            return `<p style="${STYLES.p}">${trimmed}</p>`;
        }).join('\n');

        // Restore Code
        inlineCodes.forEach((code, i) => {
            html = html.replace(`%%INLINECODE_${i}%%`, `<code style="${STYLES.code}">${escapeHtml(code)}</code>`);
        });

        for (let i = 0; i < codeBlocks.length; i++) {
            const { lang, code } = codeBlocks[i];
            let highlighted = escapeHtml(code);
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                try {
                    highlighted = hljs.highlight(code, { language: lang }).value;
                } catch (e) { }
            }
            const codeHtml = `<pre style="${STYLES.pre}"><code style="font-family: inherit;">${highlighted}</code></pre>`;
            html = html.replace(`%%CODEBLOCK_${i}%%`, codeHtml);
        }

        // 5. Replace Diagrams (Mermaid + ASCII)
        const diagrams = [];

        // 5a. Mermaid
        for (let i = 0; i < mermaidBlocks.length; i++) {
            const placeholderId = `dcmd-mermaid-${Date.now()}-${i}`;
            const placeholderHtml = `<span id="${placeholderId}" class="dcmd-mermaid-placeholder" 
                style="display:block; padding:20px; text-align:center; background:rgba(128,128,128,0.1); border:1px dashed #666; margin:10px 0; color:#888;">
                ⏳ Diagram ${i + 1} Uploading...
            </span>`;

            // Note: `html` is used instead of processedMarkdown variables from here on
            // because intermediate parsing (steps 3, 4) updated `html`.
            html = html.replace(`${mermaidPlaceholder}${i}%%`, placeholderHtml);
            diagrams.push({
                type: 'mermaid',
                id: placeholderId,
                code: mermaidBlocks[i]
            });
        }

        // 5b. ASCII
        for (let i = 0; i < asciiBlocks.length; i++) {
            const placeholderId = `dcmd-ascii-${Date.now()}-${i}`;
            const placeholderHtml = `<span id="${placeholderId}" class="dcmd-ascii-placeholder" 
                style="display:block; padding:20px; text-align:center; background:rgba(128,128,128,0.1); border:1px dashed #666; margin:10px 0; color:#888;">
                ⏳ ASCII Art ${i + 1} Processing...
            </span>`;

            html = html.replace(`${asciiPlaceholder}${i}%%`, placeholderHtml);
            diagrams.push({
                type: 'ascii',
                id: placeholderId,
                code: asciiBlocks[i]
            });
        }

        // Cleanup
        html = html.replace(/<p[^>]*><\/p>/g, '');
        html = html.replace(/\n{3,}/g, '\n\n');

        // Wrap
        const finalHtml = `<div class="dcmd-content" style="${STYLES.container}">${html}</div>`;

        return { html: finalHtml, diagrams };
    }

    // Export
    window.DCMDConverter = { convert };
})();
