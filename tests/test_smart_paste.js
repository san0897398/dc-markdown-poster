/**
 * Verification Test for Phase 5: Smart Paste Injection
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require("jsdom");

// Mock Browser Environment
const dom = new JSDOM(`<!DOCTYPE html><body><div class="note-editable"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.File = dom.window.File;
global.Blob = dom.window.Blob;
global.DataTransfer = class MockDataTransfer {
    constructor() { this.items = { add: () => { } }; }
};
global.ClipboardEvent = class MockClipboardEvent extends dom.window.Event {
    constructor(type, options) {
        super(type, options);
        this.clipboardData = options.clipboardData;
    }
};

// Mock Chrome API
global.chrome = {
    runtime: {
        sendMessage: (msg, cb) => {
            if (msg.type === 'FETCH_BLOB_BASE64') {
                // Return dummy base64 png
                cb({ success: true, base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgDNjd8qAAAAAElFTkSuQmCC' });
            }
        },
        lastError: null
    },
    storage: { local: { get: () => Promise.resolve({}) } }
};

// Load Modules
function loadModule(filename) {
    const content = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
    eval(content);
}

console.log('--- Loading Modules ---');
loadModule('utils/style-injector.js');
loadModule('utils/mermaid-handler.js'); // Mock this slightly?
loadModule('utils/converter.js');
loadModule('utils/paste-injector.js');

// Mock `getMermaidInkUrl` to return dummy url if needed
// Actually we can just run the test
// Need to mock fetch inside paste-injector? No, it uses File/Blob. JSDOM supports basic Blob.

async function runTests() {
    console.log('\n=== Test 1: Converter returns Placeholders ===');
    const markdown = "```mermaid\ngraph A-->B\n```";
    const result = await window.DCMDConverter.convert(markdown);

    console.log('Result HTML:', result.html.substring(0, 150) + '...');
    if (result.html.includes('dcmd-mermaid-placeholder')) {
        console.log('PASS: Placeholder present');
    } else {
        console.error('FAIL: No placeholder found');
    }

    if (result.diagrams.length === 1 && result.diagrams[0].code.includes('A-->B')) {
        console.log('PASS: Diagram metadata correct');
    } else {
        console.error('FAIL: Metadata missing');
    }

    console.log('\n=== Test 2: Paste Injection Simulation ===');
    const editor = document.querySelector('.note-editable');
    const placeholder = document.createElement('span');
    placeholder.id = result.diagrams[0].id;
    editor.appendChild(placeholder);

    // Mock paste listener to verify
    let pasteTriggered = false;
    editor.addEventListener('paste', (e) => {
        pasteTriggered = true;
        console.log('EVENT: Paste detected on editor');
    });

    // Run injection
    // 1. Get Blob
    const blob = await window.DCMDMermaid.getDiagramBlob("graph A-->B");
    // 2. Inject
    const success = window.DCMDInjector.inject(blob, editor);

    if (success && pasteTriggered) {
        console.log('PASS: Injection triggered Paste event');
    } else {
        console.error('FAIL: Injection failed or event not dispatched');
    }
}

runTests().catch(e => console.error(e));
