// DC Markdown Converter v3
// GitHub Markdown CSS + Pretendard 기반 한국어 최적화

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // 색상 팔레트 (GitHub Primer 기반)
    // ═══════════════════════════════════════════════════════════════════════
    const COLORS = {
        // 텍스트
        text: '#1f2328',
        textMuted: '#59636e',
        textLight: '#818b98',

        // 배경
        bgWhite: '#ffffff',
        bgLight: '#f6f8fa',
        bgHover: '#f0f4f8',

        // 테두리
        border: '#d1d9e0',
        borderLight: '#e8ecef',

        // 강조색
        link: '#0969da',
        accent: '#0969da',

        // 코드 구문 강조 (One Light)
        codeKeyword: '#a626a4',
        codeString: '#50a14f',
        codeNumber: '#986801',
        codeFunction: '#4078f2',
        codeComment: '#a0a1a7'
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 폰트 스택 (한국어 최적화)
    // ═══════════════════════════════════════════════════════════════════════
    const FONTS = {
        body: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
        code: '"D2Coding", "D2 Coding", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 스타일 정의 (GitHub Markdown CSS 기반)
    // ═══════════════════════════════════════════════════════════════════════
    const STYLES = {
        // 제목
        h1: `
            font-size: 2em;
            font-weight: 600;
            margin: 24px 0 16px 0;
            padding-bottom: 0.3em;
            line-height: 1.25;
            color: ${COLORS.text};
            border-bottom: 1px solid ${COLORS.border};
        `.replace(/\s+/g, ' ').trim(),

        h2: `
            font-size: 1.5em;
            font-weight: 600;
            margin: 24px 0 16px 0;
            padding-bottom: 0.3em;
            line-height: 1.25;
            color: ${COLORS.text};
            border-bottom: 1px solid ${COLORS.border};
        `.replace(/\s+/g, ' ').trim(),

        h3: `
            font-size: 1.25em;
            font-weight: 600;
            margin: 24px 0 16px 0;
            line-height: 1.25;
            color: ${COLORS.text};
        `.replace(/\s+/g, ' ').trim(),

        h4: `
            font-size: 1em;
            font-weight: 600;
            margin: 24px 0 16px 0;
            line-height: 1.25;
            color: ${COLORS.text};
        `.replace(/\s+/g, ' ').trim(),

        // 본문
        p: `
            margin: 0 0 16px 0;
            line-height: 1.6;
            color: ${COLORS.text};
            word-break: keep-all;
        `.replace(/\s+/g, ' ').trim(),

        strong: `
            font-weight: 600;
            color: ${COLORS.text};
        `.replace(/\s+/g, ' ').trim(),

        em: 'font-style: italic;',

        // 인라인 코드
        code: `
            padding: 0.2em 0.4em;
            font-family: ${FONTS.code};
            font-size: 85%;
            background-color: rgba(129, 139, 152, 0.12);
            border-radius: 6px;
            color: ${COLORS.text};
        `.replace(/\s+/g, ' ').trim(),

        // 코드 블록
        pre: `
            margin: 0 0 16px 0;
            padding: 16px;
            font-family: ${FONTS.code};
            font-size: 85%;
            line-height: 1.45;
            background-color: ${COLORS.bgLight};
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid ${COLORS.borderLight};
        `.replace(/\s+/g, ' ').trim(),

        preCode: `
            padding: 0;
            font-family: ${FONTS.code};
            font-size: 100%;
            background: transparent;
            color: ${COLORS.text};
            line-height: 1.45;
        `.replace(/\s+/g, ' ').trim(),

        // 인용문
        blockquote: `
            margin: 0 0 16px 0;
            padding: 0 1em;
            color: ${COLORS.textMuted};
            border-left: 0.25em solid ${COLORS.border};
        `.replace(/\s+/g, ' ').trim(),

        // 리스트
        ul: `
            margin: 0 0 16px 0;
            padding-left: 2em;
        `.replace(/\s+/g, ' ').trim(),

        ol: `
            margin: 0 0 16px 0;
            padding-left: 2em;
        `.replace(/\s+/g, ' ').trim(),

        li: `
            margin: 4px 0;
            line-height: 1.6;
            color: ${COLORS.text};
        `.replace(/\s+/g, ' ').trim(),

        // 테이블
        table: `
            width: 100%;
            margin: 0 0 16px 0;
            border-collapse: collapse;
            border-spacing: 0;
        `.replace(/\s+/g, ' ').trim(),

        th: `
            padding: 8px 16px;
            font-weight: 600;
            text-align: center;
            background-color: ${COLORS.bgLight};
            border: 1px solid ${COLORS.border};
            color: ${COLORS.text};
        `.replace(/\s+/g, ' ').trim(),

        td: `
            padding: 8px 16px;
            text-align: left;
            border: 1px solid ${COLORS.border};
            color: ${COLORS.text};
            vertical-align: middle;
        `.replace(/\s+/g, ' ').trim(),

        trEven: `background-color: ${COLORS.bgLight};`,

        // 링크
        a: `
            color: ${COLORS.link};
            text-decoration: none;
        `.replace(/\s+/g, ' ').trim(),

        // 구분선
        hr: `
            height: 0.25em;
            margin: 24px 0;
            padding: 0;
            background-color: ${COLORS.border};
            border: 0;
        `.replace(/\s+/g, ' ').trim(),

        // 이미지
        img: `
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 16px 0;
        `.replace(/\s+/g, ' ').trim()
    };

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

    // Convert Markdown to HTML with inline styles
    async function convert(markdown) {
        let html = markdown;

        // Store code blocks and mermaid to protect from processing
        const codeBlocks = [];
        const mermaidBlocks = [];

        // Extract mermaid blocks first
        html = html.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (match, code) => {
            const index = mermaidBlocks.length;
            const trimmedCode = code.trim();
            mermaidBlocks.push(trimmedCode);
            return `%%MERMAID_${index}%%`;
        });

        // Extract code blocks
        html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (match, lang, code) => {
            const index = codeBlocks.length;
            codeBlocks.push({ lang, code: code.trim() });
            return `%%CODEBLOCK_${index}%%`;
        });

        // Extract inline code
        const inlineCodes = [];
        html = html.replace(/`([^`]+)`/g, (match, code) => {
            const index = inlineCodes.length;
            inlineCodes.push(code);
            return `%%INLINECODE_${index}%%`;
        });

        // Headers
        html = html.replace(/^#### (.+)$/gm, `<h4 style="${STYLES.h4}">$1</h4>`);
        html = html.replace(/^### (.+)$/gm, `<h3 style="${STYLES.h3}">$1</h3>`);
        html = html.replace(/^## (.+)$/gm, `<h2 style="${STYLES.h2}">$1</h2>`);
        html = html.replace(/^# (.+)$/gm, `<h1 style="${STYLES.h1}">$1</h1>`);

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, `<strong style="${STYLES.strong}"><em>$1</em></strong>`);
        html = html.replace(/\*\*(.+?)\*\*/g, `<strong style="${STYLES.strong}">$1</strong>`);
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

        // Links and images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<img src="$2" alt="$1" style="${STYLES.img}">`);
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="${STYLES.a}" target="_blank">$1</a>`);

        // Blockquotes
        html = html.replace(/^> (.+)$/gm, `<blockquote style="${STYLES.blockquote}">$1</blockquote>`);

        // Horizontal rule
        html = html.replace(/^---$/gm, `<hr style="${STYLES.hr}">`);

        // Tables
        html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
            const cells = content.split('|').map(c => c.trim());
            if (cells.every(c => /^-+$/.test(c))) {
                return '%%TABLE_SEP%%';
            }
            return `%%TABLE_ROW%%${JSON.stringify(cells)}%%END_ROW%%`;
        });

        // Process table rows
        const tableMatches = html.match(/(%%TABLE_ROW%%.*%%END_ROW%%\n*)+/g);
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
                        const rowStyle = (!isHeader && idx % 2 === 0) ? STYLES.trEven : '';
                        tableHtml += `<tr style="${rowStyle}">`;
                        cells.forEach(cell => {
                            if (isHeader) {
                                tableHtml += `<th style="${STYLES.th}">${cell}</th>`;
                            } else {
                                tableHtml += `<td style="${STYLES.td}">${cell}</td>`;
                            }
                        });
                        tableHtml += '</tr>';
                        if (isHeader) isHeader = false;
                    } catch (e) { }
                });

                tableHtml += '</tbody></table>';
                html = html.replace(tableBlock, tableHtml);
            });
        }

        // Clean up table separators
        html = html.replace(/%%TABLE_SEP%%\n?/g, '');

        // Unordered lists
        html = html.replace(/^(\s*)[-*] (.+)$/gm, (match, indent, content) => {
            return `<li style="${STYLES.li}">${content}</li>`;
        });

        // Wrap consecutive li elements in ul
        html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => {
            return `<ul style="${STYLES.ul}">${match}</ul>`;
        });

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, `<li style="${STYLES.li}">$1</li>`);

        // Paragraphs
        const lines = html.split('\n');
        html = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed ||
                trimmed.startsWith('<') ||
                trimmed.startsWith('%%') ||
                trimmed.endsWith('%%')) {
                return line;
            }
            return `<p style="${STYLES.p}">${trimmed}</p>`;
        }).join('\n');

        // Restore inline code
        inlineCodes.forEach((code, index) => {
            html = html.replace(`%%INLINECODE_${index}%%`, `<code style="${STYLES.code}">${escapeHtml(code)}</code>`);
        });

        // Restore code blocks
        for (let i = 0; i < codeBlocks.length; i++) {
            const { lang, code } = codeBlocks[i];
            let highlighted = escapeHtml(code);

            if (typeof hljs !== 'undefined' && lang) {
                try {
                    highlighted = hljs.highlight(code, { language: lang }).value;
                } catch (e) { }
            }

            const codeHtml = `<pre style="${STYLES.pre}"><code style="${STYLES.preCode}">${highlighted}</code></pre>`;
            html = html.replace(`%%CODEBLOCK_${i}%%`, codeHtml);
        }

        // Restore mermaid blocks
        for (let i = 0; i < mermaidBlocks.length; i++) {
            try {
                const imgHtml = await window.DCMDMermaid.renderToUrl(mermaidBlocks[i]);
                html = html.replace(`%%MERMAID_${i}%%`, imgHtml);
            } catch (e) {
                console.error('Mermaid render error:', e);
                html = html.replace(`%%MERMAID_${i}%%`,
                    `<pre style="${STYLES.pre}"><code style="${STYLES.preCode}">[Mermaid Error: ${e.message}]\n${escapeHtml(mermaidBlocks[i])}</code></pre>`);
            }
        }

        // Clean up
        html = html.replace(/<p[^>]*><\/p>/g, '');
        html = html.replace(/\n{3,}/g, '\n\n');

        return html;
    }

    // Export
    window.DCMDConverter = { convert };
})();
