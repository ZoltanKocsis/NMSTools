// ===================================================================
// GlyphDetect — shared portal-glyph scanning toolkit.
//
// Locates the 12-glyph portal address in a screenshot (either via a
// proportional auto-detect rectangle, or a rectangle the caller
// picked manually) and matches each cell against the
// images/glyphs/{0-9,A-F}.png icon set using OpenCV.js template
// matching. Used by nms_glyph_decoder.html (Symbol Reading) and the
// scan section of visited_planets.html's Portal Glyph Builder — any
// future page that wants "upload a screenshot, get the hex code"
// should use this instead of re-implementing it.
//
// opencv.js (~13MB) is NOT loaded until ensureReady() is first
// called, so pages that only sometimes need scanning don't pay for
// it on every visit.
//
// Also exports setupDragSelect(), a small canvas drag-to-select
// helper — not detection-related, but every scanning UI needs it,
// so it lives here rather than being copy-pasted per page.
// ===================================================================

window.GlyphDetect = (function () {

  const HEX_DIGITS = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
  const TEMPLATE_SIZE = 128;
  const TEMPLATE_DIR = 'images/glyphs';
  const OPENCV_SRC = 'js/opencv.js';

  // reference rectangle measured on a 1920x1080 screenshot (bottom-left HUD)
  const REF_W = 1920, REF_H = 1080;
  const REF_RECT = { x: 10, y: 1014, w: 383, h: 30 };

  let readyPromise = null;
  let templateMats = null;

  // -----------------------------------------------------------------
  // OpenCV script + runtime loading (lazy, cached after first call)
  // -----------------------------------------------------------------
  function loadOpenCvScript() {
    return new Promise((resolve, reject) => {
      if (typeof cv !== 'undefined') { resolve(); return; }
      const existing = document.querySelector('script[src="' + OPENCV_SRC + '"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load ' + OPENCV_SRC)));
        return;
      }
      const s = document.createElement('script');
      s.src = OPENCV_SRC;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + OPENCV_SRC));
      document.head.appendChild(s);
    });
  }

  // Handles both the classic (global object + onRuntimeInitialized
  // callback) and modern (factory function returning a Promise)
  // opencv.js builds.
  function waitForCvRuntime() {
    return new Promise((resolve) => {
      function poll() {
        if (typeof cv === 'undefined') { setTimeout(poll, 100); return; }
        if (cv.Mat) { resolve(); return; }
        if (typeof cv.then === 'function') { cv.then((resolved) => { window.cv = resolved; resolve(); }); return; }
        if (typeof cv === 'function') { cv().then((resolved) => { window.cv = resolved; resolve(); }); return; }
        cv['onRuntimeInitialized'] = resolve;
      }
      poll();
    });
  }

  // -----------------------------------------------------------------
  // Template loading: images/glyphs/{h}.png, composited on BLACK
  // (glyphs are light line-art on transparent bg, matching the dark
  // in-game HUD backdrop), auto-cropped to their alpha bounding box
  // so padding differences between glyphs don't skew matching.
  // -----------------------------------------------------------------
  function loadImageAsync(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('Could not load ' + src));
      im.src = src;
    });
  }

  function alphaBBox(canvas) {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const data = c.getImageData(0, 0, w, h).data;
    const ALPHA_THRESH = 20;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > ALPHA_THRESH) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return { x: 0, y: 0, w, h };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  function preprocessMatFromCanvas(canvas) {
    let mat = cv.imread(canvas);
    let gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    let blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);
    let thresh = new cv.Mat();
    cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    mat.delete(); gray.delete(); blurred.delete();
    return thresh;
  }

  async function buildTemplateMats() {
    const mats = {};
    for (const h of HEX_DIGITS) {
      const im = await loadImageAsync(`${TEMPLATE_DIR}/${h}.png`);

      const raw = document.createElement('canvas');
      raw.width = im.width; raw.height = im.height;
      raw.getContext('2d').drawImage(im, 0, 0);

      const bbox = alphaBBox(raw);
      const margin = Math.round(Math.max(bbox.w, bbox.h) * 0.12);
      const sx = Math.max(0, bbox.x - margin);
      const sy = Math.max(0, bbox.y - margin);
      const sw = Math.min(im.width - sx, bbox.w + margin * 2);
      const sh = Math.min(im.height - sy, bbox.h + margin * 2);

      const c = document.createElement('canvas');
      c.width = TEMPLATE_SIZE; c.height = TEMPLATE_SIZE;
      const cctx = c.getContext('2d');
      cctx.fillStyle = '#000000';
      cctx.fillRect(0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);
      cctx.drawImage(raw, sx, sy, sw, sh, 0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);

      mats[h] = preprocessMatFromCanvas(c);
    }
    return mats;
  }

  // Resolves once OpenCV is loaded and templates are built. Safe to
  // call repeatedly — the underlying work only happens once.
  function ensureReady() {
    if (!readyPromise) {
      readyPromise = loadOpenCvScript()
        .then(waitForCvRuntime)
        .then(buildTemplateMats)
        .then((mats) => { templateMats = mats; });
    }
    return readyPromise;
  }

  // -----------------------------------------------------------------
  // Rectangle math
  // -----------------------------------------------------------------
  function computeAutoRect(imgW, imgH) {
    const scaleX = imgW / REF_W;
    const scaleY = imgH / REF_H;
    return {
      x: Math.floor(REF_RECT.x * scaleX),
      y: Math.floor(REF_RECT.y * scaleY),
      w: Math.floor(REF_RECT.w * scaleX),
      h: Math.floor(REF_RECT.h * scaleY)
    };
  }

  function cellRect(fullRect, i, n) {
    const cellW = fullRect.w / n;
    return { x: fullRect.x + i * cellW, y: fullRect.y, w: cellW, h: fullRect.h };
  }

  // -----------------------------------------------------------------
  // Detection: splits fullRect into n cells (default 12) and matches
  // each against the templates. Always samples directly from the
  // original image, never from a resized intermediate canvas.
  // opts.thumbSize, if set, adds a resized-canvas thumbnail to each
  // result (for pages that show a visual review grid); omit it to
  // skip that extra canvas work.
  // -----------------------------------------------------------------
  function detectCells(fullImg, fullRect, opts) {
    if (!templateMats) throw new Error('GlyphDetect.ensureReady() must resolve before detectCells()');
    opts = opts || {};
    const n = opts.n || 12;
    const results = [];

    for (let i = 0; i < n; i++) {
      const cr = cellRect(fullRect, i, n);

      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = TEMPLATE_SIZE; cellCanvas.height = TEMPLATE_SIZE;
      cellCanvas.getContext('2d').drawImage(fullImg, cr.x, cr.y, cr.w, cr.h, 0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);

      const cellMat = preprocessMatFromCanvas(cellCanvas);

      let bestHex = '-', bestScore = -1;
      HEX_DIGITS.forEach(h => {
        const tmpl = templateMats[h];
        if (!tmpl) return;
        let result = new cv.Mat();
        cv.matchTemplate(cellMat, tmpl, result, cv.TM_CCOEFF_NORMED);
        const score = result.data32F[0];
        result.delete();
        if (score > bestScore) { bestScore = score; bestHex = h; }
      });
      cellMat.delete();

      const entry = { hex: bestHex, score: bestScore };
      if (opts.thumbSize) {
        const thumb = document.createElement('canvas');
        thumb.width = opts.thumbSize; thumb.height = opts.thumbSize;
        thumb.getContext('2d').drawImage(cellCanvas, 0, 0, opts.thumbSize, opts.thumbSize);
        entry.thumb = thumb;
      }
      results.push(entry);
    }
    return results;
  }

  // -----------------------------------------------------------------
  // Generic drag-to-select rectangle helper (manual mode).
  // Tracks the rectangle in the CANVAS's internal pixel space while
  // positioning the overlay div in on-screen CSS pixel space.
  // -----------------------------------------------------------------
  function setupDragSelect(canvas, boxEl, state) {
    let dragging = false, startDispX, startDispY;
    function dispRect() { return canvas.getBoundingClientRect(); }

    canvas.addEventListener('mousedown', (e) => {
      const r = dispRect();
      startDispX = e.clientX - r.left;
      startDispY = e.clientY - r.top;
      dragging = true;
      boxEl.style.display = 'block';
      boxEl.style.left = startDispX + 'px';
      boxEl.style.top = startDispY + 'px';
      boxEl.style.width = '0px';
      boxEl.style.height = '0px';
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const r = dispRect();
      const curDispX = Math.max(0, Math.min(e.clientX - r.left, r.width));
      const curDispY = Math.max(0, Math.min(e.clientY - r.top, r.height));
      const dx = Math.min(startDispX, curDispX);
      const dy = Math.min(startDispY, curDispY);
      const dw = Math.abs(curDispX - startDispX);
      const dh = Math.abs(curDispY - startDispY);
      boxEl.style.left = dx + 'px';
      boxEl.style.top = dy + 'px';
      boxEl.style.width = dw + 'px';
      boxEl.style.height = dh + 'px';

      const scaleX = canvas.width / r.width;
      const scaleY = canvas.height / r.height;
      state.rect = { x: dx * scaleX, y: dy * scaleY, w: dw * scaleX, h: dh * scaleY };
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      if (state.rect && state.rect.w > 12 && state.rect.h > 8) {
        state.onReady && state.onReady();
      }
    });
  }

  return {
    HEX_DIGITS,
    REF_W, REF_H, REF_RECT,
    ensureReady,
    computeAutoRect,
    cellRect,
    detectCells,
    setupDragSelect
  };

})();
