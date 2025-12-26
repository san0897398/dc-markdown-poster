// Mermaid Handler for DC Markdown Poster
// 프리셋 기반 렌더링 (light, dark, cyber)

(function () {
    'use strict';

    // 현재 프리셋 (기본: dark)
    let currentPreset = 'dark';

    // 프리셋 정의 (mermaid-ascii.js와 동기화)
    const PRESETS = {
        light: { theme: 'light', effect: 'none', label: '라이트' },
        dark: { theme: 'dark', effect: 'scanline', label: '다크' },
        cyber: { theme: 'cyber', effect: 'terminal', label: '사이버' }
    };

    /**
     * 프리셋 설정
     */
    function setPreset(presetName) {
        if (PRESETS[presetName]) {
            currentPreset = presetName;
            console.log('[Mermaid] Preset:', presetName);
        }
    }

    /**
     * 현재 프리셋 반환
     */
    function getPreset() {
        return currentPreset;
    }

    /**
     * 프리셋 목록 반환
     */
    function getPresets() {
        return PRESETS;
    }

    /**
     * Mermaid 코드를 렌더링
     */
    async function renderToUrl(code) {
        const trimmedCode = code.trim();

        try {
            if (typeof MermaidASCII !== 'undefined') {
                const preset = PRESETS[currentPreset] || PRESETS.dark;
                const html = MermaidASCII.renderForDC(
                    trimmedCode,
                    preset.theme,
                    'unicode',
                    preset.effect
                );
                return html;
            }

            // Fallback
            return renderFallback(trimmedCode);

        } catch (error) {
            console.error('[Mermaid] Render error:', error);
            return renderFallback(trimmedCode);
        }
    }

    /**
     * Fallback: 코드 블록
     */
    function renderFallback(code) {
        const escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `<pre style="font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; border-left: 3px solid #58a6ff; overflow-x: auto;"><code>${escaped}</code></pre>`;
    }

    // Export
    window.DCMDMermaid = {
        renderToUrl,
        render: renderToUrl,
        setPreset,
        getPreset,
        getPresets,
        PRESETS
    };

    console.log('[DC-MD] Mermaid handler loaded - Preset:', currentPreset);
})();
