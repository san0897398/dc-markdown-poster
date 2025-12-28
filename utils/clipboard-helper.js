/**
 * Clipboard Helper for DC Markdown Poster
 * Handle copying images to clipboard for native upload
 */
(function () {
    'use strict';

    /**
     * Copy an image URL to clipboard as a PNG blob
     * @param {string} imageUrl - URL of the image
     * @returns {Promise<void>}
     */
    async function copyImageToClipboard(imageUrl) {
        try {
            // Fetch the image
            // Note: This might need to go through background script if CORS is an issue
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Create ClipboardItem
            const item = new ClipboardItem({
                [blob.type]: blob
            });

            // Write to clipboard
            await navigator.clipboard.write([item]);
            console.log('[Clipboard] Image copied successfully');
            return true;
        } catch (err) {
            console.error('[Clipboard] Failed to copy image:', err);
            return false;
        }
    }

    /**
     * Copy text to clipboard
     * @param {string} text 
     */
    async function copyTextToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('[Clipboard] Failed to copy text:', err);
            return false;
        }
    }

    window.DCMDClipboard = {
        copyImage: copyImageToClipboard,
        copyText: copyTextToClipboard
    };
})();
