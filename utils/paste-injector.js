/**
 * Paste Injector for DC Markdown Poster
 * Simulates a native user paste event to trigger DC's internal image uploader.
 */
(function () {
    'use strict';

    /**
     * Inject an image blob into the editor as if pasted by the user.
     * @param {Blob} blob - The image blob to inject
     * @param {Element} targetElement - The element to dispatch the paste event (usually .note-editable)
     */
    function injectImageBlob(blob, targetElement) {
        if (!targetElement) {
            console.error('[PasteInjector] No target element provided');
            return false;
        }

        try {
            console.log('[PasteInjector] Injecting blob:', blob.type, blob.size);

            // 1. Create a fake File object from the blob
            const file = new File([blob], "mermaid_diagram.png", { type: "image/png" });

            // 2. Create DataTransfer object and add the file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // 3. Create a ClipboardEvent
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dataTransfer
            });

            // 4. Dispatch the event
            targetElement.dispatchEvent(pasteEvent);
            console.log('[PasteInjector] Paste event dispatched');
            return true;

        } catch (err) {
            console.error('[PasteInjector] Injection failed:', err);
            return false;
        }
    }

    /**
     * Convert Base64 Data URL to Blob
     */
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    window.DCMDInjector = {
        inject: injectImageBlob,
        dataURLtoBlob: dataURLtoBlob
    };
})();
