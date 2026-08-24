// ===================================================================
// ImageViewer — shared full-size pan/zoom popup for screenshot
// previews. Opens an in-page overlay (not a real separate browser
// window — avoids popup blockers and matches the site's styling)
// showing an image at native resolution: scroll to zoom, centered on
// the cursor; click-and-drag to pan. Used wherever a screenshot
// preview canvas is shown (Symbol Reading, Visited Planets' scan
// section) so glyph/portal-code details can be read up close.
// ===================================================================

window.ImageViewer = (function () {

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 8;

  let overlay = null, stage = null, imgEl = null, closeBtn = null;
  let scale = 1, panX = 0, panY = 0;
  let dragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;
  let prevBodyOverflow = '';

  function ensureOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'image-viewer-overlay';
    overlay.hidden = true;

    stage = document.createElement('div');
    stage.className = 'image-viewer-stage';

    imgEl = document.createElement('img');
    imgEl.className = 'image-viewer-img';
    imgEl.draggable = false;
    imgEl.alt = 'Full-size screenshot';
    stage.appendChild(imgEl);

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'image-viewer-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', close);

    overlay.appendChild(stage);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    document.addEventListener('keydown', (e) => {
      if (!overlay.hidden && e.key === 'Escape') close();
    });

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const prevScale = scale;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
      panX = cx - (cx - panX) * (scale / prevScale);
      panY = cy - (cy - panY) * (scale / prevScale);
      applyTransform();
    }, { passive: false });

    stage.addEventListener('mousedown', (e) => {
      dragging = true;
      dragStartX = e.clientX; dragStartY = e.clientY;
      panStartX = panX; panStartY = panY;
      stage.classList.add('dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      if (stage) stage.classList.remove('dragging');
    });
  }

  function applyTransform() {
    imgEl.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
  }

  function open(src) {
    if (!src) return;
    ensureOverlay();
    scale = 1; panX = 0; panY = 0;
    imgEl.src = src;
    applyTransform();
    overlay.hidden = false;
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = prevBodyOverflow;
  }

  // Wires a canvas so a plain click (no drag) opens the viewer with
  // getSrc()'s current value, while an actual drag (e.g. this canvas's
  // own drag-to-select rectangle) is left alone.
  function attachClickToOpen(canvas, getSrc) {
    let downX = 0, downY = 0, moved = false;
    const THRESHOLD = 4;
    canvas.addEventListener('mousedown', (e) => {
      downX = e.clientX; downY = e.clientY; moved = false;
    });
    canvas.addEventListener('mousemove', (e) => {
      if (moved) return;
      if (Math.abs(e.clientX - downX) > THRESHOLD || Math.abs(e.clientY - downY) > THRESHOLD) moved = true;
    });
    canvas.addEventListener('mouseup', () => {
      if (!moved) open(getSrc());
    });
  }

  return { open, close, attachClickToOpen };

})();
