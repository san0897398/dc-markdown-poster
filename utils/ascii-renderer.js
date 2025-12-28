/**
 * ASCII Renderer for DC Markdown Poster
 * Renders ASCII text to a high-fidelity image blob using HTML5 Canvas.
 * Ensures 1:1 pixel perfect rendering with JetBrains Mono.
 */
(function () {
    'use strict';

    const FONT_SIZE = 13;
    const LINE_HEIGHT = 1.3;
    const FONT_FAMILY = '"JetBrains Mono", "Fira Code", Consolas, monospace';
    const PADDING = 20;

    /**
     * Render ASCII text to an image Blob
     * @param {string} text - The ASCII art text
     * @param {string} theme - 'antigravity' (dark) or 'light'
     * @returns {Promise<Blob>}
     */
    async function renderAsciiToBlob(text, theme = 'antigravity') {
        const isDark = theme === 'antigravity';
        const bgColor = isDark ? '#1e1e2e' : '#ffffff';
        const textColor = isDark ? '#cdd6f4' : '#37352f';

        const lines = text.split('\n');

        // Measure logic
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;

        // Calculate dimensions
        let maxWidth = 0;
        lines.forEach(line => {
            const width = ctx.measureText(line).width;
            if (width > maxWidth) maxWidth = width;
        });

        const charWidth = ctx.measureText('M').width; // Approximate char width for safety
        const finalWidth = Math.max(maxWidth, lines.reduce((acc, line) => Math.max(acc, line.length * (charWidth * 0.6)), 0)) + (PADDING * 2);
        const finalHeight = (lines.length * (FONT_SIZE * LINE_HEIGHT)) + (PADDING * 2);

        // Resize canvas
        canvas.width = Math.ceil(finalWidth);
        canvas.height = Math.ceil(finalHeight);

        // Re-apply context settings after resize
        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = textColor;
        lines.forEach((line, i) => {
            const y = PADDING + (i * (FONT_SIZE * LINE_HEIGHT));
            ctx.fillText(line, PADDING, y);
        });

        // Convert to Blob
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/png');
        });
    }

    window.DCMDAsciiRenderer = {
        renderAsciiToBlob
    };

})();
