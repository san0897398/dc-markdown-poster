// Content script for DC Markdown Poster
// Injected into DCInside write pages

(function () {
    'use strict';

    let editorOverlay = null;
    let isEditorOpen = false;
    let currentStyle = 'dark';  // 기본 스타일

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
        <div class="dc-md-header">
          <h2>📝 DC Markdown Poster</h2>
          <div class="dc-md-header-actions">
            <button class="dc-md-btn-secondary" id="dc-md-preview-toggle">미리보기</button>
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
            </div>
            <textarea id="dc-md-input" placeholder="여기에 마크다운을 입력하세요...

# 제목

**굵은 텍스트** 와 *기울임*

## 코드 블록
\`\`\`javascript
console.log('Hello!');
\`\`\`

## Mermaid 다이어그램
\`\`\`mermaid
graph LR
  A[시작] --> B[처리] --> C[끝]
\`\`\`
"></textarea>
          </div>
          
          <div class="dc-md-preview-pane" id="dc-md-preview">
            <div class="dc-md-preview-content">
              <p style="color: #888; text-align: center; margin-top: 40px;">마크다운을 입력하면 여기에 미리보기가 표시됩니다</p>
            </div>
          </div>
        </div>
        
        <div class="dc-md-footer">
          <div class="dc-md-footer-info">
            <span id="dc-md-char-count">0자</span>
            <div class="dc-md-style-selector">
              <span style="color: #888; margin-right: 8px;">스타일:</span>
              <button class="dc-md-style-btn" data-style="light" title="라이트">☀️</button>
              <button class="dc-md-style-btn active" data-style="dark" title="다크 (기본)">🌙</button>
              <button class="dc-md-style-btn" data-style="cyber" title="사이버">💠</button>
            </div>
          </div>
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

        // Initial render
        updatePreview();
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
        const previewToggle = document.getElementById('dc-md-preview-toggle');
        const previewPane = document.getElementById('dc-md-preview');
        const charCount = document.getElementById('dc-md-char-count');

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
            updatePreview();
        });

        // Preview toggle
        let previewVisible = true;
        previewToggle.addEventListener('click', () => {
            previewVisible = !previewVisible;
            previewPane.style.display = previewVisible ? 'block' : 'none';
            previewToggle.textContent = previewVisible ? '미리보기' : '미리보기 표시';
        });

        // Live preview
        input.addEventListener('input', () => {
            charCount.textContent = input.value.length + '자';
            updatePreview();
        });

        // Toolbar actions
        document.querySelectorAll('.dc-md-toolbar button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                applyToolbarAction(action);
            });
        });

        // Insert to Summernote
        insertBtn.addEventListener('click', insertToEditor);

        // Style selector buttons
        document.querySelectorAll('.dc-md-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.dc-md-style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentStyle = btn.dataset.style;
                // mermaid-handler에 프리셋 전달
                if (typeof DCMDMermaid !== 'undefined') {
                    DCMDMermaid.setPreset(currentStyle);
                }
                updatePreview();
            });
        });

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

        updatePreview();
    }

    // Update preview
    async function updatePreview() {
        const input = document.getElementById('dc-md-input');
        const preview = document.querySelector('.dc-md-preview-content');

        if (!input || !preview) return;

        const md = input.value;
        if (!md.trim()) {
            preview.innerHTML = '<p style="color: #888; text-align: center; margin-top: 40px;">마크다운을 입력하면 여기에 미리보기가 표시됩니다</p>';
            return;
        }

        try {
            const html = await window.DCMDConverter.convert(md);
            preview.innerHTML = html;
        } catch (err) {
            console.error('Preview error:', err);
            preview.innerHTML = '<p style="color: #ff5555;">변환 중 오류가 발생했습니다</p>';
        }
    }

    // Insert converted HTML to Summernote
    async function insertToEditor() {
        const input = document.getElementById('dc-md-input');
        const md = input.value;

        if (!md.trim()) {
            alert('마크다운 내용을 입력해주세요.');
            return;
        }

        try {
            const html = await window.DCMDConverter.convert(md);

            // Find Summernote editor
            const editor = document.querySelector('.note-editable');
            if (!editor) {
                alert('디시인사이드 에디터를 찾을 수 없습니다.');
                return;
            }

            // Insert HTML
            editor.innerHTML = html;
            editor.dispatchEvent(new Event('input', { bubbles: true }));

            // Close overlay
            closeEditor();

            // Show success message
            showToast('✅ 마크다운이 삽입되었습니다!');
        } catch (err) {
            console.error('Insert error:', err);
            alert('변환 중 오류가 발생했습니다: ' + err.message);
        }
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'dc-md-toast';
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 999999;
      padding: 12px 20px;
      background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: dcMdToastIn 0.3s ease;
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'dcMdToastOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Initialize
    init();
})();
