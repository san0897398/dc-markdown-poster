/**
 * Verification Test for Phase 4: Themes & Mobile Optimization
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock Browser Environment
global.window = {};
global.chrome = {
    runtime: { sendMessage: () => { } },
    storage: { local: { get: () => Promise.resolve({}) } }
};
global.btoa = (str) => Buffer.from(str).toString('base64');
global.unescape = (str) => str;
global.encodeURIComponent = (str) => str;

// Load Modules (simulating content script loading order)
function loadModule(filename) {
    const content = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
    eval(content);
}

console.log('--- Loading Modules ---');
loadModule('utils/style-injector.js');
loadModule('utils/mermaid-handler.js');
loadModule('utils/converter.js');

async function runTests() {
    console.log('\n=== Test 1: Style Injector Themes ===');
    const dark = window.DCMDStyleInjector.getStyles('antigravity');
    const light = window.DCMDStyleInjector.getStyles('light');

    // Check Dark Theme (Antigravity)
    if (dark.container.includes('#050510') && dark.h1.includes('#bc13fe')) {
        console.log('PASS: Dark theme colors correct');
    } else {
        console.error('FAIL: Dark theme colors mismatch', dark.container);
    }

    // Check Light Theme
    if (light.container.includes('#ffffff') && light.container.includes('box-shadow: none')) {
        console.log('PASS: Light theme colors correct');
    } else {
        console.error('FAIL: Light theme colors mismatch', light.container);
    }


    console.log('\n=== Test 2: Mermaid Mobile Rendering ===');
    const mermaidCode = 'graph TD; A-->B;';

    // Mock fetchAndUpload to return a fake URL
    // We override the internal fetchAndUpload by mocking sendMessage response if possible,
    // but DCMDMermaid.getImageUrl calls sendMessage.
    // Instead, let's mock renderToUrl behavior by hijacking fetchAndUpload if not exported.
    // Actually, DCMDMermaid exposes `getImageUrl`. We can mock `sendToBackground`.
    // But `sendToBackground` is internal. 
    // However, `renderMermaid` uses `fetchAndUpload`.

    // Let's rely on the fallback logic or try to mock chrome.runtime.sendMessage
    global.chrome.runtime.sendMessage = (msg, cb) => {
        if (msg.type === 'FETCH_AND_UPLOAD') {
            cb({ success: true, url: 'https://catbox.moe/test_img.png' });
        }
    };

    const html = await window.DCMDMermaid.renderMermaid(mermaidCode);
    console.log('Mermaid Output:', html);

    if (html.startsWith('<img') && html.includes('width: 100%')) {
        console.log('PASS: Output is a clean IMG tag with mobile styles');
    } else {
        console.error('FAIL: Output is not a clean IMG tag');
    }

    if (!html.includes('<div')) {
        console.log('PASS: No wrapper DIV found (Mobile Safe)');
    } else {
        console.error('FAIL: Wrapper DIV likely present');
    }


    console.log('\n=== Test 3: Converter Theme Integration ===');
    const markdown = '# Hello\n\nSome text';

    // Test Dark Conversion
    const darkHtml = await window.DCMDConverter.convert(markdown, 'antigravity');
    if (darkHtml.includes(dark.h1)) { // dark.h1 string is minified style
        console.log('PASS: Converter used Dark styles');
    } else {
        console.error('FAIL: Converter did not use Dark styles');
    }

    // Test Light Conversion
    const lightHtml = await window.DCMDConverter.convert(markdown, 'light');
    if (lightHtml.includes(light.h1)) {
        console.log('PASS: Converter used Light styles');
    } else {
        console.error('FAIL: Converter did not use Light styles');
    }
}

runTests().catch(e => console.error(e));
