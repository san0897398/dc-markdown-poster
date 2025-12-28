// Background Service Worker for DC Markdown Poster
// Handles cross-origin requests (mermaid.ink fetch + Catbox.moe upload)

const CONFIG = {
    catbox: 'https://catbox.moe/user/api.php'
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_AND_UPLOAD') {
        handleFetchAndUpload(request.mermaidUrl)
            .then(url => sendResponse({ success: true, url }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    if (request.type === 'UPLOAD_TO_CATBOX') {
        handleUploadBlob(request.dataUrl)
            .then(url => sendResponse({ success: true, url }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.type === 'REHOST_TO_CATBOX') {
        rehostToCatbox(request.imageUrl)
            .then(url => sendResponse({ success: true, url }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.type === 'FETCH_BLOB_BASE64') {
        fetchBlobBase64(request.url)
            .then(base64 => sendResponse({ success: true, base64 }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

/**
 * Fetch a URL and return as Base64 string
 */
async function fetchBlobBase64(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Returns data:image/png;base64,...
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Fetch image from mermaid.ink and upload to Catbox.moe
 */
async function handleFetchAndUpload(mermaidUrl) {
    console.log('[BG] Fetching:', mermaidUrl.substring(0, 80) + '...');

    // Fetch from mermaid.ink
    const imgResponse = await fetch(mermaidUrl);
    if (!imgResponse.ok) {
        throw new Error(`mermaid.ink failed: ${imgResponse.status}`);
    }

    const blob = await imgResponse.blob();
    console.log('[BG] Got blob:', blob.size, 'bytes');

    // Upload to Catbox.moe
    const imageUrl = await uploadToCatbox(blob);
    console.log('[BG] Uploaded:', imageUrl);

    return imageUrl;
}

/**
 * Upload data URL to Catbox.moe
 */
async function handleUploadBlob(dataUrl) {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return await uploadToCatbox(blob);
}

/**
 * Rehost an image URL to Catbox.moe using urlupload
 * @param {string} imageUrl - The URL of the image to rehost
 * @returns {Promise<string>} - The Catbox.moe URL
 */
async function rehostToCatbox(imageUrl) {
    console.log('[BG] Rehosting to Catbox:', imageUrl.substring(0, 80) + '...');

    const formData = new FormData();
    formData.append('reqtype', 'urlupload');
    formData.append('url', imageUrl);

    const response = await fetch(CONFIG.catbox, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Catbox urlupload failed: ${response.status}`);
    }

    const result = await response.text();
    console.log('[BG] Catbox rehost response:', result);

    // Catbox returns the URL directly as text
    if (!result.startsWith('https://files.catbox.moe/')) {
        throw new Error(`Catbox error: ${result}`);
    }

    return result.trim();
}

/**
 * Upload blob to Catbox.moe using fileupload
 * @param {Blob} blob - The image blob to upload
 * @returns {Promise<string>} - The Catbox.moe URL (https://files.catbox.moe/xxx.png)
 */
async function uploadToCatbox(blob) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, 'mermaid.png');

    const response = await fetch(CONFIG.catbox, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Catbox upload failed: ${response.status}`);
    }

    const result = await response.text();
    console.log('[BG] Catbox response:', result);

    // Catbox returns the URL directly as text
    // e.g., "https://files.catbox.moe/abc123.png"
    if (!result.startsWith('https://files.catbox.moe/')) {
        throw new Error(`Catbox error: ${result}`);
    }

    return result.trim();
}
