# DC Markdown Poster 디버깅 인계 보고서

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | DC Markdown Poster |
| 목적 | 디시인사이드에서 마크다운 + Mermaid 다이어그램 게시 |
| 타입 | Chrome Extension (Manifest v3) |
| 경로 | `/Users/san/Downloads/dc-markdown-poster-f0ec69750a7f028605112070b7ba01a2496153b5` |

---

## 현재 상태: 동작 안 함

### 증상
- Mermaid 다이어그램 렌더링 시 아무것도 출력 안 됨
- 디버깅 로그도 출력 안 됨
- 에러 메시지 없음

### 예상 동작
1. 마크다운 에디터에서 ```mermaid 블록 입력
2. mermaid.ink URL 생성 (Pako 압축 + Base64)
3. background.js가 이미지 fetch → Catbox.moe 업로드
4. `<img src="https://files.catbox.moe/xxx.png">` 반환
5. DC 에디터에 이미지 삽입

---

## 파일 구조

```
dc-markdown-poster-f0ec69750a7f028605112070b7ba01a2496153b5/
├── manifest.json                 # Chrome 확장 설정 (Manifest v3)
├── background.js                 # Service Worker (Catbox 업로드)
├── popup/
│   ├── popup.html
│   └── popup.js
├── content/
│   └── content.js                # 에디터 UI, 이벤트 핸들링
├── utils/
│   ├── mermaid-handler.js        # ★ 핵심: Mermaid → URL 변환
│   ├── converter.js              # 마크다운 → HTML 변환
│   └── style-injector.js
├── lib/
│   ├── pako.min.js               # 압축 라이브러리
│   ├── marked.min.js             # 마크다운 파서
│   ├── highlight.min.js          # 구문 강조
│   └── mermaid.min.js            # (사용 안 함, 레거시)
├── editor/
│   └── editor.css
└── assets/icons/
```

---

## 핵심 파일 분석

### 1. mermaid-handler.js (utils/)

**역할**: Mermaid 코드 → 이미지 URL 변환

**주요 함수**:
```javascript
encodeMermaid(code)        // Pako 압축 + Base64 인코딩
getMermaidInkUrl(code)     // https://mermaid.ink/img/pako:{encoded} 생성
sendToBackground(url)      // chrome.runtime.sendMessage로 background에 요청
fetchAndUpload(code)       // mermaid.ink fetch → Catbox 업로드
renderMermaid(code)        // 최종 <img> 태그 반환 (async)
```

**의존성**:
- `pako` 전역 객체 (lib/pako.min.js)
- `chrome.runtime.sendMessage` (background.js와 통신)

**export**:
```javascript
window.DCMDMermaid = { renderMermaid, renderToUrl: renderMermaid, ... }
```

### 2. background.js

**역할**: Service Worker - cross-origin 요청 처리

**메시지 핸들러**:
```javascript
'FETCH_AND_UPLOAD'  → handleFetchAndUpload(mermaidUrl)
'UPLOAD_TO_CATBOX'  → handleUploadBlob(dataUrl)
'REHOST_TO_CATBOX'  → rehostToCatbox(imageUrl)
```

**Catbox API**:
```javascript
POST https://catbox.moe/user/api.php
- reqtype: 'fileupload' (Blob 업로드)
- reqtype: 'urlupload' (URL 재호스팅)
```

### 3. converter.js (utils/)

**역할**: 마크다운 → HTML 변환, Mermaid 블록 처리

**Mermaid 호출 부분** (라인 202-213):
```javascript
for (let i = 0; i < mermaidBlocks.length; i++) {
    const imgHtml = await window.DCMDMermaid.renderToUrl(mermaidBlocks[i]);
    html = html.replace(`%%MERMAID_${i}%%`, imgHtml);
}
```

### 4. manifest.json

**권한**:
```json
"permissions": ["activeTab", "storage"],
"host_permissions": [
    "https://gall.dcinside.com/*",
    "https://mermaid.ink/*",
    "https://catbox.moe/*",
    "https://files.catbox.moe/*"
]
```

**로드 순서** (content_scripts):
```
pako.min.js → marked.min.js → highlight.min.js
→ mermaid-handler.js → converter.js → style-injector.js → content.js
```

---

## 문제 추정 원인

### 1. Service Worker 비활성화
Manifest v3의 Service Worker는 유휴 시 자동 종료됨.
- 메시지 전송 시 Worker가 깨어나지 않을 수 있음
- `chrome.runtime.sendMessage` 응답이 없을 수 있음

### 2. Pako 로드 실패
`lib/pako.min.js`가 content script보다 먼저 로드되어야 함.
- 로드 순서 문제 가능성
- `typeof pako === 'undefined'` 체크 필요

### 3. 비동기 처리 문제
`renderMermaid()`가 async 함수인데 호출 체인에서 await 누락 가능성.

### 4. 콘솔 로그 위치
- content script 로그 → 페이지 DevTools Console
- Service Worker 로그 → 별도 DevTools (chrome://extensions에서 "서비스 워커" 클릭)

---

## 디버깅 방법

### Step 1: 라이브러리 로드 확인
DC 글쓰기 페이지 (https://gall.dcinside.com/board/write/?id=...) 에서:

```javascript
// F12 → Console
console.log('pako:', typeof pako);
console.log('DCMDMermaid:', typeof DCMDMermaid);
console.log('DCMDConverter:', typeof DCMDConverter);
```

**예상 결과**: 모두 'object' 또는 'function'

### Step 2: URL 생성 테스트 (오프라인)
```javascript
// mermaid.ink URL 생성 (네트워크 요청 없음)
const url = DCMDMermaid.getDirectUrl('graph TD\nA-->B');
console.log('URL:', url);
console.log('Length:', url.length);
```

**예상 결과**: `https://mermaid.ink/img/pako:...` 형태 URL

### Step 3: Background 통신 테스트
```javascript
chrome.runtime.sendMessage(
    {type: 'FETCH_AND_UPLOAD', mermaidUrl: 'https://mermaid.ink/img/pako:eNpLy...'},
    response => console.log('Response:', response)
);
```

**예상 결과**: `{success: true, url: 'https://files.catbox.moe/xxx.png'}`

### Step 4: Service Worker 로그 확인
1. `chrome://extensions` 열기
2. DC Markdown Poster 찾기
3. "서비스 워커" 링크 클릭
4. 열린 DevTools에서 Console 확인

### Step 5: 전체 플로우 테스트
```javascript
// 전체 렌더링 테스트
(async () => {
    try {
        const result = await DCMDMermaid.renderMermaid('graph TD\nA-->B');
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    }
})();
```

---

## 필요한 정보

디버깅 시 다음 정보 수집 필요:

| 항목 | 확인 방법 |
|------|----------|
| Chrome 버전 | `chrome://version` |
| 확장 로드 상태 | `chrome://extensions` → 오류 표시 여부 |
| pako 로드 여부 | `typeof pako` |
| DCMDMermaid 존재 | `typeof DCMDMermaid` |
| URL 생성 결과 | `DCMDMermaid.getDirectUrl(...)` |
| Service Worker 상태 | chrome://extensions → "서비스 워커" 활성 여부 |
| Network 탭 | mermaid.ink, catbox.moe 요청 상태 |
| Console 에러 | content script + Service Worker 양쪽 |

---

## 대안 접근법

### A. Service Worker 없이 직접 URL 사용
mermaid.ink URL을 직접 `<img src>`에 사용 (Catbox 업로드 생략)

```javascript
// mermaid-handler.js 수정
async function renderMermaid(code) {
    const url = getMermaidInkUrl(code);
    // background 통신 없이 직접 반환
    return `<img src="${url}" style="max-width:100%;">`;
}
```

**장점**: Service Worker 의존성 제거
**단점**: URL 길이 제한 (~2000자), mermaid.ink 불안정 시 실패

### B. Offscreen Document 사용 (Manifest v3)
Service Worker 대신 Offscreen API 사용

### C. 모바일 대응 포기
ASCII 렌더링 버전 (복사본 2)으로 데스크톱만 지원

---

## 관련 파일 전체 경로

```
/Users/san/Downloads/dc-markdown-poster-f0ec69750a7f028605112070b7ba01a2496153b5/
├── manifest.json
├── background.js
├── content/content.js
├── utils/mermaid-handler.js      ★ 핵심
├── utils/converter.js            ★ 핵심
├── utils/style-injector.js
├── lib/pako.min.js
├── lib/marked.min.js
├── lib/highlight.min.js
├── popup/popup.html
├── popup/popup.js
└── editor/editor.css
```

---

## 테스트 환경

- **타겟 사이트**: https://gall.dcinside.com/board/write/?id=programming (또는 다른 갤러리)
- **필요 권한**: 확장 프로그램 개발자 모드
- **디버깅 도구**: Chrome DevTools (페이지 + Service Worker)

---

## 요약

| 구분 | 내용 |
|------|------|
| **문제** | Mermaid 렌더링 무반응, 로그 없음 |
| **핵심 파일** | `mermaid-handler.js`, `background.js` |
| **의존성** | pako, chrome.runtime API |
| **추정 원인** | Service Worker 비활성화 또는 메시지 통신 실패 |
| **디버깅 순서** | 라이브러리 로드 → URL 생성 → background 통신 → 전체 플로우 |
| **대안** | mermaid.ink 직접 URL 사용 (Service Worker 우회) |

---

**작성일**: 2025-12-27
**인계 대상**: 다른 AI 또는 개발자
