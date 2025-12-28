/**
 * Text Graph Renderer for DC Markdown Poster
 * Fallback for when images are blocked
 */
(function () {
    'use strict';

    function renderGraphToText(code) {
        // Very basic parser for A --> B
        // This is a placeholder for a more robust ASCII/Unicode renderer

        const lines = code.split('\n');
        let output = [];

        output.push('┌──────────────────────────────────────┐');
        output.push('│      Text Mode Fallback Graph        │');
        output.push('└──────────────────────────────────────┘');
        output.push('');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes('-->')) {
                const parts = trimmed.split('-->');
                const from = parts[0].trim().replace(/\[|\]/g, '');
                const to = parts[1].trim().replace(/\[|\]/g, '');
                output.push(` [ ${from} ] ──▶ [ ${to} ]`);
            } else if (trimmed.startsWith('graph')) {
                output.push(` Graph Type: ${trimmed.replace('graph', '').trim()}`);
            }
        });

        return output.join('\n');
    }

    window.DCMDTextRenderer = {
        render: renderGraphToText
    };
})();
