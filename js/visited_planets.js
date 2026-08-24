/* ============================================================
   XENO ARENA — Visited Planets
   visited_planets.js

   Single file containing:
     1. GALAXIES data
     2. BIOMES data
     3. Auth / profile / nickname wiring (talks to window.NMSFirebase,
        set up by js/firebase-init.js)
     4. Glyph builder + table app logic (Firestore-backed)
     5. Legacy CSV import (one-time, via File System Access API)
   ============================================================ */

/* ------------------------------------------------------------
   1. GALAXIES DATA
   Each entry: { index: <galaxy number as used in-game>, name }
   Only galaxies 1-50 have confirmed names. Add more rows here
   (same shape) if you learn names for higher-numbered galaxies.
   ------------------------------------------------------------ */

const GALAXIES = [
  { index: 1, name: 'Euclid' },
  { index: 2, name: 'Hilbert Dimension' },
  { index: 3, name: 'Calypso' },
  { index: 4, name: 'Hesperius Dimension' },
  { index: 5, name: 'Hyades' },
  { index: 6, name: 'Ickjamatew' },
  { index: 7, name: 'Budullangr' },
  { index: 8, name: 'Kikolgallr' },
  { index: 9, name: 'Eltiensleen' },
  { index: 10, name: 'Eissentam' },
  { index: 11, name: 'Elkupalos' },
  { index: 12, name: 'Aptarkaba' },
  { index: 13, name: 'Ontiniangp' },
  { index: 14, name: 'Odiwagiri' },
  { index: 15, name: 'Ogtialabi' },
  { index: 16, name: 'Muhacksonto' },
  { index: 17, name: 'Hitonskyer' },
  { index: 18, name: 'Rerasmutul' },
  { index: 19, name: 'Isdoraijung' },
  { index: 20, name: 'Doctinawyra' },
  { index: 21, name: 'Loychazinq' },
  { index: 22, name: 'Zukasizawa' },
  { index: 23, name: 'Ekwathore' },
  { index: 24, name: 'Yeberhahne' },
  { index: 25, name: 'Twerbetek' },
  { index: 26, name: 'Sivarates' },
  { index: 27, name: 'Eajerandal' },
  { index: 28, name: 'Aldukesci' },
  { index: 29, name: 'Wotyarogii' },
  { index: 30, name: 'Sudzerbal' },
  { index: 31, name: 'Maupenzhay' },
  { index: 32, name: 'Sugueziume' },
  { index: 33, name: 'Brogoweldian' },
  { index: 34, name: 'Ehbogdenbu' },
  { index: 35, name: 'Ijsenufryos' },
  { index: 36, name: 'Nipikulha' },
  { index: 37, name: 'Autsurabin' },
  { index: 38, name: 'Lusontrygiamh' },
  { index: 39, name: 'Rewmanawa' },
  { index: 40, name: 'Ethiophodhe' },
  { index: 41, name: 'Urastrykle' },
  { index: 42, name: 'Xobeurindj' },
  { index: 43, name: 'Oniijialdu' },
  { index: 44, name: 'Wucetosucc' },
  { index: 45, name: 'Ebyeloof' },
  { index: 46, name: 'Odyavanta' },
  { index: 47, name: 'Milekistri' },
  { index: 48, name: 'Waferganh' },
  { index: 49, name: 'Agnusopwit' },
  { index: 50, name: 'Teyaypilny' },
];

/* ------------------------------------------------------------
   2. BIOMES DATA
   Best-effort list compiled from public NMS wikis/community
   references. Replace/extend with your own curated list any
   time — same { label, main } shape. "label" is the in-game
   descriptor (e.g. "Verdant"), "main" is the core biome it
   belongs to. Dropdown shows "Label (Main)". Sorted alphabetically
   by label.
   ------------------------------------------------------------ */

const BIOMES = [
  { label: 'Abandoned (Barren)', main: 'Barren' },
  { label: 'Abandoned (Dead)', main: 'Dead' },
  { label: 'Acidic', main: 'Toxic' },
  { label: 'Airless', main: 'Dead' },
  { label: 'Anomalous', main: 'Exotic' },
  { label: 'Arctic', main: 'Frozen' },
  { label: 'Arid', main: 'Scorched' },
  { label: 'Ash-Shrouded', main: 'Volcanic' },
  { label: 'Ashen', main: 'Volcanic' },
  { label: 'Azure', main: 'Mega Exotic' },
  { label: 'Barren', main: 'Barren' },
  { label: 'Bleak', main: 'Barren' },
  { label: 'Boggy', main: 'Marsh' },
  { label: 'Boiling', main: 'Scorched' },
  { label: 'Bountiful', main: 'Lush' },
  { label: 'Breached', main: 'Exotic' },
  { label: 'Caustic', main: 'Toxic' },
  { label: 'Charred', main: 'Scorched' },
  { label: 'Chromatic', main: 'Mega Exotic' },
  { label: 'Contaminated', main: 'Irradiated' },
  { label: 'Corrosive', main: 'Toxic' },
  { label: 'Crimson', main: 'Mega Exotic' },
  { label: 'Damp', main: 'Marsh' },
  { label: 'Dead', main: 'Dead' },
  { label: 'Decaying Nuclear', main: 'Irradiated' },
  { label: 'Desert', main: 'Barren' },
  { label: 'Desolate (Barren)', main: 'Barren' },
  { label: 'Desolate (Dead)', main: 'Dead' },
  { label: 'Doomed', main: 'Mega Exotic' },
  { label: 'Dusty', main: 'Barren' },
  { label: 'Empty', main: 'Dead' },
  { label: 'Erupting', main: 'Volcanic' },
  { label: 'Exotic', main: 'Exotic' },
  { label: 'Fetid', main: 'Toxic' },
  { label: 'Fiery', main: 'Scorched' },
  { label: 'Flourishing', main: 'Lush' },
  { label: 'Foaming', main: 'Exotic' },
  { label: 'Foggy', main: 'Marsh' },
  { label: 'Forsaken', main: 'Dead' },
  { label: 'Frosty', main: 'Frozen' },
  { label: 'Frozen', main: 'Frozen' },
  { label: 'Gamma-Intensive', main: 'Irradiated' },
  { label: 'Glacial', main: 'Frozen' },
  { label: 'Glass', main: 'Exotic' },
  { label: 'Grassy', main: 'Lush' },
  { label: 'Haunted', main: 'Mega Exotic' },
  { label: 'Hazy', main: 'Marsh' },
  { label: 'Hex', main: 'Exotic' },
  { label: 'Hot', main: 'Scorched' },
  { label: 'Humid', main: 'Lush' },
  { label: 'Icy', main: 'Frozen' },
  { label: 'Incandescent', main: 'Scorched' },
  { label: 'Irradiated', main: 'Irradiated' },
  { label: 'Isotopic', main: 'Irradiated' },
  { label: 'Lava', main: 'Volcanic' },
  { label: 'Life-Incompatible', main: 'Dead' },
  { label: 'Lifeless', main: 'Dead' },
  { label: 'Low Atmosphere', main: 'Dead' },
  { label: 'Lush', main: 'Lush' },
  { label: 'Magma', main: 'Volcanic' },
  { label: 'Marsh', main: 'Marsh' },
  { label: 'Marshy', main: 'Marsh' },
  { label: 'Mega Exotic', main: 'Mega Exotic' },
  { label: 'Misty', main: 'Marsh' },
  { label: 'Molten', main: 'Volcanic' },
  { label: 'Monochrome', main: 'Mega Exotic' },
  { label: 'Murky', main: 'Marsh' },
  { label: 'Nanophage', main: 'Exotic' },
  { label: 'Noxious', main: 'Toxic' },
  { label: 'Nuclear', main: 'Irradiated' },
  { label: 'Obsidian', main: 'Volcanic' },
  { label: 'Overgrown', main: 'Lush' },
  { label: 'Paradise', main: 'Lush' },
  { label: 'Parched', main: 'Barren' },
  { label: 'Permafrost', main: 'Frozen' },
  { label: 'Poisonous', main: 'Toxic' },
  { label: 'Quagmire', main: 'Marsh' },
  { label: 'Radioactive', main: 'Irradiated' },
  { label: 'Rainy', main: 'Lush' },
  { label: 'Rocky', main: 'Barren' },
  { label: 'Scalding', main: 'Scorched' },
  { label: 'Scorched', main: 'Scorched' },
  { label: 'Snowy', main: 'Frozen' },
  { label: 'Supercritical', main: 'Irradiated' },
  { label: 'Swamp', main: 'Marsh' },
  { label: 'Tectonic', main: 'Volcanic' },
  { label: 'Temperate', main: 'Lush' },
  { label: 'Terraforming Catastrophe', main: 'Dead' },
  { label: 'Torrid', main: 'Scorched' },
  { label: 'Toxic', main: 'Toxic' },
  { label: 'Tropical', main: 'Lush' },
  { label: 'Venomous', main: 'Toxic' },
  { label: 'Verdant', main: 'Lush' },
  { label: 'Viridescent', main: 'Lush' },
  { label: 'Volcanic', main: 'Volcanic' },
  { label: 'Webbed', main: 'Exotic' },
  { label: 'Wind-swept', main: 'Barren' },
  { label: 'Wintry', main: 'Frozen' },
];

/* ------------------------------------------------------------
   3. APP STATE
   ------------------------------------------------------------ */

const GLYPH_CHARS = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
const ADDRESS_LENGTH = 12;
const GLYPH_IMG_DIR = 'images/glyphs/';
const PRIORITY_OPTIONS = ['1', '2', '3', '4', '5'];
const CSV_SUGGESTED_NAME = 'visitedplanets.csv';

let rows = [];              // current Firestore rows for the active view
let builderDigits = [];     // digits currently in the glyph builder
let sortMode = 'time';      // 'time' | 'priority' | 'biome' — display order only
let viewMode = 'mine';      // 'mine' | 'all'
let currentUser = null;     // Firebase Auth user, once signed in
let currentNickname = '';
let unsubscribePlanets = null;
let editingIds = new Set(); // row ids currently unlocked for editing (owner only)

/* ------------------------------------------------------------
   4. AUTH / PROFILE
   ------------------------------------------------------------ */

function setSignedOutUi() {
  document.body.classList.add('signed-out');
  document.getElementById('auth-gate-error').textContent = '';
}

async function setSignedInUi(user) {
  document.body.classList.remove('signed-out');
  let profile;
  try {
    profile = await window.NMSFirebase.ensureUserDoc(user);
  } catch (err) {
    console.error('[visited planets] Could not set up profile:', err);
    document.getElementById('auth-gate-error').textContent =
      'Could not set up your profile — try reloading the page.';
    document.body.classList.add('signed-out');
    return;
  }
  currentUser = user;
  currentNickname = profile.nickname;
  document.getElementById('profile-nickname').textContent = currentNickname;
  document.getElementById('edit-nickname-btn').style.display = profile.nicknameEdited ? 'none' : '';
  startPlanetsSubscription();
}

function initAuthUi() {
  document.getElementById('google-signin-btn').addEventListener('click', async () => {
    document.getElementById('auth-gate-error').textContent = '';
    try {
      await window.NMSFirebase.signIn();
    } catch (err) {
      console.error('[visited planets] Sign-in failed:', err);
      document.getElementById('auth-gate-error').textContent = 'Sign-in failed — try again.';
    }
  });

  document.getElementById('sign-out-btn').addEventListener('click', () => {
    window.NMSFirebase.signOut();
  });

  document.getElementById('edit-nickname-btn').addEventListener('click', () => {
    document.getElementById('nickname-edit-row').style.display = '';
    document.getElementById('nickname-input').value = currentNickname;
    document.getElementById('nickname-input').focus();
  });

  document.getElementById('cancel-nickname-btn').addEventListener('click', () => {
    document.getElementById('nickname-edit-row').style.display = 'none';
    document.getElementById('nickname-status').textContent = '';
  });

  document.getElementById('save-nickname-btn').addEventListener('click', handleSaveNickname);
}

async function handleSaveNickname() {
  const input = document.getElementById('nickname-input');
  const status = document.getElementById('nickname-status');
  const saveBtn = document.getElementById('save-nickname-btn');
  const val = input.value.trim();
  if (!val) {
    status.textContent = 'Enter a nickname.';
    return;
  }
  saveBtn.disabled = true;
  status.textContent = 'Saving…';
  const result = await window.NMSFirebase.changeNickname(currentUser.uid, val);
  saveBtn.disabled = false;
  if (!result.ok) {
    status.textContent = result.message; // e.g. "already taken — pick another"
    return;
  }
  currentNickname = result.nickname;
  document.getElementById('profile-nickname').textContent = currentNickname;
  document.getElementById('nickname-edit-row').style.display = 'none';
  document.getElementById('edit-nickname-btn').style.display = 'none';
  status.textContent = '';
}

/* ------------------------------------------------------------
   5. VIEW TOGGLE (My Registered / All Registered)
   ------------------------------------------------------------ */

function initViewToggle() {
  document.getElementById('view-mine-btn').addEventListener('click', () => setViewMode('mine'));
  document.getElementById('view-all-btn').addEventListener('click', () => setViewMode('all'));
}

function setViewMode(mode) {
  if (viewMode === mode) return;
  viewMode = mode;
  editingIds.clear();
  document.getElementById('view-mine-btn').classList.toggle('toggle-btn-active', mode === 'mine');
  document.getElementById('view-mine-btn').classList.toggle('secondary', mode !== 'mine');
  document.getElementById('view-all-btn').classList.toggle('toggle-btn-active', mode === 'all');
  document.getElementById('view-all-btn').classList.toggle('secondary', mode !== 'all');
  const table = document.querySelector('.planet-table');
  table.classList.toggle('mode-all', mode === 'all');
  table.classList.toggle('mode-mine', mode === 'mine');
  startPlanetsSubscription();
}

function startPlanetsSubscription() {
  if (!currentUser) return;
  if (unsubscribePlanets) unsubscribePlanets();
  setFileStatus('Loading…');
  unsubscribePlanets = window.NMSFirebase.subscribePlanets(currentUser.uid, viewMode, (fetchedRows, err) => {
    if (err) {
      setFileStatus('Could not load entries — check your connection.');
      return;
    }
    rows = fetchedRows;
    setFileStatus(rows.length + ' row' + (rows.length === 1 ? '' : 's') + ' loaded');
    renderTable();
  });
}

/* ------------------------------------------------------------
   6. Glyph helpers (builder box + read-only row glyphs)
   ------------------------------------------------------------ */

function glyphImgSrc(char) {
  return GLYPH_IMG_DIR + char.toUpperCase() + '.png';
}

function renderAddressGlyphs(container, address) {
  container.innerHTML = '';
  const chars = (address || '').toUpperCase().split('');
  for (const ch of chars) {
    if (!GLYPH_CHARS.includes(ch)) continue;
    const img = document.createElement('img');
    img.src = glyphImgSrc(ch);
    img.alt = ch;
    container.appendChild(img);
  }
}

/* ------------------------------------------------------------
   7. Dropdown builders
   ------------------------------------------------------------ */

function buildPriorityOptions(selectEl, selectedValue) {
  selectEl.innerHTML = '';
  for (const p of PRIORITY_OPTIONS) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    selectEl.appendChild(opt);
  }
  selectEl.value = selectedValue || '1';
}

function buildGalaxyOptions(selectEl, selectedValue) {
  selectEl.innerHTML = '';
  for (const g of GALAXIES) {
    const opt = document.createElement('option');
    opt.value = String(g.index);
    opt.textContent = g.index + ' — ' + g.name;
    selectEl.appendChild(opt);
  }
  if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
    selectEl.value = String(selectedValue);
    if (selectEl.value !== String(selectedValue)) {
      const opt = document.createElement('option');
      opt.value = String(selectedValue);
      opt.textContent = selectedValue + ' — (unnamed)';
      selectEl.appendChild(opt);
      selectEl.value = String(selectedValue);
    }
  }
}

function buildBiomeOptions(selectEl, selectedValue) {
  selectEl.innerHTML = '';
  for (const b of BIOMES) {
    const opt = document.createElement('option');
    opt.value = b.label;
    opt.textContent = b.main === b.label ? b.label : (b.label + ' (' + b.main + ')');
    selectEl.appendChild(opt);
  }
  if (selectedValue) {
    selectEl.value = selectedValue;
    if (selectEl.value !== selectedValue) {
      const opt = document.createElement('option');
      opt.value = selectedValue;
      opt.textContent = selectedValue + ' (custom)';
      selectEl.appendChild(opt);
      selectEl.value = selectedValue;
    }
  }
}

/* ------------------------------------------------------------
   8. Sorting (display order only — client-side over whatever
   Firestore just delivered for the active view)
   ------------------------------------------------------------ */

function getSortedRows() {
  const copy = rows.slice();
  if (sortMode === 'priority') {
    copy.sort((a, b) => Number(a.priority || 1) - Number(b.priority || 1));
  } else if (sortMode === 'biome') {
    copy.sort((a, b) => (a.biome || '').localeCompare(b.biome || ''));
  } else {
    // time-registered: most recently added first
    copy.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
  }
  return copy;
}

function initSortControls() {
  const radios = {
    time: document.getElementById('sort-time'),
    priority: document.getElementById('sort-priority'),
    biome: document.getElementById('sort-biome')
  };
  Object.entries(radios).forEach(([mode, radio]) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      sortMode = mode;
      renderTable();
    });
  });
}

/* ------------------------------------------------------------
   9. Table rendering
   ------------------------------------------------------------ */

function autoGrow(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderTable() {
  const tbody = document.getElementById('planet-tbody');
  tbody.innerHTML = '';

  if (rows.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-table-row';
    const td = document.createElement('td');
    td.colSpan = 8;
    td.textContent = viewMode === 'all'
      ? 'No planets registered by anyone yet.'
      : 'No planets logged yet. Build a portal address above and click "Add as new row" to start.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const row of getSortedRows()) {
    tbody.appendChild(buildRowEl(row));
  }
}

function replaceRowEl(row) {
  const tbody = document.getElementById('planet-tbody');
  const oldTr = tbody.querySelector('tr[data-id="' + row.id + '"]');
  const newTr = buildRowEl(row);
  if (oldTr) {
    oldTr.replaceWith(newTr);
  } else {
    tbody.appendChild(newTr);
  }
  return newTr;
}

function buildRowEl(row) {
  const tr = document.createElement('tr');
  tr.dataset.id = row.id;
  const isOwner = currentUser && row.uid === currentUser.uid;
  const editable = isOwner && editingIds.has(row.id);

  // Priority
  const tdPriority = document.createElement('td');
  tdPriority.className = 'col-priority';
  const prioritySelect = document.createElement('select');
  prioritySelect.className = 'row-priority';
  prioritySelect.disabled = !editable;
  buildPriorityOptions(prioritySelect, row.priority);
  prioritySelect.addEventListener('change', () => {
    window.NMSFirebase.updatePlanet(row.id, { priority: prioritySelect.value });
  });
  tdPriority.appendChild(prioritySelect);
  tr.appendChild(tdPriority);

  // Galaxy
  const tdGalaxy = document.createElement('td');
  const galSelect = document.createElement('select');
  galSelect.className = 'row-galaxy';
  galSelect.disabled = !editable;
  buildGalaxyOptions(galSelect, row.galaxy);
  galSelect.addEventListener('change', () => {
    window.NMSFirebase.updatePlanet(row.id, { galaxy: galSelect.value });
  });
  tdGalaxy.appendChild(galSelect);
  tr.appendChild(tdGalaxy);

  // Portal glyphs — read-only, fixed at row creation via the glyph builder
  const tdGlyphs = document.createElement('td');
  tdGlyphs.className = 'col-glyphs';
  const glyphsWrap = document.createElement('div');
  glyphsWrap.className = 'row-glyphs';
  renderAddressGlyphs(glyphsWrap, row.address);
  tdGlyphs.appendChild(glyphsWrap);
  tr.appendChild(tdGlyphs);

  // Main biome
  const tdBiome = document.createElement('td');
  const biomeSelect = document.createElement('select');
  biomeSelect.className = 'row-biome';
  biomeSelect.disabled = !editable;
  buildBiomeOptions(biomeSelect, row.biome);
  biomeSelect.addEventListener('change', () => {
    window.NMSFirebase.updatePlanet(row.id, { biome: biomeSelect.value });
  });
  tdBiome.appendChild(biomeSelect);
  tr.appendChild(tdBiome);

  // By (nickname) — only meaningful/visible in "All Registered" mode
  const tdOwner = document.createElement('td');
  tdOwner.className = 'col-owner';
  tdOwner.textContent = row.nickname || '—';
  tr.appendChild(tdOwner);

  // Registered (date) — only meaningful/visible in "All Registered" mode
  const tdRegistered = document.createElement('td');
  tdRegistered.className = 'col-registered';
  tdRegistered.textContent = formatDate(row.dateAdded);
  tr.appendChild(tdRegistered);

  // Notes — unrestricted length, wraps and auto-grows to show full content
  const tdNotes = document.createElement('td');
  tdNotes.className = 'col-notes';
  const notesArea = document.createElement('textarea');
  notesArea.rows = 1;
  notesArea.value = row.notes || '';
  notesArea.placeholder = 'Why revisit this one…';
  notesArea.disabled = !editable;
  notesArea.addEventListener('input', () => autoGrow(notesArea));
  notesArea.addEventListener('change', () => {
    window.NMSFirebase.updatePlanet(row.id, { notes: notesArea.value });
  });
  tdNotes.appendChild(notesArea);
  tr.appendChild(tdNotes);
  requestAnimationFrame(() => autoGrow(notesArea));

  // Actions: Edit/Done + Delete — owner only, hidden entirely for other
  // users' rows when viewing "All Registered"
  const tdActions = document.createElement('td');
  tdActions.className = 'col-actions row-save-cell';

  if (isOwner) {
    if (editable) {
      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'icon-button';
      doneBtn.title = 'Done editing';
      doneBtn.textContent = '✔';
      doneBtn.addEventListener('click', () => {
        editingIds.delete(row.id);
        replaceRowEl(row);
      });
      tdActions.appendChild(doneBtn);
    } else {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'icon-button';
      editBtn.title = 'Edit row';
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', () => {
        editingIds.add(row.id);
        replaceRowEl(row);
      });
      tdActions.appendChild(editBtn);
    }

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-button icon-button-danger';
    delBtn.title = 'Delete row';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', async () => {
      if (!confirm('Delete this planet entry? This cannot be undone.')) return;
      delBtn.disabled = true;
      try {
        await window.NMSFirebase.deletePlanet(row.id);
      } catch (err) {
        console.error('[visited planets] Delete failed:', err);
        delBtn.disabled = false;
      }
    });
    tdActions.appendChild(delBtn);
  }

  tr.appendChild(tdActions);

  return tr;
}

/* ------------------------------------------------------------
   10. Glyph builder (box above the table)
   ------------------------------------------------------------ */

function renderBuilder() {
  const slotsWrap = document.getElementById('builder-slots');
  slotsWrap.innerHTML = '';
  for (let i = 0; i < ADDRESS_LENGTH; i++) {
    const slot = document.createElement('div');
    slot.className = 'glyph-slot';
    if (i === builderDigits.length) slot.classList.add('glyph-slot-current');
    if (builderDigits[i]) {
      const img = document.createElement('img');
      img.src = glyphImgSrc(builderDigits[i]);
      img.alt = builderDigits[i];
      slot.appendChild(img);
    }
    slotsWrap.appendChild(slot);
  }

  const codeEl = document.getElementById('builder-code');
  const code = builderDigits.join('');
  codeEl.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'code-label';
  label.textContent = 'Code:';
  codeEl.appendChild(label);
  codeEl.appendChild(document.createTextNode(' ' + (code || '—')));

  const addBtn = document.getElementById('builder-add-row');
  addBtn.disabled = builderDigits.length !== ADDRESS_LENGTH || !currentUser;
}

function buildPalette() {
  const palette = document.getElementById('glyph-palette');
  palette.innerHTML = '';
  for (const ch of GLYPH_CHARS) {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'glyph-key';
    key.title = 'Glyph ' + ch;
    const img = document.createElement('img');
    img.src = glyphImgSrc(ch);
    img.alt = ch;
    key.appendChild(img);
    key.addEventListener('click', () => {
      if (builderDigits.length >= ADDRESS_LENGTH) return;
      builderDigits.push(ch);
      renderBuilder();
    });
    palette.appendChild(key);
  }
}

function initBuilderControls() {
  document.getElementById('builder-backspace').addEventListener('click', () => {
    builderDigits.pop();
    renderBuilder();
  });
  document.getElementById('builder-clear').addEventListener('click', () => {
    builderDigits = [];
    renderBuilder();
  });
  document.getElementById('builder-add-row').addEventListener('click', async () => {
    if (builderDigits.length !== ADDRESS_LENGTH || !currentUser) return;
    const addBtn = document.getElementById('builder-add-row');
    addBtn.disabled = true;
    try {
      // New entries always land in "My Registered" — switch there if
      // the person was looking at "All Registered" so they see it land.
      if (viewMode !== 'mine') setViewMode('mine');
      await window.NMSFirebase.addPlanet(currentUser.uid, currentNickname, {
        priority: '1',
        galaxy: GALAXIES.length ? String(GALAXIES[0].index) : '',
        address: builderDigits.join(''),
        biome: BIOMES.length ? BIOMES[0].label : '',
        notes: '',
        dateAdded: new Date().toISOString()
      });
      builderDigits = [];
      renderBuilder();
    } catch (err) {
      console.error('[visited planets] Failed to add row:', err);
      alert('Could not save this entry — try again.');
    }
    addBtn.disabled = builderDigits.length !== ADDRESS_LENGTH;
  });
}

/* ------------------------------------------------------------
   11. Legacy CSV import (one-time, via File System Access API)
   ------------------------------------------------------------ */

function setFileStatus(text) {
  document.getElementById('file-status').textContent = text;
}

function csvEscape(value) {
  const str = String(value === undefined || value === null ? '' : value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function parseCsv(text) {
  const table = [];
  let field = '', record = [], inQuotes = false;
  const pushField = () => { record.push(field); field = ''; };
  const pushRecord = () => { pushField(); table.push(record); record = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') { inQuotes = true; }
    else if (c === ',') { pushField(); }
    else if (c === '\r') { /* skip */ }
    else if (c === '\n') { pushRecord(); }
    else { field += c; }
  }
  if (field !== '' || record.length) pushRecord();
  return table.filter(r => !(r.length === 1 && r[0] === ''));
}

function parseGalaxyFromLabel(label) {
  const match = String(label || '').trim().match(/^(\d+)/);
  return match ? match[1] : '';
}

function rowsFromCsvText(text) {
  const table = parseCsv(text);
  if (table.length < 2) return [];
  return table.slice(1).map(cols => ({
    priority: cols[0] || '1',
    galaxy: parseGalaxyFromLabel(cols[1]),
    address: (cols[2] || '').toUpperCase(),
    biome: cols[3] || (BIOMES.length ? BIOMES[0].label : ''),
    notes: cols[4] || '',
    dateAdded: cols[5] || new Date().toISOString()
  }));
}

function initImportButton() {
  document.getElementById('import-csv-btn').addEventListener('click', handleImportClick);
}

async function handleImportClick() {
  if (!currentUser) return;
  if (!window.showOpenFilePicker) {
    setFileStatus('Direct file access isn\'t supported in this browser — use Chrome or Edge.');
    return;
  }
  const btn = document.getElementById('import-csv-btn');
  btn.disabled = true;
  try {
    const [handle] = await window.showOpenFilePicker({
      suggestedName: CSV_SUGGESTED_NAME,
      types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
      excludeAcceptAllOption: false
    });
    const file = await handle.getFile();
    const text = await file.text();
    const parsedRows = rowsFromCsvText(text);
    setFileStatus('Importing ' + parsedRows.length + ' row(s)…');
    const added = await window.NMSFirebase.importRows(currentUser.uid, currentNickname, parsedRows);
    setFileStatus('Imported ' + added + ' new row(s) from ' + file.name +
      (added < parsedRows.length ? ' (' + (parsedRows.length - added) + ' already present, skipped)' : ''));
  } catch (err) {
    if (err && err.name === 'AbortError') {
      btn.disabled = false;
      return; // user cancelled the picker
    }
    console.error('[visited planets] CSV import failed:', err);
    setFileStatus('Import failed — try again.');
  }
  btn.disabled = false;
}

/* ------------------------------------------------------------
   12. Init
   ------------------------------------------------------------ */

function init() {
  buildPalette();
  initBuilderControls();
  initSortControls();
  initViewToggle();
  initImportButton();
  initAuthUi();
  renderBuilder();
  renderTable();

  setSignedOutUi();

  window.NMSFirebase.onAuthStateChanged(async (user) => {
    if (user) {
      await setSignedInUi(user);
      renderBuilder(); // re-check the "Add as new row" enabled state
    } else {
      currentUser = null;
      currentNickname = '';
      editingIds.clear();
      if (unsubscribePlanets) { unsubscribePlanets(); unsubscribePlanets = null; }
      rows = [];
      renderTable();
      renderBuilder();
      setSignedOutUi();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
