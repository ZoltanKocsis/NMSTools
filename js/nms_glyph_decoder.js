// ===================================================================
// NMS Glyph Decoder — application logic
// Detection engine (OpenCV loading, template matching, rectangle
// math) lives in js/glyph_detect.js (window.GlyphDetect), shared
// with the scan section of visited_planets.html. This file only
// handles this page's UI: canvas rendering, drag-select, the
// auto/manual mode toggle, the per-cell review grid, and output
// assembly.
//
// Two position modes:
//  - "auto": the 12-glyph rectangle is calculated proportionally from
//    a measured 1920x1080 reference (bottom-left HUD position), scaled
//    independently on X and Y for the actual image's dimensions.
//  - "manual": the old rough-select -> zoom -> fine-select workflow,
//    for screenshots where the glyphs sit somewhere else (e.g. a
//    portal-placement screen with the row centered near the top).
//
// In both modes, the final 12 cells are always sampled directly from
// the original full-resolution image (never from an intermediate
// resized canvas), to avoid compounding blur from extra resampling.
// ===================================================================

const HEX_DIGITS = GlyphDetect.HEX_DIGITS;

let detectReady = false;
let pendingAutoDetect = false;

let fullImg = null;
let overviewScale = 1;
let mode = 'auto';           // 'auto' | 'manual'
let zoomCrop = null;         // {fx, fy, fw, fh, scale} — manual mode zoom mapping

// DOM refs
const srcCanvas   = document.getElementById('srcCanvas');
const srcCtx      = srcCanvas.getContext('2d');
const selectBox   = document.getElementById('selectBox');
const autoRectBox = document.getElementById('autoRectBox');
const zoomCanvas  = document.getElementById('zoomCanvas');
const zoomCtx     = zoomCanvas.getContext('2d');
const zoomSelectBox = document.getElementById('zoomSelectBox');

const uploadCard   = document.getElementById('uploadCard');
const autoSection  = document.getElementById('autoSection');
const manualSection= document.getElementById('manualSection');
const zoomCard     = document.getElementById('zoomCard');
const resultsCard  = document.getElementById('resultsCard');

const uploadHint  = document.getElementById('uploadHint');
const zoomBtn     = document.getElementById('zoomBtn');
const backBtn     = document.getElementById('backBtn');
const rerunAutoBtn= document.getElementById('rerunAutoBtn');
const detectBtn   = document.getElementById('detectBtn');
const statusEl    = document.getElementById('status');
const manualStatusEl = document.getElementById('manualStatus');
const cellsDiv    = document.getElementById('cells');
const outputEl    = document.getElementById('output');
const countPill   = document.getElementById('countPill');
const toastEl     = document.getElementById('toast');
const copyBtn     = document.getElementById('copyBtn');
const resetBtn    = document.getElementById('resetBtn');
const modeAutoRadio   = document.getElementById('modeAuto');
const modeManualRadio = document.getElementById('modeManual');

function setStatus(msg) {
  statusEl.textContent = msg;
  manualStatusEl.textContent = msg;
}

let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

// ===================================================================
// Detection engine readiness (OpenCV + templates, via GlyphDetect)
// ===================================================================
setStatus('Loading OpenCV...');
GlyphDetect.ensureReady().then(() => {
  detectReady = true;
  setStatus('Ready.');
  if (pendingAutoDetect && fullImg && mode === 'auto') {
    pendingAutoDetect = false;
    runAutoDetect();
  }
  if (mode === 'manual') {
    detectBtn.disabled = !zoomCrop;
  }
}).catch(err => {
  console.error(err);
  setStatus('Failed to load OpenCV / glyph templates — check js/opencv.js and images/glyphs/ are present.');
});

// ===================================================================
// Generic drag-to-select rectangle helper (manual mode only).
// ===================================================================
let overviewState = { rect: null, onReady: () => { zoomBtn.disabled = false; } };
let zoomState = { rect: null, onReady: () => { detectBtn.disabled = false; } };

GlyphDetect.setupDragSelect(srcCanvas, selectBox, overviewState);
GlyphDetect.setupDragSelect(zoomCanvas, zoomSelectBox, zoomState);

// ===================================================================
// Mode toggle
// ===================================================================
function applyModeUI() {
  if (mode === 'auto') {
    autoSection.hidden = false;
    manualSection.hidden = true;
    zoomCard.hidden = true;
    selectBox.style.display = 'none';
    if (fullImg) runAutoDetect();
  } else {
    autoSection.hidden = true;
    manualSection.hidden = false;
    autoRectBox.style.display = 'none';
    resultsCard.hidden = true;
    if (fullImg) setStatus('Drag a rough box around the row of 12 glyphs.');
  }
}
modeAutoRadio.addEventListener('change', () => { if (modeAutoRadio.checked) { mode = 'auto'; applyModeUI(); } });
modeManualRadio.addEventListener('change', () => { if (modeManualRadio.checked) { mode = 'manual'; applyModeUI(); } });

// ===================================================================
// File upload -> overview canvas
// ===================================================================
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const im = new Image();
    im.onload = () => {
      fullImg = im;
      const maxW = 900;
      overviewScale = Math.min(1, maxW / im.width);
      srcCanvas.width = im.width * overviewScale;
      srcCanvas.height = im.height * overviewScale;
      srcCtx.drawImage(im, 0, 0, srcCanvas.width, srcCanvas.height);

      overviewState.rect = null;
      zoomState.rect = null;
      zoomCrop = null;
      selectBox.style.display = 'none';
      autoRectBox.style.display = 'none';
      zoomBtn.disabled = true;
      zoomCard.hidden = true;
      resultsCard.hidden = true;
      outputEl.value = '------------';
      countPill.textContent = '0 / 12 matched';
      uploadHint.textContent = file.name + ` (${im.width}×${im.height})`;

      if (mode === 'auto') {
        runAutoDetect();
      } else {
        setStatus('Drag a rough box around the row of 12 glyphs.');
      }
    };
    im.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// ===================================================================
// Auto mode: compute rectangle proportionally, show overlay, detect
// ===================================================================
function runAutoDetect() {
  if (!fullImg) return;
  const rect = GlyphDetect.computeAutoRect(fullImg.width, fullImg.height);

  autoRectBox.style.display = 'block';
  autoRectBox.style.left = (rect.x * overviewScale) + 'px';
  autoRectBox.style.top = (rect.y * overviewScale) + 'px';
  autoRectBox.style.width = (rect.w * overviewScale) + 'px';
  autoRectBox.style.height = (rect.h * overviewScale) + 'px';

  if (!detectReady) {
    setStatus('Waiting for OpenCV / templates to finish loading...');
    pendingAutoDetect = true;
    return;
  }
  extractCellsAndDetect(rect);
}
rerunAutoBtn.addEventListener('click', runAutoDetect);

// ===================================================================
// Manual mode: zoom into rough selection for precise re-selection.
// The zoomed canvas is a visual aid only — the mapping back to
// full-image coordinates (zoomCrop) is what's actually used to
// sample cells, so quality never depends on the enlarged canvas.
// ===================================================================
zoomBtn.addEventListener('click', () => {
  if (!overviewState.rect || !fullImg) return;

  const r = overviewState.rect;
  const invScale = 1 / overviewScale;
  let fx = r.x * invScale, fy = r.y * invScale, fw = r.w * invScale, fh = r.h * invScale;

  const padX = fw * 0.2, padY = fh * 0.6;
  fx = Math.max(0, fx - padX);
  fy = Math.max(0, fy - padY);
  fw = Math.min(fullImg.width - fx, fw + padX * 2);
  fh = Math.min(fullImg.height - fy, fh + padY * 2);

  const targetW = 1100;
  const zoomFactor = Math.max(1, Math.min(6, targetW / fw));
  zoomCanvas.width = Math.round(fw * zoomFactor);
  zoomCanvas.height = Math.round(fh * zoomFactor);
  zoomCtx.drawImage(fullImg, fx, fy, fw, fh, 0, 0, zoomCanvas.width, zoomCanvas.height);

  zoomCrop = { fx, fy, fw, fh, scale: zoomFactor };

  zoomState.rect = null;
  zoomSelectBox.style.display = 'none';
  detectBtn.disabled = true;
  resultsCard.hidden = true;

  zoomCard.hidden = false;
  setStatus('Drag a tight box around exactly the 12 glyphs.');
});

backBtn.addEventListener('click', () => { zoomCard.hidden = true; });

detectBtn.addEventListener('click', () => {
  if (!detectReady) { setStatus('Still loading OpenCV / templates, try again shortly.'); return; }
  if (!zoomState.rect || !zoomCrop) return;

  const zr = zoomState.rect;
  const fullRect = {
    x: zoomCrop.fx + zr.x / zoomCrop.scale,
    y: zoomCrop.fy + zr.y / zoomCrop.scale,
    w: zr.w / zoomCrop.scale,
    h: zr.h / zoomCrop.scale
  };
  extractCellsAndDetect(fullRect);
});

// ===================================================================
// Shared: split a full-image-space rectangle into 12 cells and match.
// ===================================================================
function extractCellsAndDetect(fullRect) {
  if (!detectReady || !fullImg) return;

  const results = GlyphDetect.detectCells(fullImg, fullRect, { n: 12, thumbSize: 56 });

  resultsCard.hidden = false;
  renderCells(results);
  updateOutput();
  setStatus('Detection complete. Review and correct any low-confidence guesses.');
}

function renderCells(results) {
  cellsDiv.innerHTML = '';
  results.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'glyph-cell';
    div.appendChild(r.thumb);

    const select = document.createElement('select');
    select.id = 'guess' + idx;
    HEX_DIGITS.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h; opt.textContent = h;
      if (h === r.hex) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', updateOutput);
    div.appendChild(select);

    const confDiv = document.createElement('div');
    confDiv.className = 'conf ' + (r.score > 0.5 ? 'high' : 'low');
    confDiv.textContent = (r.score * 100).toFixed(0) + '%';
    div.appendChild(confDiv);

    cellsDiv.appendChild(div);
  });
}

function updateOutput() {
  let result = '';
  let matched = 0;
  for (let i = 0; i < 12; i++) {
    const sel = document.getElementById('guess' + i);
    const v = sel ? sel.value : '-';
    if (v !== '-') matched++;
    result += v;
  }
  outputEl.value = result || '------------';
  countPill.textContent = matched + ' / 12 matched';
}

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputEl.value);
  showToast('Copied: ' + outputEl.value);
});

resetBtn.addEventListener('click', () => {
  cellsDiv.innerHTML = '';
  outputEl.value = '------------';
  countPill.textContent = '0 / 12 matched';
  resultsCard.hidden = true;
  zoomCard.hidden = true;
  overviewState.rect = null;
  zoomState.rect = null;
  zoomCrop = null;
  selectBox.style.display = 'none';
  autoRectBox.style.display = 'none';
  zoomBtn.disabled = true;
  setStatus('');
});
