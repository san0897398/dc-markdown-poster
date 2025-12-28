/**
 * Antigravity Style System (Hardened)
 * Provides Notion-like styles for DC Markdown Poster
 */
(function () {
    'use strict';

    // Theme Definitions (Simple Strings)
    const PALETTES = {
        'antigravity': {
            bg: '#191919',
            text: '#D4D4D4',
            border: '#2F2F2F',
            codeBg: '#272727',
            accent: '#2EAADC', // Notion Blue (Matched to Editor)
            tableHeader: '#252525',
            tableBorder: '#373737',
            error: '#FC8181'
        },
        'light': {
            bg: '#FFFFFF',
            text: '#37352F',
            border: '#E9E9E7',
            codeBg: '#F7F7F5',
            accent: '#0B6E99',
            tableHeader: '#F7F7F5',
            tableBorder: '#E9E9E7',
            error: '#D32F2F'
        }
    };

    function getStyles(themeName = 'antigravity') {
        const theme = PALETTES[themeName] || PALETTES['antigravity'];

        // Hardcoded Font Stack with Single Quotes strictly
        // This avoids any quote nesting issues in HTML attributes
        const fontStack = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
        const monoStack = "'JetBrains Mono', monospace";

        // Inject Fonts safely
        try {
            if (!document.getElementById('dcmd-font-pretendard')) {
                const link = document.createElement('link');
                link.id = 'dcmd-font-pretendard';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css';
                document.head.appendChild(link);
            }
            if (!document.getElementById('dcmd-font-jetbrains')) {
                const link = document.createElement('link');
                link.id = 'dcmd-font-jetbrains';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/jetbrains-mono@1.0.6/css/jetbrains-mono.min.css';
                document.head.appendChild(link);
            }
        } catch (e) {
            console.error('DCMD Font Inject Error:', e);
        }

        // Return flattened styles with single-quoted values where possible
        // We use template literals, but ensure NO double quotes exist in the output strings
        return {
            container: `font-family: ${fontStack}; line-height: 1.6; color: ${theme.text}; background-color: ${theme.bg} !important; box-sizing: border-box; width: 100%; max-width: 720px; margin: 0; padding: 24px 16px; border-radius: 0; font-size: 16px; word-break: keep-all; overflow-wrap: break-word; text-align: left; -webkit-font-smoothing: antialiased; letter-spacing: -0.003em;`,

            h1: `font-size: 1.8em; font-weight: 700; margin: 2em 0 0.6em; padding-top: 0.5em; color: ${theme.text}; border-bottom: none; line-height: 1.3; letter-spacing: -0.02em; text-align: left;`,
            h2: `font-size: 1.5em; font-weight: 600; margin: 1.8em 0 0.4em; padding-top: 0.3em; color: ${theme.text}; border-bottom: 1px solid ${theme.border}; padding-bottom: 6px; text-align: left;`,
            h3: `font-size: 1.3em; font-weight: 600; margin: 1.4em 0 0.3em; color: ${theme.text}; text-align: left;`,

            p: `margin: 0.5em 0; line-height: 1.6; min-height: 1em; text-align: left;`,
            strong: `font-weight: 600; color: ${theme.text};`,
            em: `font-style: italic; opacity: 0.85;`,
            a: `color: ${theme.text}; text-decoration: underline; text-decoration-color: ${theme.accent}; text-underline-offset: 3px; opacity: 0.9;`,

            hr: `border: none; border-bottom: 1px solid ${theme.border}; margin: 32px 0;`,

            blockquote: `border-left: 3px solid ${theme.text}; padding: 4px 14px; margin: 12px 0; color: ${theme.text}; background: transparent; font-style: normal; opacity: 0.85; text-align: left;`,

            code: `font-family: ${monoStack}; background: ${theme.codeBg}; padding: 2px 5px; border-radius: 3px; font-size: 85%; color: ${theme.error};`,
            pre: `font-family: ${monoStack}; background: ${theme.codeBg}; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 16px 0; font-size: 14px; line-height: 1.5; color: ${theme.text}; white-space: pre !important; word-break: normal !important; tab-size: 4; -webkit-overflow-scrolling: touch; text-align: left;`,

            table: `border-collapse: collapse; width: auto; max-width: 100%; font-size: 14px; border: 1px solid ${theme.tableBorder}; border-radius: 0; margin: 0;`,
            th: `background-color: ${theme.tableHeader}; font-weight: 600; text-align: left; padding: 10px 12px; border: 1px solid ${theme.tableBorder}; color: ${theme.text};`,
            td: `padding: 8px 12px; border: 1px solid ${theme.tableBorder}; color: ${theme.text};`,
            trEven: `background-color: transparent;`,
            tableWrapper: `overflow-x: auto; margin: 24px 0; border: none; border-radius: 3px; -webkit-overflow-scrolling: touch;`,

            ul: `margin: 0.5em 0; padding-left: 0; list-style-type: disc; list-style-position: inside; text-align: left;`,
            li: `margin: 0.2em 0; padding-left: 0; text-align: left;`,
            imgContainer: `margin: 24px 0; padding: 0; display: block; text-align: center !important; width: 100%;`
        };
    }

    // Export
    window.DCMDStyleInjector = {
        getStyles,
        PALETTES
    };
})();
