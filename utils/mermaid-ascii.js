// =============================================================================
// Mermaid to Beautiful Unicode Text Renderer v6
// Grid Layout Engine + WCAG AAA 가시성 테마
// =============================================================================

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // 테마별 문자셋 (Character Sets by Theme)
    // ═══════════════════════════════════════════════════════════════════════════

    const CHAR_SETS = {
        unicode: {
            name: 'Unicode',
            D_TL: '╔', D_TR: '╗', D_BL: '╚', D_BR: '╝', D_H: '═', D_V: '║',
            R_TL: '╭', R_TR: '╮', R_BL: '╰', R_BR: '╯', R_H: '─', R_V: '│',
            S_TL: '┌', S_TR: '┐', S_BL: '└', S_BR: '┘', S_H: '─', S_V: '│',
            // Heavy 라인 (시작/끝 노드용)
            H_TL: '┏', H_TR: '┓', H_BL: '┗', H_BR: '┛', H_H: '━', H_V: '┃',
            H_T_RIGHT: '┣', H_T_LEFT: '┫', H_T_DOWN: '┳', H_T_UP: '┻',
            AR_R: '▶', AR_L: '◀', AR_U: '▲', AR_D: '▼',
            AR_R_THIN: '→', AR_L_THIN: '←', AR_U_THIN: '↑', AR_D_THIN: '↓',
            LINE: '─', LINE_BOLD: '═', DASH: '╌', DOT: '┄',
            VLINE: '│', VLINE_BOLD: '║', VDASH: '┆',
            DIA: '◇', DIA_FILL: '◆',
            BULLET: '●', CIRCLE: '○', STAR: '★', CHECK: '✓',
            L_ANG: '❮', R_ANG: '❯',
            T_RIGHT: '├', T_LEFT: '┤', T_DOWN: '┬', T_UP: '┴', CROSS: '┼',
            CORNER_DR: '╭', CORNER_DL: '╮', CORNER_UR: '╰', CORNER_UL: '╯'
        },
        ascii: {
            name: 'ASCII',
            D_TL: '+', D_TR: '+', D_BL: '+', D_BR: '+', D_H: '=', D_V: '|',
            R_TL: '+', R_TR: '+', R_BL: '+', R_BR: '+', R_H: '-', R_V: '|',
            S_TL: '+', S_TR: '+', S_BL: '+', S_BR: '+', S_H: '-', S_V: '|',
            // Heavy 라인 (ASCII에서는 동일 문자 사용)
            H_TL: '#', H_TR: '#', H_BL: '#', H_BR: '#', H_H: '=', H_V: '#',
            H_T_RIGHT: '#', H_T_LEFT: '#', H_T_DOWN: '#', H_T_UP: '#',
            AR_R: '>', AR_L: '<', AR_U: '^', AR_D: 'v',
            AR_R_THIN: '>', AR_L_THIN: '<', AR_U_THIN: '^', AR_D_THIN: 'v',
            LINE: '-', LINE_BOLD: '=', DASH: '-', DOT: '.',
            VLINE: '|', VLINE_BOLD: '|', VDASH: ':',
            DIA: '<>', DIA_FILL: '<>',
            BULLET: '*', CIRCLE: 'o', STAR: '*', CHECK: 'v',
            L_ANG: '<', R_ANG: '>',
            T_RIGHT: '+', T_LEFT: '+', T_DOWN: '+', T_UP: '+', CROSS: '+',
            CORNER_DR: '+', CORNER_DL: '+', CORNER_UR: '+', CORNER_UL: '+'
        },
        cyber: {
            name: 'Cyber',
            D_TL: '⟦', D_TR: '⟧', D_BL: '⟦', D_BR: '⟧', D_H: '═', D_V: '║',
            R_TL: '┌', R_TR: '┐', R_BL: '└', R_BR: '┘', R_H: '─', R_V: '│',
            S_TL: '┌', S_TR: '┐', S_BL: '└', S_BR: '┘', S_H: '─', S_V: '│',
            // Heavy 라인 (Cyber 테마용)
            H_TL: '┏', H_TR: '┓', H_BL: '┗', H_BR: '┛', H_H: '━', H_V: '┃',
            H_T_RIGHT: '┣', H_T_LEFT: '┫', H_T_DOWN: '┳', H_T_UP: '┻',
            AR_R: '⟹', AR_L: '⟸', AR_U: '⟰', AR_D: '⟱',
            AR_R_THIN: '⟶', AR_L_THIN: '⟵', AR_U_THIN: '↑', AR_D_THIN: '↓',
            LINE: '─', LINE_BOLD: '━', DASH: '╌', DOT: '┄',
            VLINE: '│', VLINE_BOLD: '┃', VDASH: '┆',
            DIA: '◇', DIA_FILL: '◈',
            BULLET: '◉', CIRCLE: '◎', STAR: '✦', CHECK: '✔',
            L_ANG: '《', R_ANG: '》',
            T_RIGHT: '├', T_LEFT: '┤', T_DOWN: '┬', T_UP: '┴', CROSS: '┼',
            CORNER_DR: '┌', CORNER_DL: '┐', CORNER_UR: '└', CORNER_UL: '┘'
        },
        block: {
            name: 'Block',
            D_TL: '█', D_TR: '█', D_BL: '█', D_BR: '█', D_H: '▀', D_V: '█',
            R_TL: '▛', R_TR: '▜', R_BL: '▙', R_BR: '▟', R_H: '▀', R_V: '▌',
            S_TL: '┌', S_TR: '┐', S_BL: '└', S_BR: '┘', S_H: '─', S_V: '│',
            // Heavy 라인 (Block 테마용)
            H_TL: '┏', H_TR: '┓', H_BL: '┗', H_BR: '┛', H_H: '━', H_V: '┃',
            H_T_RIGHT: '┣', H_T_LEFT: '┫', H_T_DOWN: '┳', H_T_UP: '┻',
            AR_R: '▶', AR_L: '◀', AR_U: '▲', AR_D: '▼',
            AR_R_THIN: '►', AR_L_THIN: '◄', AR_U_THIN: '▲', AR_D_THIN: '▼',
            LINE: '─', LINE_BOLD: '━', DASH: '┄', DOT: '┈',
            VLINE: '│', VLINE_BOLD: '┃', VDASH: '┆',
            DIA: '◇', DIA_FILL: '◆',
            BULLET: '■', CIRCLE: '□', STAR: '★', CHECK: '✓',
            L_ANG: '◀', R_ANG: '▶',
            T_RIGHT: '├', T_LEFT: '┤', T_DOWN: '┬', T_UP: '┴', CROSS: '┼',
            CORNER_DR: '┌', CORNER_DL: '┐', CORNER_UR: '└', CORNER_UL: '┘'
        }
    };

    // Unicode 테마 기본 사용 (시각적 위계 표현)
    let currentCharSet = 'unicode';
    function getChars() {
        return CHAR_SETS[currentCharSet] || CHAR_SETS.unicode;
    }

    // 테마 설정 함수
    function setCharSet(theme) {
        if (CHAR_SETS[theme]) {
            currentCharSet = theme;
        }
    }

    // chrome.storage에서 테마 로드 (확장 프로그램 환경일 때만)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['diagramTheme'], (result) => {
            if (result.diagramTheme && CHAR_SETS[result.diagramTheme]) {
                currentCharSet = result.diagramTheme;
            }
        });

        // 테마 변경 메시지 리스너
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'setTheme' && message.theme) {
                setCharSet(message.theme);
                sendResponse({ success: true });
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 유틸리티 함수
    // ═══════════════════════════════════════════════════════════════════════════

    function strWidth(str) {
        let w = 0;
        for (const char of str) {
            const code = char.charCodeAt(0);
            if ((code >= 0x1100 && code <= 0x11FF) ||
                (code >= 0x3000 && code <= 0x9FFF) ||
                (code >= 0xAC00 && code <= 0xD7AF) ||
                (code >= 0xF900 && code <= 0xFAFF) ||
                (code >= 0xFF00 && code <= 0xFFEF)) {
                w += 2;
            } else {
                w += 1;
            }
        }
        return w;
    }

    function padCenter(str, width) {
        const sw = strWidth(str);
        if (sw >= width) return str;
        const left = Math.floor((width - sw) / 2);
        const right = width - sw - left;
        return ' '.repeat(left) + str + ' '.repeat(right);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Grid Layout Engine (분기/병합 시각화)
    // ═══════════════════════════════════════════════════════════════════════════

    const GridLayoutEngine = {
        /**
         * 노드들을 레이어에 할당 (Longest Path 알고리즘)
         */
        assignLayers(nodes, edges) {
            const nodeMap = new Map(nodes.map(n => [n.id, n]));
            const inEdges = new Map();
            const outEdges = new Map();

            nodes.forEach(n => {
                inEdges.set(n.id, []);
                outEdges.set(n.id, []);
            });

            edges.forEach(e => {
                if (nodeMap.has(e.from) && nodeMap.has(e.to)) {
                    outEdges.get(e.from).push(e.to);
                    inEdges.get(e.to).push(e.from);
                }
            });

            // 시작 노드 찾기 (진입 차수 0)
            const startNodes = nodes.filter(n => inEdges.get(n.id).length === 0);
            if (startNodes.length === 0 && nodes.length > 0) {
                startNodes.push(nodes[0]); // fallback
            }

            // BFS로 레이어 할당
            const layers = new Map();
            const visited = new Set();
            const queue = startNodes.map(n => ({ id: n.id, layer: 0 }));

            while (queue.length > 0) {
                const { id, layer } = queue.shift();

                if (visited.has(id)) {
                    // 이미 방문한 노드는 더 깊은 레이어로 갱신
                    if (layers.get(id) < layer) {
                        layers.set(id, layer);
                    }
                    continue;
                }

                visited.add(id);
                layers.set(id, layer);

                outEdges.get(id).forEach(toId => {
                    queue.push({ id: toId, layer: layer + 1 });
                });
            }

            // 방문하지 않은 노드 처리
            nodes.forEach(n => {
                if (!layers.has(n.id)) {
                    layers.set(n.id, 0);
                }
            });

            return layers;
        },

        /**
         * 레이어별 노드 그룹화
         */
        groupByLayer(nodes, layerMap) {
            const groups = new Map();

            nodes.forEach(n => {
                const layer = layerMap.get(n.id) || 0;
                if (!groups.has(layer)) {
                    groups.set(layer, []);
                }
                groups.get(layer).push(n);
            });

            // 레이어 순서대로 정렬
            const sortedLayers = Array.from(groups.keys()).sort((a, b) => a - b);
            return sortedLayers.map(layer => groups.get(layer));
        },

        /**
         * 분기 구조 감지
         */
        detectBranching(nodes, edges) {
            const outDegree = new Map();
            const inDegree = new Map();

            nodes.forEach(n => {
                outDegree.set(n.id, 0);
                inDegree.set(n.id, 0);
            });

            edges.forEach(e => {
                outDegree.set(e.from, (outDegree.get(e.from) || 0) + 1);
                inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
            });

            const branchPoints = nodes.filter(n => outDegree.get(n.id) > 1);
            const mergePoints = nodes.filter(n => inDegree.get(n.id) > 1);

            return {
                hasBranching: branchPoints.length > 0 || mergePoints.length > 0,
                branchPoints,
                mergePoints,
                outDegree,
                inDegree
            };
        },

        /**
         * Grid 좌표 계산
         */
        calculateGridPositions(layerGroups, direction) {
            const positions = new Map();
            const isHorizontal = direction === 'LR' || direction === 'RL';

            layerGroups.forEach((layer, layerIdx) => {
                layer.forEach((node, nodeIdx) => {
                    if (isHorizontal) {
                        positions.set(node.id, { col: layerIdx, row: nodeIdx });
                    } else {
                        positions.set(node.id, { row: layerIdx, col: nodeIdx });
                    }
                });
            });

            return positions;
        },

        /**
         * Grid 크기 계산
         */
        getGridSize(layerGroups, direction) {
            const isHorizontal = direction === 'LR' || direction === 'RL';
            const maxNodesInLayer = Math.max(...layerGroups.map(l => l.length));

            if (isHorizontal) {
                return { cols: layerGroups.length, rows: maxNodesInLayer };
            } else {
                return { rows: layerGroups.length, cols: maxNodesInLayer };
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Renderer Registry
    // ═══════════════════════════════════════════════════════════════════════════

    const RendererRegistry = {
        renderers: new Map(),

        register(type, renderer) {
            if (!renderer.detect || !renderer.parse || !renderer.render) {
                throw new Error(`Renderer '${type}' must have detect, parse, render methods`);
            }
            this.renderers.set(type, renderer);
        },

        detectType(code) {
            for (const [type, renderer] of this.renderers) {
                if (renderer.detect(code)) return type;
            }
            return 'flowchart';
        },

        render(code) {
            const type = this.detectType(code);
            const renderer = this.renderers.get(type);
            if (!renderer) return `[${type} 다이어그램 - 렌더러 미등록]\n\n${code}`;

            try {
                const parsed = renderer.parse(code);
                return renderer.render(parsed);
            } catch (e) {
                console.error(`[MermaidASCII] ${type} render error:`, e);
                return `[렌더링 오류: ${e.message}]\n\n${code}`;
            }
        },

        getRegisteredTypes() {
            return Array.from(this.renderers.keys());
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // FlowchartRenderer with Grid Layout
    // ═══════════════════════════════════════════════════════════════════════════

    const FlowchartRenderer = {
        name: 'Flowchart',

        detect(code) {
            const firstLine = code.trim().split('\n')[0].toLowerCase();
            return firstLine.includes('graph') || firstLine.includes('flowchart');
        },

        parse(code) {
            const lines = code.split('\n').map(l => l.trim()).filter(l => l);
            let direction = 'LR';
            const nodes = new Map();
            const edges = [];
            const warnings = [];

            for (const line of lines) {
                const dirMatch = line.match(/^(?:graph|flowchart)\s+(LR|RL|TB|BT|TD)/i);
                if (dirMatch) {
                    direction = dirMatch[1].toUpperCase();
                    if (direction === 'TD') direction = 'TB';
                    continue;
                }

                if (/^subgraph\b/i.test(line)) {
                    warnings.push(`⚠ subgraph 미지원: ${line.substring(0, 30)}...`);
                    continue;
                }
                if (/^(style|classDef|class)\b/i.test(line)) {
                    warnings.push(`⚠ 스타일 미지원: ${line.substring(0, 30)}...`);
                    continue;
                }
                if (/^end\b/i.test(line)) continue;

                const edgeMatch = line.match(/(\w+)(?:\[([^\]]*)\]|\{([^}]*)\}|\(([^)]*)\))?\s*(-->|--[->]|-.->|==>)\s*(?:\|([^|]*)\|)?\s*(\w+)(?:\[([^\]]*)\]|\{([^}]*)\}|\(([^)]*)\))?/);
                if (edgeMatch) {
                    const [, fromId, fromBox, fromDia, fromRound, arrow, label, toId, toBox, toDia, toRound] = edgeMatch;

                    if (!nodes.has(fromId)) {
                        nodes.set(fromId, {
                            id: fromId,
                            label: fromBox || fromDia || fromRound || fromId,
                            shape: fromDia ? 'diamond' : (fromRound ? 'round' : 'box')
                        });
                    }
                    if (!nodes.has(toId)) {
                        nodes.set(toId, {
                            id: toId,
                            label: toBox || toDia || toRound || toId,
                            shape: toDia ? 'diamond' : (toRound ? 'round' : 'box')
                        });
                    }

                    edges.push({ from: fromId, to: toId, label: label?.trim() || '', arrow });
                    continue;
                }

                const nodeMatch = line.match(/^(\w+)(?:\[([^\]]*)\]|\{([^}]*)\}|\(([^)]*)\))/);
                if (nodeMatch) {
                    const [, id, boxLabel, diaLabel, roundLabel] = nodeMatch;
                    if (!nodes.has(id)) {
                        nodes.set(id, {
                            id,
                            label: boxLabel || diaLabel || roundLabel || id,
                            shape: diaLabel ? 'diamond' : (roundLabel ? 'round' : 'box')
                        });
                    }
                    continue;
                }

                if (line && !line.startsWith('%%')) {
                    warnings.push(`⚠ 인식 불가: ${line.substring(0, 40)}${line.length > 40 ? '...' : ''}`);
                }
            }

            return { direction, nodes: Array.from(nodes.values()), edges, warnings };
        },

        render(parsed) {
            const { direction, nodes, edges } = parsed;
            const branching = GridLayoutEngine.detectBranching(nodes, edges);

            // 분기가 있으면 Grid 레이아웃 사용
            if (branching.hasBranching) {
                if (direction === 'TB' || direction === 'BT') {
                    return this.renderGridVertical(parsed);
                }
                return this.renderGridHorizontal(parsed);
            }

            // 분기가 없으면 기존 선형 레이아웃
            if (direction === 'TB' || direction === 'BT') {
                return this.renderLinearVertical(parsed);
            }
            return this.renderLinearHorizontal(parsed);
        },

        renderNode(node, chars) {
            const label = node.label;

            // ═══════════════════════════════════════════════════════════════
            // 조건 노드 (다이아몬드) - 독특한 형태
            // ═══════════════════════════════════════════════════════════════
            if (node.shape === 'diamond') {
                const padding = 2;
                const innerWidth = strWidth(label) + padding * 2;
                const width = Math.max(innerWidth, 10);
                const inner = padCenter(label, width);
                return [
                    '',
                    '   ' + chars.DIA_FILL + '   ',
                    ' ╱' + ' '.repeat(width) + '╲ ',
                    chars.L_ANG + ' ' + inner + ' ' + chars.R_ANG,
                    ' ╲' + ' '.repeat(width) + '╱ ',
                    '   ' + chars.DIA_FILL + '   ',
                    ''
                ];
            }

            // ═══════════════════════════════════════════════════════════════
            // 시작 노드 - 크고 굵은 이중선 박스 (╔═══════════════════╗)
            // ═══════════════════════════════════════════════════════════════
            if (node.isStart) {
                const padding = 4;  // 더 큰 패딩
                const iconLabel = chars.BULLET + '  ' + label;
                const innerWidth = strWidth(iconLabel) + padding * 2;
                const width = Math.max(innerWidth, 16);  // 더 큰 최소 너비
                const inner = padCenter(iconLabel, width);
                const emptyLine = ' '.repeat(width);
                return [
                    '',
                    chars.D_TL + chars.D_H.repeat(width) + chars.D_TR,
                    chars.D_V + emptyLine + chars.D_V,
                    chars.D_V + inner + chars.D_V,
                    chars.D_V + emptyLine + chars.D_V,
                    chars.D_BL + chars.D_H.repeat(width) + chars.D_BR,
                    ''
                ];
            }

            // ═══════════════════════════════════════════════════════════════
            // 끝 노드 - 크고 굵은 이중선 박스 (╔═══════════════════╗)
            // ═══════════════════════════════════════════════════════════════
            if (node.isEnd) {
                const padding = 4;
                const iconLabel = label + '  ' + chars.CHECK;
                const innerWidth = strWidth(iconLabel) + padding * 2;
                const width = Math.max(innerWidth, 16);
                const inner = padCenter(iconLabel, width);
                const emptyLine = ' '.repeat(width);
                return [
                    '',
                    chars.D_TL + chars.D_H.repeat(width) + chars.D_TR,
                    chars.D_V + emptyLine + chars.D_V,
                    chars.D_V + inner + chars.D_V,
                    chars.D_V + emptyLine + chars.D_V,
                    chars.D_BL + chars.D_H.repeat(width) + chars.D_BR,
                    ''
                ];
            }

            // ═══════════════════════════════════════════════════════════════
            // 일반 노드 - 작고 가벼운 라운드 박스 (╭───────╮)
            // ═══════════════════════════════════════════════════════════════
            const padding = 2;  // 작은 패딩
            const innerWidth = strWidth(label) + padding * 2;
            const width = Math.max(innerWidth, 8);  // 작은 최소 너비
            const inner = padCenter(label, width);
            return [
                chars.R_TL + chars.R_H.repeat(width) + chars.R_TR,
                chars.R_V + inner + chars.R_V,
                chars.R_BL + chars.R_H.repeat(width) + chars.R_BR
            ];
        },

        // ─────────────────────────────────────────────────────────────────────
        // Grid Layout (분기/병합 시각화)
        // ─────────────────────────────────────────────────────────────────────

        renderGridHorizontal(parsed) {
            const { nodes, edges, warnings = [] } = parsed;
            const chars = getChars();

            if (nodes.length === 0) return '(빈 다이어그램)';

            // 레이어 할당
            const layerMap = GridLayoutEngine.assignLayers(nodes, edges);
            const layerGroups = GridLayoutEngine.groupByLayer(nodes, layerMap);
            const gridSize = GridLayoutEngine.getGridSize(layerGroups, 'LR');
            const positions = GridLayoutEngine.calculateGridPositions(layerGroups, 'LR');

            // 시작/끝 노드 마킹
            const startNodes = nodes.filter(n => {
                return !edges.some(e => e.to === n.id);
            });
            const endNodes = nodes.filter(n => {
                return !edges.some(e => e.from === n.id);
            });
            startNodes.forEach(n => n.isStart = true);
            endNodes.forEach(n => n.isEnd = true);

            // 노드 렌더링
            const renderedNodes = new Map();
            let maxNodeHeight = 0;
            let maxNodeWidth = 0;
            nodes.forEach(n => {
                const box = this.renderNode(n, chars);
                renderedNodes.set(n.id, box);
                maxNodeHeight = Math.max(maxNodeHeight, box.length);
                maxNodeWidth = Math.max(maxNodeWidth, strWidth(box[0]));
            });

            // 셀 크기 계산 (여백 증가)
            const cellWidth = maxNodeWidth + 12;  // 노드 + 화살표 공간 (+8 → +12)
            const cellHeight = maxNodeHeight + 4; // 노드 + 수직 연결선 (+2 → +4)

            // 캔버스 생성
            const canvasWidth = gridSize.cols * cellWidth;
            const canvasHeight = gridSize.rows * cellHeight;
            const canvas = Array(canvasHeight).fill(null).map(() =>
                Array(canvasWidth).fill(' ')
            );

            // 노드 배치
            const nodePositions = new Map(); // 노드 중심 좌표 저장
            nodes.forEach(n => {
                const pos = positions.get(n.id);
                const box = renderedNodes.get(n.id);
                const boxWidth = strWidth(box[0]);
                const boxHeight = box.length;

                // 셀 내 중앙 배치
                const cellStartX = pos.col * cellWidth;
                const cellStartY = pos.row * cellHeight;
                const offsetX = Math.floor((cellWidth - boxWidth) / 2);
                const offsetY = Math.floor((cellHeight - boxHeight) / 2);
                const startX = cellStartX + offsetX;
                const startY = cellStartY + offsetY;

                // 노드 중심 좌표 저장
                nodePositions.set(n.id, {
                    centerX: cellStartX + Math.floor(cellWidth / 2),
                    centerY: cellStartY + Math.floor(cellHeight / 2),
                    right: startX + boxWidth,
                    left: startX,
                    top: startY,
                    bottom: startY + boxHeight
                });

                // 노드 그리기
                box.forEach((line, lineIdx) => {
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        const x = startX + i;
                        const y = startY + lineIdx;
                        if (y < canvasHeight && x < canvasWidth) {
                            canvas[y][x] = char;
                        }
                    }
                });
            });

            // 엣지 그리기
            edges.forEach(e => {
                const fromPos = nodePositions.get(e.from);
                const toPos = nodePositions.get(e.to);
                if (!fromPos || !toPos) return;

                const fromX = fromPos.right;
                const toX = toPos.left - 1;
                const fromY = fromPos.centerY;
                const toY = toPos.centerY;

                if (fromY === toY) {
                    // 같은 행: 직선 화살표
                    for (let x = fromX; x < toX; x++) {
                        if (canvas[fromY] && x < canvasWidth) {
                            canvas[fromY][x] = chars.LINE_BOLD;
                        }
                    }
                    if (canvas[toY] && toX < canvasWidth) {
                        canvas[toY][toX] = chars.AR_R;
                    }

                    // 라벨 인라인 배치 (화살표 위)
                    if (e.label && fromY > 0) {
                        const labelText = '[' + e.label + ']';
                        const labelX = Math.floor((fromX + toX) / 2) - Math.floor(strWidth(labelText) / 2);
                        const labelY = fromY - 1;
                        for (let i = 0; i < labelText.length; i++) {
                            if (canvas[labelY] && labelX + i >= 0 && labelX + i < canvasWidth) {
                                canvas[labelY][labelX + i] = labelText[i];
                            }
                        }
                    }
                } else {
                    // 다른 행: 꺾이는 경로
                    const midX = Math.floor((fromX + toX) / 2);

                    // 수평선 (from → mid)
                    for (let x = fromX; x <= midX; x++) {
                        if (canvas[fromY] && x < canvasWidth) {
                            canvas[fromY][x] = chars.LINE;
                        }
                    }

                    // 수직선 (fromY → toY)
                    const minY = Math.min(fromY, toY);
                    const maxY = Math.max(fromY, toY);
                    for (let y = minY; y <= maxY; y++) {
                        if (canvas[y] && midX < canvasWidth) {
                            if (y === fromY) {
                                canvas[y][midX] = toY > fromY ? chars.CORNER_DL : chars.CORNER_UL;
                            } else if (y === toY) {
                                canvas[y][midX] = toY > fromY ? chars.CORNER_UR : chars.CORNER_DR;
                            } else {
                                canvas[y][midX] = chars.VLINE;
                            }
                        }
                    }

                    // 수평선 (mid → to)
                    for (let x = midX + 1; x < toX; x++) {
                        if (canvas[toY] && x < canvasWidth) {
                            canvas[toY][x] = chars.LINE;
                        }
                    }

                    // 화살표
                    if (canvas[toY] && toX < canvasWidth) {
                        canvas[toY][toX] = chars.AR_R;
                    }

                    // 라벨 인라인 배치 (수직선 옆)
                    if (e.label) {
                        const labelText = '[' + e.label + ']';
                        const labelY = Math.floor((minY + maxY) / 2);
                        const labelX = midX + 2;
                        for (let i = 0; i < labelText.length; i++) {
                            if (canvas[labelY] && labelX + i < canvasWidth) {
                                canvas[labelY][labelX + i] = labelText[i];
                            }
                        }
                    }
                }
            });

            // 캔버스를 문자열로 변환
            const outputLines = canvas.map(row => row.join('').trimEnd());

            // 빈 줄 제거
            while (outputLines.length > 0 && outputLines[outputLines.length - 1] === '') {
                outputLines.pop();
            }
            while (outputLines.length > 0 && outputLines[0] === '') {
                outputLines.shift();
            }

            // 엣지 라벨은 이제 인라인으로 배치됨 (화살표 위/옆)
            // 하단 레전드 섹션 제거됨

            // 경고 추가
            if (warnings.length > 0) {
                outputLines.push('');
                outputLines.push(chars.DOT.repeat(40));
                warnings.forEach(w => outputLines.push(w));
            }

            return outputLines.join('\n');
        },

        renderGridVertical(parsed) {
            const { nodes, edges, warnings = [] } = parsed;
            const chars = getChars();

            if (nodes.length === 0) return '(빈 다이어그램)';

            // 레이어 할당
            const layerMap = GridLayoutEngine.assignLayers(nodes, edges);
            const layerGroups = GridLayoutEngine.groupByLayer(nodes, layerMap);
            const gridSize = GridLayoutEngine.getGridSize(layerGroups, 'TB');
            const positions = GridLayoutEngine.calculateGridPositions(layerGroups, 'TB');

            // 시작/끝 노드 마킹
            const startNodes = nodes.filter(n => !edges.some(e => e.to === n.id));
            const endNodes = nodes.filter(n => !edges.some(e => e.from === n.id));
            startNodes.forEach(n => n.isStart = true);
            endNodes.forEach(n => n.isEnd = true);

            // 노드 렌더링
            const renderedNodes = new Map();
            let maxNodeHeight = 0;
            let maxNodeWidth = 0;
            nodes.forEach(n => {
                const box = this.renderNode(n, chars);
                renderedNodes.set(n.id, box);
                maxNodeHeight = Math.max(maxNodeHeight, box.length);
                maxNodeWidth = Math.max(maxNodeWidth, strWidth(box[0]));
            });

            // 셀 크기 계산
            const cellWidth = maxNodeWidth + 6;
            const cellHeight = maxNodeHeight + 4;

            // 캔버스 생성
            const canvasWidth = gridSize.cols * cellWidth;
            const canvasHeight = gridSize.rows * cellHeight;
            const canvas = Array(canvasHeight).fill(null).map(() =>
                Array(canvasWidth).fill(' ')
            );

            // 노드 배치
            const nodePositions = new Map();
            nodes.forEach(n => {
                const pos = positions.get(n.id);
                const box = renderedNodes.get(n.id);
                const boxWidth = strWidth(box[0]);
                const boxHeight = box.length;

                const cellStartX = pos.col * cellWidth;
                const cellStartY = pos.row * cellHeight;
                const offsetX = Math.floor((cellWidth - boxWidth) / 2);
                const offsetY = Math.floor((cellHeight - boxHeight) / 2);
                const startX = cellStartX + offsetX;
                const startY = cellStartY + offsetY;

                nodePositions.set(n.id, {
                    centerX: cellStartX + Math.floor(cellWidth / 2),
                    centerY: cellStartY + Math.floor(cellHeight / 2),
                    bottom: startY + boxHeight,
                    top: startY,
                    left: startX,
                    right: startX + boxWidth
                });

                box.forEach((line, lineIdx) => {
                    for (let i = 0; i < line.length; i++) {
                        const x = startX + i;
                        const y = startY + lineIdx;
                        if (y < canvasHeight && x < canvasWidth) {
                            canvas[y][x] = line[i];
                        }
                    }
                });
            });

            // 엣지 그리기 (수직)
            edges.forEach(e => {
                const fromPos = nodePositions.get(e.from);
                const toPos = nodePositions.get(e.to);
                if (!fromPos || !toPos) return;

                const fromX = fromPos.centerX;
                const toX = toPos.centerX;
                const fromY = fromPos.bottom;
                const toY = toPos.top - 1;

                if (fromX === toX) {
                    // 같은 열: 직선
                    for (let y = fromY; y < toY; y++) {
                        if (canvas[y] && fromX < canvasWidth) {
                            canvas[y][fromX] = chars.VLINE;
                        }
                    }
                    if (canvas[toY] && toX < canvasWidth) {
                        canvas[toY][toX] = chars.AR_D;
                    }
                } else {
                    // 다른 열: 꺾이는 경로
                    const midY = Math.floor((fromY + toY) / 2);

                    // 수직선 (from → mid)
                    for (let y = fromY; y <= midY; y++) {
                        if (canvas[y] && fromX < canvasWidth) {
                            canvas[y][fromX] = chars.VLINE;
                        }
                    }

                    // 수평선 (fromX → toX)
                    const minX = Math.min(fromX, toX);
                    const maxX = Math.max(fromX, toX);
                    for (let x = minX; x <= maxX; x++) {
                        if (canvas[midY] && x < canvasWidth) {
                            if (x === fromX) {
                                canvas[midY][x] = toX > fromX ? chars.CORNER_UR : chars.CORNER_UL;
                            } else if (x === toX) {
                                canvas[midY][x] = toX > fromX ? chars.CORNER_DL : chars.CORNER_DR;
                            } else {
                                canvas[midY][x] = chars.LINE;
                            }
                        }
                    }

                    // 수직선 (mid → to)
                    for (let y = midY + 1; y < toY; y++) {
                        if (canvas[y] && toX < canvasWidth) {
                            canvas[y][toX] = chars.VLINE;
                        }
                    }

                    if (canvas[toY] && toX < canvasWidth) {
                        canvas[toY][toX] = chars.AR_D;
                    }
                }
            });

            // 캔버스를 문자열로 변환
            const outputLines = canvas.map(row => row.join('').trimEnd());

            while (outputLines.length > 0 && outputLines[outputLines.length - 1] === '') {
                outputLines.pop();
            }
            while (outputLines.length > 0 && outputLines[0] === '') {
                outputLines.shift();
            }

            // 엣지 라벨 추가
            const labeledEdges = edges.filter(e => e.label);
            if (labeledEdges.length > 0) {
                outputLines.push('');
                outputLines.push('  ' + chars.VDASH + ' 조건:');
                labeledEdges.forEach(e => {
                    outputLines.push(`  ${chars.VDASH}  ${e.from} ${chars.AR_D_THIN} ${e.to}: ${e.label}`);
                });
            }

            if (warnings.length > 0) {
                outputLines.push('');
                outputLines.push(chars.DOT.repeat(40));
                warnings.forEach(w => outputLines.push(w));
            }

            return outputLines.join('\n');
        },

        // ─────────────────────────────────────────────────────────────────────
        // Linear Layout (분기 없는 경우)
        // ─────────────────────────────────────────────────────────────────────

        renderLinearHorizontal(parsed) {
            const { nodes, edges, warnings = [] } = parsed;
            const chars = getChars();

            if (nodes.length === 0) return '(빈 다이어그램)';

            if (nodes.length > 0) nodes[0].isStart = true;
            if (nodes.length > 1) nodes[nodes.length - 1].isEnd = true;

            // 위상 정렬
            const order = this.topologicalSort(nodes, edges);

            const rendered = new Map();
            let maxHeight = 0;
            order.forEach(id => {
                const node = nodes.find(n => n.id === id);
                if (node) {
                    const box = this.renderNode(node, chars);
                    rendered.set(id, box);
                    maxHeight = Math.max(maxHeight, box.length);
                }
            });

            const edgeLabels = edges.filter(e => e.label).map(e => e.label);
            const maxLabelWidth = edgeLabels.length > 0
                ? Math.max(...edgeLabels.map(l => strWidth(l)))
                : 0;
            const MIN_ARROW_WIDTH = 7;
            const arrowWidth = Math.max(MIN_ARROW_WIDTH, maxLabelWidth + 4);
            const arrowBody = chars.LINE_BOLD.repeat(arrowWidth - 3);
            const arrow = ` ${arrowBody}${chars.AR_R} `;

            const outputLines = Array(maxHeight).fill('').map(() => '');

            order.forEach((id, idx) => {
                const box = rendered.get(id);
                if (!box) return;

                const topPad = Math.floor((maxHeight - box.length) / 2);
                for (let i = 0; i < maxHeight; i++) {
                    if (i >= topPad && i < topPad + box.length) {
                        outputLines[i] += box[i - topPad];
                    } else {
                        outputLines[i] += ' '.repeat(strWidth(box[0]));
                    }
                }

                if (idx < order.length - 1) {
                    const midLine = Math.floor(maxHeight / 2);
                    for (let i = 0; i < maxHeight; i++) {
                        outputLines[i] += (i === midLine) ? arrow : ' '.repeat(arrowWidth);
                    }
                }
            });

            const labeledEdges = edges.filter(e => e.label);
            if (labeledEdges.length > 0) {
                outputLines.push('');
                outputLines.push('  ' + chars.VDASH + ' 조건:');
                labeledEdges.forEach(e => {
                    outputLines.push(`  ${chars.VDASH}  ${e.from} ${chars.AR_R_THIN} ${e.to}: ${e.label}`);
                });
            }

            if (warnings.length > 0) {
                outputLines.push('');
                outputLines.push(chars.DOT.repeat(40));
                warnings.forEach(w => outputLines.push(w));
            }

            return outputLines.join('\n');
        },

        renderLinearVertical(parsed) {
            const { nodes, edges, warnings = [] } = parsed;
            const chars = getChars();

            if (nodes.length === 0) return '(빈 다이어그램)';

            if (nodes.length > 0) nodes[0].isStart = true;
            if (nodes.length > 1) nodes[nodes.length - 1].isEnd = true;

            const order = this.topologicalSort(nodes, edges);
            const lines = [];

            let maxWidth = 0;
            const rendered = order.map(id => {
                const node = nodes.find(n => n.id === id);
                const box = this.renderNode(node, chars);
                maxWidth = Math.max(maxWidth, strWidth(box[0]));
                return { id, box, node };
            });

            rendered.forEach((item, idx) => {
                const { box } = item;
                const boxWidth = strWidth(box[0]);
                const leftPad = Math.floor((maxWidth - boxWidth) / 2);

                box.forEach(line => {
                    lines.push(' '.repeat(leftPad) + line);
                });

                if (idx < rendered.length - 1) {
                    const centerPad = Math.floor(maxWidth / 2);
                    lines.push(' '.repeat(centerPad) + chars.VLINE);
                    lines.push(' '.repeat(centerPad) + chars.AR_D_THIN);
                }
            });

            if (warnings.length > 0) {
                lines.push('');
                lines.push(chars.DOT.repeat(40));
                warnings.forEach(w => lines.push(w));
            }

            return lines.join('\n');
        },

        topologicalSort(nodes, edges) {
            const inDegree = new Map();
            const outEdges = new Map();

            nodes.forEach(n => {
                inDegree.set(n.id, 0);
                outEdges.set(n.id, []);
            });

            edges.forEach(e => {
                if (inDegree.has(e.to)) {
                    inDegree.set(e.to, inDegree.get(e.to) + 1);
                }
                outEdges.get(e.from)?.push(e.to);
            });

            const queue = [];
            const result = [];

            inDegree.forEach((deg, id) => {
                if (deg === 0) queue.push(id);
            });

            while (queue.length > 0) {
                const id = queue.shift();
                result.push(id);

                outEdges.get(id)?.forEach(toId => {
                    const newDeg = inDegree.get(toId) - 1;
                    inDegree.set(toId, newDeg);
                    if (newDeg === 0) queue.push(toId);
                });
            }

            nodes.forEach(n => {
                if (!result.includes(n.id)) result.push(n.id);
            });

            return result;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SequenceRenderer
    // ═══════════════════════════════════════════════════════════════════════════

    const SequenceRenderer = {
        name: 'Sequence',

        detect(code) {
            const firstLine = code.trim().split('\n')[0].toLowerCase();
            return firstLine.includes('sequencediagram');
        },

        parse(code) {
            const lines = code.split('\n').map(l => l.trim()).filter(l => l);
            const participants = [];
            const messages = [];
            const warnings = [];

            for (const line of lines) {
                if (line.toLowerCase().startsWith('sequencediagram')) continue;

                const pMatch = line.match(/participant\s+(\w+)(?:\s+as\s+(.+))?/i);
                if (pMatch) {
                    participants.push({ id: pMatch[1], label: pMatch[2] || pMatch[1] });
                    continue;
                }

                const mMatch = line.match(/(\w+)\s*(->>|-->>|->|-->)\s*(\w+)\s*:\s*(.+)/);
                if (mMatch) {
                    const [, from, arrow, to, msg] = mMatch;
                    if (!participants.find(p => p.id === from)) {
                        participants.push({ id: from, label: from });
                    }
                    if (!participants.find(p => p.id === to)) {
                        participants.push({ id: to, label: to });
                    }
                    messages.push({ from, to, msg: msg.trim(), dashed: arrow.includes('--') });
                    continue;
                }

                if (line && !line.startsWith('%%') && !line.match(/^(note|alt|else|end|loop|opt|par|rect|activate|deactivate)\b/i)) {
                    warnings.push(`⚠ 인식 불가: ${line.substring(0, 40)}`);
                }
            }

            return { participants, messages, warnings };
        },

        render(parsed) {
            const { participants, messages, warnings = [] } = parsed;
            const chars = getChars();

            if (participants.length === 0) return '(빈 시퀀스 다이어그램)';

            const boxPadding = 2;
            const colGap = 4;
            const boxWidths = participants.map(p => strWidth(p.label) + boxPadding * 2 + 2);
            const colWidth = Math.max(...boxWidths) + colGap;

            const centers = [];
            let x = 0;
            participants.forEach(() => {
                centers.push(x + Math.floor(colWidth / 2));
                x += colWidth;
            });
            const totalWidth = x;

            const output = [];

            // 헤더 박스
            let line1 = '', line2 = '', line3 = '';
            participants.forEach((p, i) => {
                const boxW = strWidth(p.label) + 4;
                const leftPad = centers[i] - Math.floor(boxW / 2);

                line1 += ' '.repeat(Math.max(0, leftPad - strWidth(line1)));
                line1 += chars.S_TL + chars.S_H.repeat(boxW - 2) + chars.S_TR;

                line2 += ' '.repeat(Math.max(0, leftPad - strWidth(line2)));
                line2 += chars.S_V + ' ' + p.label + ' ' + chars.S_V;

                line3 += ' '.repeat(Math.max(0, leftPad - strWidth(line3)));
                line3 += chars.S_BL + chars.S_H + chars.T_DOWN + chars.S_H.repeat(Math.max(0, boxW - 5)) + chars.S_BR;
            });
            output.push(line1, line2, line3);

            // 메시지
            messages.forEach(m => {
                const fromIdx = participants.findIndex(p => p.id === m.from);
                const toIdx = participants.findIndex(p => p.id === m.to);
                if (fromIdx === -1 || toIdx === -1) return;

                let lifeline = '';
                for (let i = 0; i < totalWidth; i++) {
                    lifeline += centers.includes(i) ? chars.VLINE : ' ';
                }
                output.push(lifeline);

                const fromX = centers[fromIdx];
                const toX = centers[toIdx];
                const minX = Math.min(fromX, toX);
                const maxX = Math.max(fromX, toX);
                const rightward = toX > fromX;

                const maxMsgLen = Math.abs(toX - fromX) - 4;
                let msgText = m.msg;
                if (strWidth(msgText) > maxMsgLen && maxMsgLen > 3) {
                    msgText = msgText.substring(0, maxMsgLen - 2) + '..';
                }

                const labelX = minX + Math.floor((maxX - minX - strWidth(msgText)) / 2);
                let labelLine = '';
                for (let i = 0; i < totalWidth; i++) {
                    if (i === labelX) {
                        labelLine += msgText;
                        i += strWidth(msgText) - 1;
                    } else {
                        labelLine += centers.includes(i) ? chars.VLINE : ' ';
                    }
                }
                output.push(labelLine);

                let arrowLine = '';
                for (let i = 0; i < totalWidth; i++) {
                    if (i === fromX && !rightward) arrowLine += chars.AR_L;
                    else if (i === fromX && rightward) arrowLine += chars.T_RIGHT;
                    else if (i === toX && rightward) arrowLine += chars.AR_R;
                    else if (i === toX && !rightward) arrowLine += chars.T_LEFT;
                    else if (i > minX && i < maxX) arrowLine += m.dashed ? chars.DASH : chars.LINE;
                    else arrowLine += centers.includes(i) ? chars.VLINE : ' ';
                }
                output.push(arrowLine);
            });

            let finalLine = '';
            for (let i = 0; i < totalWidth; i++) {
                finalLine += centers.includes(i) ? chars.VLINE : ' ';
            }
            output.push(finalLine, finalLine);

            if (warnings.length > 0) {
                output.push('', chars.DOT.repeat(40));
                warnings.forEach(w => output.push(w));
            }

            return output.join('\n');
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 렌더러 등록
    // ═══════════════════════════════════════════════════════════════════════════

    RendererRegistry.register('flowchart', FlowchartRenderer);
    RendererRegistry.register('sequence', SequenceRenderer);

    // ═══════════════════════════════════════════════════════════════════════════
    // CSS 애니메이션 효과
    // ═══════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════
    // CSS 효과 (DCInside 호환 - 인라인 스타일만)
    // 포멀 & 모노톤 중심, 3가지만 유지
    // ═══════════════════════════════════════════════════════════════════════════

    const CSS_ANIMATIONS = {
        // 기본: 효과 없음
        none: {
            label: '기본',
            style: ''
        },
        // 스캔라인: CRT 모니터 느낌 (가장 무난)
        scanline: {
            label: '스캔라인',
            style: 'background-image: linear-gradient(transparent 50%, rgba(0,0,0,0.04) 50%); background-size: 100% 3px;'
        },
        // 터미널: 은은한 글로우 + 스캔라인 (cyber 테마와 잘 어울림)
        terminal: {
            label: '터미널',
            style: 'text-shadow: 0 0 2px currentColor; background-image: linear-gradient(transparent 50%, rgba(0,0,0,0.03) 50%); background-size: 100% 4px;'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CSS 테마 - 모노톤 & 포멀 (3가지)
    // ═══════════════════════════════════════════════════════════════════════════

    const CSS_THEMES = {
        // 라이트 - 깔끔한 흰색 배경 (기본, 가장 무난)
        light: {
            label: '라이트',
            bg: '#FAFAFA',
            color: '#1a1a1a',
            border: '1px solid #e0e0e0'
        },
        // 다크 - 어두운 그레이 (포멀)
        dark: {
            label: '다크',
            bg: '#1e1e1e',
            color: '#d4d4d4',
            border: '1px solid #3a3a3a'
        },
        // 사이버 - 다크 + 청록 악센트 (스캔라인과 어울림)
        cyber: {
            label: '사이버',
            bg: '#0d1117',
            color: '#58a6ff',
            border: '1px solid #30363d'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════════════════════

    function render(code) {
        return RendererRegistry.render(code);
    }

    function renderForDC(code, themeName = 'dark', charSetName = 'unicode', effectName = 'scanline') {
        currentCharSet = CHAR_SETS[charSetName] ? charSetName : 'unicode';
        const ascii = render(code);
        const theme = CSS_THEMES[themeName] || CSS_THEMES.dark;
        const effect = CSS_ANIMATIONS[effectName] || CSS_ANIMATIONS.none;

        // HTML 특수문자 이스케이프
        const escaped = ascii
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 기본 스타일 + 효과 스타일 (인라인만, @keyframes 불가)
        const fullStyle = `font-family: 'D2Coding', Consolas, monospace; font-size: 13px; line-height: 1.45; background: ${theme.bg}; color: ${theme.color}; padding: 16px; border-radius: 6px; margin: 16px 0; overflow-x: auto; border: ${theme.border}; ${effect.style}`;

        return `<pre style="${fullStyle}"><code>${escaped}</code></pre>`;
    }

    // Export (간소화 - 3 테마 x 3 효과)
    window.MermaidASCII = {
        render,
        renderForDC,
        CSS_THEMES,
        CSS_EFFECTS: CSS_ANIMATIONS,
        CHAR_SETS,
        setCharSet: (name) => { currentCharSet = CHAR_SETS[name] ? name : 'unicode'; },
        // 프리셋 (에디터 버튼용)
        PRESETS: {
            light: { theme: 'light', effect: 'none', label: '라이트' },
            dark: { theme: 'dark', effect: 'scanline', label: '다크' },
            cyber: { theme: 'cyber', effect: 'terminal', label: '사이버' }
        },
        renderPreset: (code, presetName) => {
            const preset = window.MermaidASCII.PRESETS[presetName] || window.MermaidASCII.PRESETS.dark;
            return renderForDC(code, preset.theme, 'unicode', preset.effect);
        }
    };

    console.log('[DC-MD] MermaidASCII v6 - Monotone Edition');
})();
