// Content script for DC Markdown Poster
// Injected into DCInside write pages

(function () {
    'use strict';

    let editorOverlay = null;
    let isEditorOpen = false;

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'toggleEditor') {
            toggleEditor();
            sendResponse({ success: true });
        }
    });

    // Auto-initialize if enabled
    async function init() {
        const settings = await chrome.storage.local.get(['autoEnable']);
        if (settings.autoEnable !== false) {
            addEditorButton();
        }
    }

    // Add floating button to page
    function addEditorButton() {
        if (document.getElementById('dc-md-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'dc-md-btn';
        btn.innerHTML = '📝 MD';
        btn.title = 'DC Markdown Poster 열기';
        // Styles are in editor.css now, but inline for button to ensure load
        btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: bold;
      color: white;
      background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
      border: none;
      border-radius: 50px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    `;

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
        });

        btn.addEventListener('click', toggleEditor);
        document.body.appendChild(btn);
    }

    // Toggle editor overlay
    function toggleEditor() {
        if (isEditorOpen) {
            closeEditor();
        } else {
            openEditor();
        }
    }

    // Open editor overlay
    function openEditor() {
        if (editorOverlay) return;

        editorOverlay = document.createElement('div');
        editorOverlay.id = 'dc-md-overlay';
        editorOverlay.innerHTML = `
      <div class="dc-md-container">
        <!-- Overlay for Converting -->
        <div id="dc-md-converter-overlay">
            <div class="dc-md-spinner"></div>
            <div class="dc-md-converter-status">Processing...</div>
        </div>

        <div class="dc-md-header">
          <h2>📝 DC Markdown Poster</h2>
          <div class="dc-md-header-actions">
            <button class="dc-md-btn-secondary" id="dc-md-theme-toggle" title="테마 변경">🌙</button>
            <button class="dc-md-btn-close" id="dc-md-close">✕</button>
          </div>
        </div>
        
        <div class="dc-md-body">
          <div class="dc-md-editor-pane">
            <div class="dc-md-toolbar">
              <button data-action="bold" title="굵게 (Ctrl+B)">B</button>
              <button data-action="italic" title="기울임 (Ctrl+I)">I</button>
              <button data-action="code" title="인라인 코드">⌘</button>
              <button data-action="link" title="링크">#</button>
              <span class="dc-md-separator"></span>
              <button data-action="h1" title="제목 1">H1</button>
              <button data-action="h2" title="제목 2">H2</button>
              <button data-action="h3" title="제목 3">H3</button>
              <span class="dc-md-separator"></span>
              <button data-action="ul" title="목록">•</button>
              <button data-action="ol" title="번호 목록">1.</button>
              <button data-action="quote" title="인용">❝</button>
              <button data-action="codeblock" title="코드 블록">{ }</button>
              <button data-action="mermaid" title="Mermaid 다이어그램">◈</button>
              <button data-action="table" title="테이블">⊞</button>
              <button data-action="test-filters" title="필터 테스트 (🧪)">🧪</button>
            </div>
            <textarea id="dc-md-input" placeholder="여기에 마크다운을 입력하세요..."></textarea>
          </div>
        </div>
        
      <div class="dc-md-footer">
          <div class="dc-md-footer-actions">
            <button class="dc-md-btn-secondary" id="dc-md-clear">초기화</button>
            <button class="dc-md-btn-primary" id="dc-md-insert">변환 후 삽입</button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(editorOverlay);
        isEditorOpen = true;

        // Bind events
        bindEditorEvents();

        // Initial render (and theme load)
        initializeState();
    }

    // Initialize State (Theme)
    async function initializeState() {
        const data = await chrome.storage.local.get(['theme']);
        const theme = data.theme || 'antigravity';
        applyTheme(theme);
    }

    // Show/Hide Overlay
    function showOverlay(msg) {
        const overlay = document.getElementById('dc-md-converter-overlay');
        const status = overlay ? overlay.querySelector('.dc-md-converter-status') : null;
        if (overlay && status) {
            status.textContent = msg || 'Processing...';
            overlay.classList.add('active');
        }
    }

    function hideOverlay() {
        const overlay = document.getElementById('dc-md-converter-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    // Apply Theme UI
    function applyTheme(theme) {
        const container = document.querySelector('.dc-md-container');
        const toggleBtn = document.getElementById('dc-md-theme-toggle');

        if (!container || !toggleBtn) return;

        if (theme === 'light') {
            container.classList.add('light-theme');
            toggleBtn.textContent = '☀️';
            toggleBtn.title = '라이트 모드 (Standard)';
        } else {
            container.classList.remove('light-theme');
            toggleBtn.textContent = '🌙';
            toggleBtn.title = '다크 모드 (Antigravity)';
        }

        // Save current theme state on the container dataset for easy access
        container.dataset.theme = theme;
    }

    // Close editor
    function closeEditor() {
        if (editorOverlay) {
            editorOverlay.remove();
            editorOverlay = null;
        }
        isEditorOpen = false;
    }

    // Bind editor events
    function bindEditorEvents() {
        const input = document.getElementById('dc-md-input');
        const closeBtn = document.getElementById('dc-md-close');
        const clearBtn = document.getElementById('dc-md-clear');
        const insertBtn = document.getElementById('dc-md-insert');
        const themeToggle = document.getElementById('dc-md-theme-toggle');

        // Close
        closeBtn.addEventListener('click', closeEditor);

        // Click outside to close
        editorOverlay.addEventListener('click', (e) => {
            if (e.target === editorOverlay) closeEditor();
        });

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isEditorOpen) closeEditor();
        });

        // Clear
        clearBtn.addEventListener('click', () => {
            input.value = '';
        });

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            const container = document.querySelector('.dc-md-container');
            const currentTheme = container.dataset.theme || 'antigravity';
            const newTheme = currentTheme === 'antigravity' ? 'light' : 'antigravity';

            applyTheme(newTheme);
            chrome.storage.local.set({ theme: newTheme });
        });

        // Toolbar actions
        document.querySelectorAll('.dc-md-toolbar button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'test-filters') {
                    insertFilterTest();
                } else {
                    applyToolbarAction(action);
                }
            });
        });

        // Insert to Summernote
        insertBtn.addEventListener('click', insertToEditor);

        // Keyboard shortcuts
        input.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') { e.preventDefault(); applyToolbarAction('bold'); }
                if (e.key === 'i') { e.preventDefault(); applyToolbarAction('italic'); }
                if (e.key === 'Enter') { e.preventDefault(); insertToEditor(); }
            }
        });
    }

    // Apply toolbar action
    function applyToolbarAction(action) {
        const input = document.getElementById('dc-md-input');
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        const selected = text.slice(start, end);

        const actions = {
            bold: { before: '**', after: '**', placeholder: '굵은 텍스트' },
            italic: { before: '*', after: '*', placeholder: '기울임' },
            code: { before: '`', after: '`', placeholder: '코드' },
            link: { before: '[', after: '](url)', placeholder: '링크 텍스트' },
            h1: { before: '# ', after: '', placeholder: '제목 1', newline: true },
            h2: { before: '## ', after: '', placeholder: '제목 2', newline: true },
            h3: { before: '### ', after: '', placeholder: '제목 3', newline: true },
            ul: { before: '- ', after: '', placeholder: '목록 항목', newline: true },
            ol: { before: '1. ', after: '', placeholder: '목록 항목', newline: true },
            quote: { before: '> ', after: '', placeholder: '인용문', newline: true },
            codeblock: { before: '```javascript\n', after: '\n```', placeholder: '코드' },
            mermaid: { before: '```mermaid\ngraph LR\n  A[시작] --> B[끝]\n', after: '\n```', placeholder: '' },
            table: { before: '| 열1 | 열2 | 열3 |\n|-----|-----|-----|\n| ', after: ' | 값2 | 값3 |', placeholder: '값1' }
        };

        const act = actions[action];
        if (!act) return;

        let insert = act.before + (selected || act.placeholder) + act.after;

        // Add newline before if needed
        if (act.newline && start > 0 && text[start - 1] !== '\n') {
            insert = '\n' + insert;
        }

        input.value = text.slice(0, start) + insert + text.slice(end);

        // Set cursor position
        const newPos = start + act.before.length + (act.newline && start > 0 ? 1 : 0);
        input.setSelectionRange(newPos, newPos + (selected || act.placeholder).length);
        input.focus();
    }

    // Insert converted HTML to Summernote (Smart Paste Strategy)
    async function insertToEditor() {
        const input = document.getElementById('dc-md-input');
        const container = document.querySelector('.dc-md-container');
        const md = input.value;
        const currentTheme = container?.dataset.theme || 'antigravity';

        if (!md.trim()) {
            showToast('마크다운 내용을 입력해주세요.');
            return;
        }

        // START OVERLAY ANIMATION
        showOverlay('Converting Markdown...');
        // Artificial delay for UX
        await new Promise(r => setTimeout(r, 600));

        try {
            // 1. Convert Markdown to HTML + Metadata
            // converter.js now returns { html, diagrams }
            const result = await window.DCMDConverter.convert(md, currentTheme);
            const html = result.html;
            const diagrams = result.diagrams || [];

            showOverlay('Injecting HTML...');

            // Find Summernote editor
            let editor = document.querySelector('.note-editable');
            if (!editor) editor = document.querySelector('iframe.active')?.contentDocument?.body;

            if (!editor) {
                alert('디시인사이드 에디터를 찾을 수 없습니다.');
                hideOverlay();
                return;
            }

            // 2. Insert Basic HTML
            editor.innerHTML = html;
            editor.dispatchEvent(new Event('input', { bubbles: true }));

            // 3. Process Diagrams (Smart Paste Injection)
            if (diagrams.length > 0) {
                showOverlay(`Uploading ${diagrams.length} Diagrams...`);

                // Helper to wait
                const wait = (ms) => new Promise(r => setTimeout(r, ms));

                for (let i = 0; i < diagrams.length; i++) {
                    const { id, code, type } = diagrams[i];
                    const placeholder = editor.querySelector(`#${id}`);

                    if (placeholder) {
                        try {
                            const isAscii = type === 'ascii';
                            const diagTypeLabel = isAscii ? 'ASCII Art' : 'Diagram';

                            // Update placeholder text
                            placeholder.textContent = `⏳ Uploading ${diagTypeLabel} ${i + 1}/${diagrams.length}...`;
                            placeholder.style.background = '#e6f7ff';
                            placeholder.style.color = '#007bff';

                            // Render to Blob with Timeout Safety (Phase 9 Fix)
                            const generateBlob = async () => {
                                if (isAscii) {
                                    return await window.DCMDAsciiRenderer.renderAsciiToBlob(code, currentTheme);
                                } else {
                                    return await window.DCMDMermaid.getDiagramBlob(code, { theme: currentTheme });
                                }
                            };

                            const timeoutPromise = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Rendering Timed Out')), 5000)
                            );

                            let blob;
                            try {
                                blob = await Promise.race([generateBlob(), timeoutPromise]);
                            } catch (e) {
                                throw new Error(`Rendering Failed: ${e.message}`);
                            }

                            // Focus placeholder
                            const range = document.createRange();
                            range.selectNode(placeholder);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);

                            // Auto Paste
                            const success = window.DCMDInjector.inject(blob, editor);

                            if (success) {
                                await wait(300);
                                if (placeholder.parentNode) {
                                    placeholder.remove();
                                }
                            } else {
                                placeholder.textContent = '❌ Upload Failed';
                                placeholder.style.color = 'red';
                            }

                            await wait(200);

                        } catch (err) {
                            console.error(`Diagram ${i} failed:`, err);
                            placeholder.textContent = `❌ Error: ${err.message}`;
                            placeholder.style.color = 'red';
                        }
                    }
                }
            }

            // Close overlay
            closeEditor();

            // Show success message
            showToast('✅ 작성 완료!');
        } catch (err) {
            console.error('Insert error:', err);
            alert('변환 중 오류가 발생했습니다: ' + err.message);
            updateStatus('error', 'Conversion Failed');
            hideOverlay();
        }
    }

    // Insert Filter Test Pattern
    function insertFilterTest() {
        const input = document.getElementById('dc-md-input');
        const testPattern = `
# 🧪 DCInside CSS Filter Probe
> 이 게시글은 디시인사이드 서버가 어떤 스타일을 필터링하는지 테스트하기 위한 글입니다.

---

### 1. Flexbox Test
(Should be side-by-side if flex works)
<div style="display: flex; justify-content: space-between; background: #333; padding: 10px;">
  <div style="background: red; padding: 10px;">Item A</div>
  <div style="background: blue; padding: 10px;">Item B</div>
</div>

### 2. Clamp() Typography Test
(Should be huge 40px on Desktop, smaller on Mobile)
<p style="font-size: clamp(20px, 5vw, 40px); font-weight: bold; color: orange;">
  This Text is Fluid (Clamp)
</p>

### 3. Justify Test
(Should have straight edges on both sides)
<p style="text-align: justify; word-break: keep-all; background: #222; padding: 10px;">
  이 텍스트는 양쪽 정렬(Justify) 테스트입니다. 만약 오른쪽 끝이 들쭉날쭉하다면 Justify 속성이 제거된 것입니다. 
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
</p>

### 4. Calc() Width Test
(Should be 100% minus 50px)
<div style="width: calc(100% - 50px); height: 20px; background: cyan;"></div>

### 5. Transform Test
(Should be rotated)
<div style="transform: rotate(3deg); background: purple; width: 100px; height: 50px; color: white; display:flex; align-items:center; justify-content:center;">
  Rotated
</div>
`;
        // Append to current cursor or end
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        input.value = text.slice(0, start) + testPattern + text.slice(end);
        input.focus();
    }

    // Show toast notification
    function showToast(message) {
        const existingToast = document.querySelector('.dc-md-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'dc-md-toast';
        toast.textContent = message;
        // Styles are now in CSS (.dc-md-toast)

        document.body.appendChild(toast);

        setTimeout(() => {
            // Animation handled by CSS keyframes
            toast.style.animation = 'dcMdToastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize
    init();
})();
