// Popup script for DC Markdown Poster
document.addEventListener('DOMContentLoaded', async () => {
    const pageDot = document.getElementById('pageDot');
    const pageStatus = document.getElementById('pageStatus');
    const autoEnableToggle = document.getElementById('autoEnable');
    const openEditorBtn = document.getElementById('openEditor');

    // Load saved settings
    const settings = await chrome.storage.local.get(['autoEnable']);
    autoEnableToggle.checked = settings.autoEnable !== false;

    // Check current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isWritePage = tab?.url?.includes('gall.dcinside.com') && tab?.url?.includes('/write');

    if (isWritePage) {
        pageDot.classList.add('active');
        pageStatus.textContent = '글쓰기 페이지';
        openEditorBtn.disabled = false;
    } else {
        pageStatus.textContent = '지원 안 함';
        openEditorBtn.disabled = true;
    }

    // Toggle auto-enable
    autoEnableToggle.addEventListener('change', async () => {
        await chrome.storage.local.set({ autoEnable: autoEnableToggle.checked });
    });

    // Open editor button
    openEditorBtn.addEventListener('click', async () => {
        if (!isWritePage) return;

        // Send message to content script to open editor
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleEditor' });
        window.close();
    });
});
