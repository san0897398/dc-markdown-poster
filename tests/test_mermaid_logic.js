const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock Browser Environment
const window = {
    console: console,
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    unescape: (str) => global.unescape(str),
    encodeURIComponent: (str) => global.encodeURIComponent(str)
};
// Mock Style Injector
window.DCMDStyleInjector = {
    STYLES: {
        imgContainer: 'style="margin: 0;"',
        errorBox: 'style="color: red;"'
    }
};
global.window = window;
global.self = window;
global.btoa = window.btoa;

// Mock Chrome API
const chrome = {
    runtime: {
        sendMessage: (msg, callback) => {
            console.log('[MockChrome] sendMessage:', msg);
            // Simulate timeout or success based on message type
            if (msg.type === 'TIMEOUT_TEST') {
                // Do nothing, let it timeout
            } else {
                setTimeout(() => {
                    callback({ success: true, url: 'https://mocked.url/image.png' });
                }, 100);
            }
        },
        lastError: null
    }
};
global.chrome = chrome;

// Load mermaid-handler.js
const handlerPath = path.join(__dirname, '../utils/mermaid-handler.js');
const handlerCode = fs.readFileSync(handlerPath, 'utf8');

// Run in context
vm.createContext(global);
vm.runInThisContext(handlerCode);

async function runTests() {
    console.log('--- Starting Tests ---\n');

    // Test 1: Pako missing fallback
    console.log('Test 1: Pako missing fallback');
    global.pako = undefined;
    const code = 'graph TD; A-->B;';
    const encodedFallback = window.DCMDMermaid.encodeMermaid(code);
    console.log('Fallback Encoded:', encodedFallback.substring(0, 20) + '...');
    if (!encodedFallback.includes('-') && !encodedFallback.includes('_')) { // Base64 usually has +/, but url safe replace happens?
        // simple base64 with / img endpoint
        console.log('PASS: Fallback encoding generated');
    } else {
        console.log('INFO: Generated string: ' + encodedFallback);
    }

    const urlFallback = window.DCMDMermaid.getMermaidInkUrl(code);
    console.log('Fallback URL:', urlFallback);
    if (urlFallback.includes('/img/') && !urlFallback.includes('/pako:')) {
        console.log('PASS: Correct fallback URL format');
    } else {
        console.error('FAIL: Incorrect fallback URL format');
    }

    console.log('\n--------------------------------\n');

    // Test 2: Pako present
    console.log('Test 2: Pako present');
    // Mock Pako (very simple mock)
    global.pako = {
        deflate: (data) => {
            return new Uint8Array([1, 2, 3, 4, 5]); // Mock compressed data
        }
    };
    const encoder = new TextEncoder(); // specific formatting
    global.TextEncoder = class {
        encode(str) { return Buffer.from(str); }
    };

    // Reload handler to pick up pako check? No, encodeMermaid checks at runtime.
    const encodedPako = window.DCMDMermaid.encodeMermaid(code);
    console.log('Pako Encoded:', encodedPako);

    const urlPako = window.DCMDMermaid.getMermaidInkUrl(code);
    console.log('Pako URL:', urlPako);
    if (urlPako.includes('/pako:')) {
        console.log('PASS: Correct Pako URL format');
    } else {
        console.error('FAIL: Incorrect Pako URL format');
    }

    console.log('\n--------------------------------\n');

    // Test 3: renderMermaid safety (Force Upload Strategy)
    console.log('Test 3: renderMermaid safety (Force Upload)');
    const code3 = 'graph TD; Unique1-->Unique2;';

    // Reset mock message log
    const msgLog = [];
    chrome.runtime.sendMessage = (msg, callback) => {
        msgLog.push(msg);
        setTimeout(() => {
            callback({ success: true, url: 'https://catbox.moe/uploaded_unique1.png' });
        }, 10);
    };

    const html = await window.DCMDMermaid.renderMermaid(code3);
    console.log('Render Result:', html);

    // Should have sent a FETCH_AND_UPLOAD message
    const uploadMsg = msgLog.find(m => m.type === 'FETCH_AND_UPLOAD');
    if (uploadMsg) {
        console.log('PASS: FETCH_AND_UPLOAD message sent for render');
    } else {
        console.error('FAIL: No upload message sent (should force upload)');
    }

    if (html.includes('<img src="https://catbox.moe/uploaded_unique1.png"')) {
        console.log('PASS: Rendered with uploaded URL');
    } else {
        console.error('FAIL: Render output mismatch');
    }

    console.log('\n--------------------------------\n');

    // Test 4: renderMermaid Fallback on Upload Failure
    console.log('Test 4: Fallback on Upload Failure');
    const code4 = 'graph TD; Unique3-->Unique4;';

    // Mock failure
    chrome.runtime.sendMessage = (msg, callback) => {
        setTimeout(() => {
            callback({ success: false, error: 'Upload broken' });
        }, 10);
    };

    const htmlFallback = await window.DCMDMermaid.renderMermaid(code4);
    console.log('Fallback Result:', htmlFallback);

    if (htmlFallback.includes('style="margin: 0;"')) {
        console.log('PASS: Output includes container styles');
    } else {
        console.error('FAIL: Output missing container styles');
    }

    if (htmlFallback.includes('mermaid.ink/img/pako:')) {
        console.log('PASS: Fell back to direct URL on upload failure');
    } else {
        console.error('FAIL: Did not fall back to direct URL');
    }

    console.log('\n--------------------------------\n');

    // Test 5: renderMermaid Timeout (simulate via timeout msg)
    console.log('Test 5: Timeout handling');
    const code5 = 'graph TD; Unique5-->Unique6;';

    // We override sendMessage to simulate timeout
    chrome.runtime.sendMessage = (msg, callback) => {
        // Never call callback
        console.log('[MockChrome] Simulating timeout');
    };

    // Reduce timeout for test
    window.DCMDMermaid.config.timeoutMs = 500;

    try {
        const htmlTimeout = await window.DCMDMermaid.renderMermaid(code5);
        if (htmlTimeout.includes('mermaid.ink/img/pako:')) {
            console.log('PASS: Fell back to direct URL on timeout'); // renderMermaid catches the timeout error and falls back!
        } else {
            console.error('FAIL: Output mismatch on timeout');
        }
    } catch (e) {
        console.error('FATAL: renderMermaid should catch errors:', e.message);
    }

    console.log('\n--- Tests Completed ---');
}

runTests().catch(e => console.error('Test Suite Failed:', e));
