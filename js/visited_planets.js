/* ============================================================
   XENO ARENA — Visited Planets
   visited_planets.js

   Single file containing:
     1. GALAXIES data
     2. BIOMES data
     3. Glyph builder + table app logic
     4. CSV load/save (File System Access API)
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
   3. APP LOGIC
   ------------------------------------------------------------ */

const GLYPH_CHARS = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
const ADDRESS_LENGTH = 12;
const GLYPH_IMG_DIR = 'images/glyphs/';
const PRIORITY_OPTIONS = ['1', '2', '3', '4', '5'];
const CSV_SUGGESTED_NAME = 'visitedplanets.csv';
const HANDLE_DB_NAME = 'VisitedPlanetsDB';
const HANDLE_DB_STORE = 'handles';
const HANDLE_DB_KEY = 'csvFileHandle';

let rows = [];            // array of row objects — the linked CSV file is the source of truth
let builderDigits = [];   // digits currently in the glyph builder
let csvFileHandle = null; // File System Access API handle, once linked
let sortMode = 'time';    // 'time' | 'priority' | 'biome' — display order only

function makeId() {
    return 'row_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function makeEmptyRow(address) {
    return {
        id: makeId(),
        priority: '1',
        galaxy: GALAXIES.length ? String(GALAXIES[0].index) : '',
        address: address || '',
        biome: BIOMES.length ? BIOMES[0].label : '',
        notes: '',
        dateAdded: new Date().toISOString(),
        locked: false,   // unlocked rows render as directly editable
        everSaved: false // true once this row has been written to the linked file at least once
    };
}

/* ---------------- Linked file handle storage (IndexedDB) ----
   The browser can't silently touch an arbitrary local file, so
   the first time you use this page you pick data/visitedplanets.csv
   once via the Connect button. The resulting file handle is kept
   in IndexedDB so future visits can read/write it without any
   picker, as long as the browser still remembers the permission
   grant (it may need re-granting after a browser restart).
   ------------------------------------------------------------ */

function openHandleDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(HANDLE_DB_NAME, 1);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(HANDLE_DB_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getStoredHandle() {
    try {
        const db = await openHandleDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(HANDLE_DB_STORE, 'readonly');
            const req = tx.objectStore(HANDLE_DB_STORE).get(HANDLE_DB_KEY);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch (err) {
        console.error('[visited planets] Failed to read stored file handle:', err);
        return null;
    }
}

async function setStoredHandle(handle) {
    try {
        const db = await openHandleDb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(HANDLE_DB_STORE, 'readwrite');
            tx.objectStore(HANDLE_DB_STORE).put(handle, HANDLE_DB_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (err) {
        console.error('[visited planets] Failed to store file handle:', err);
    }
}

async function clearStoredHandle() {
    try {
        const db = await openHandleDb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(HANDLE_DB_STORE, 'readwrite');
            tx.objectStore(HANDLE_DB_STORE).delete(HANDLE_DB_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (err) {
        console.error('[visited planets] Failed to clear stored file handle:', err);
    }
}

async function verifyPermission(handle, requestIfNeeded) {
    const opts = { mode: 'readwrite' };
    try {
        if ((await handle.queryPermission(opts)) === 'granted') return true;
    } catch (err) {
        console.error('[visited planets] Permission query failed:', err);
        return false;
    }
    if (!requestIfNeeded) return false;
    try {
        return (await handle.requestPermission(opts)) === 'granted';
    } catch (err) {
        console.error('[visited planets] Permission request failed:', err);
        return false;
    }
}

/* ---------------- Glyph helpers (builder box + read-only row glyphs) ---------------- */

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

/* ---------------- Dropdown builders ---------------- */

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

/* ---------------- Sorting (display order only — never rewrites
   the underlying rows array, so the linked CSV file's insertion
   order is unaffected by whatever sort is currently shown) ------ */

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

/* ---------------- Table rendering ---------------- */

function autoGrow(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

function renderTable() {
    const tbody = document.getElementById('planet-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'empty-table-row';
        const td = document.createElement('td');
        td.colSpan = 6;
        td.textContent = 'No planets logged yet. Build a portal address above and click "Add as new row" to start.';
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
    const editable = !row.locked;

    // Priority
    const tdPriority = document.createElement('td');
    tdPriority.className = 'col-priority';
    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'row-priority';
    prioritySelect.disabled = !editable;
    buildPriorityOptions(prioritySelect, row.priority);
    prioritySelect.addEventListener('change', () => {
        row.priority = prioritySelect.value;
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
        row.galaxy = galSelect.value;
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
        row.biome = biomeSelect.value;
    });
    tdBiome.appendChild(biomeSelect);
    tr.appendChild(tdBiome);

    // Notes — unrestricted length, wraps and auto-grows to show full content
    const tdNotes = document.createElement('td');
    tdNotes.className = 'col-notes';
    const notesArea = document.createElement('textarea');
    notesArea.rows = 1;
    notesArea.value = row.notes || '';
    notesArea.placeholder = 'Why revisit this one…';
    notesArea.disabled = !editable;
    notesArea.addEventListener('input', () => {
        row.notes = notesArea.value;
        autoGrow(notesArea);
    });
    tdNotes.appendChild(notesArea);
    tr.appendChild(tdNotes);
    requestAnimationFrame(() => autoGrow(notesArea));

    // Actions: Edit/Save (depending on lock state) + Delete
    const tdActions = document.createElement('td');
    tdActions.className = 'col-actions row-save-cell';

    const statusEl = document.createElement('span');
    statusEl.className = 'row-save-status';

    const flashStatus = (message, ok) => {
        statusEl.textContent = message;
        statusEl.className = 'row-save-status ' + (ok ? 'row-save-status-ok' : 'row-save-status-warn');
        setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'row-save-status'; }, 4000);
    };

    if (editable) {
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'icon-button';
        saveBtn.title = 'Save this row to the linked CSV file';
        saveBtn.textContent = '💾';
        saveBtn.addEventListener('click', async () => {
            if (!row.address || row.address.length !== ADDRESS_LENGTH) {
                flashStatus('Portal address incomplete', false);
                return;
            }
            saveBtn.disabled = true;
            statusEl.textContent = 'Saving…';
            statusEl.className = 'row-save-status';
            const result = await writeCsvToLinkedFile();
            if (result.ok) {
                row.locked = true;
                row.everSaved = true;
                replaceRowEl(row);
                return;
            }
            saveBtn.disabled = false;
            flashStatus(result.message, false);
        });
        tdActions.appendChild(saveBtn);
    } else {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'icon-button';
        editBtn.title = 'Edit row';
        editBtn.textContent = '✎';
        editBtn.addEventListener('click', () => {
            row.locked = false;
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
        if (!row.everSaved) {
            rows = rows.filter(r => r.id !== row.id);
            renderTable();
            return;
        }
        delBtn.disabled = true;
        const prevRows = rows;
        rows = rows.filter(r => r.id !== row.id);
        const result = await writeCsvToLinkedFile();
        if (!result.ok) {
            rows = prevRows;
            delBtn.disabled = false;
            flashStatus(result.message, false);
            return;
        }
        renderTable();
    });

    tdActions.appendChild(delBtn);
    tdActions.appendChild(statusEl);
    tr.appendChild(tdActions);

    return tr;
}

/* ---------------- Glyph builder (box above the table) ---------------- */

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
    addBtn.disabled = builderDigits.length !== ADDRESS_LENGTH;
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
    document.getElementById('builder-add-row').addEventListener('click', () => {
        if (builderDigits.length !== ADDRESS_LENGTH) return;
        const row = makeEmptyRow(builderDigits.join(''));
        rows.unshift(row);
        renderTable();
        builderDigits = [];
        renderBuilder();
        const newTr = document.querySelector('#planet-tbody tr[data-id="' + row.id + '"]');
        if (newTr) newTr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/* ---------------- Toolbar: connect data file ---------------- */

function initToolbar() {
    document.getElementById('connect-file-btn').addEventListener('click', handleConnectClick);
}

async function handleConnectClick() {
    const btn = document.getElementById('connect-file-btn');
    btn.disabled = true;
    try {
        if (csvFileHandle) {
            // We already know the file — just re-request permission (small
            // browser prompt, not a file picker).
            const granted = await verifyPermission(csvFileHandle, true);
            if (granted) {
                await loadFromLinkedFile();
            } else {
                setFileStatus('Permission denied — click Reconnect to try again.');
            }
        } else {
            await connectToFile();
        }
    } catch (err) {
        console.error('[visited planets] Connect click failed:', err);
        setFileStatus('Something went wrong connecting — click Connect to retry.');
    }
    btn.disabled = false;
}

function setFileStatus(text) {
    document.getElementById('file-status').textContent = text;
}

function showConnectUi(label) {
    const btn = document.getElementById('connect-file-btn');
    btn.style.display = '';
    btn.textContent = label;
}

function hideConnectUi() {
    document.getElementById('connect-file-btn').style.display = 'none';
}

/* ---------------- CSV encode/decode ---------------- */

function csvEscape(value) {
    const str = String(value === undefined || value === null ? '' : value);
    if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function buildCsv() {
    const header = ['Priority', 'Galaxy', 'PortalAddress', 'MainBiome', 'Notes', 'DateAdded'];
    const lines = [header.join(',')];
    for (const row of rows) {
        const galaxyEntry = GALAXIES.find(g => String(g.index) === String(row.galaxy));
        const galaxyLabel = galaxyEntry ? (galaxyEntry.index + ' - ' + galaxyEntry.name) : row.galaxy;
        lines.push([
            csvEscape(row.priority),
            csvEscape(galaxyLabel),
            csvEscape(row.address),
            csvEscape(row.biome),
            csvEscape(row.notes),
            csvEscape(row.dateAdded)
        ].join(','));
    }
    return lines.join('\r\n');
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
        id: makeId(),
        priority: cols[0] || '1',
        galaxy: parseGalaxyFromLabel(cols[1]),
        address: (cols[2] || '').toUpperCase(),
        biome: cols[3] || (BIOMES.length ? BIOMES[0].label : ''),
        notes: cols[4] || '',
        dateAdded: cols[5] || '',
        locked: true,
        everSaved: true
    }));
}

/* ---------------- Linked file read/write ---------------- */

async function connectToFile() {
    if (!window.showOpenFilePicker) {
        setFileStatus('Direct file access isn\'t supported in this browser — use Chrome or Edge.');
        return;
    }
    try {
        const [handle] = await window.showOpenFilePicker({
            suggestedName: CSV_SUGGESTED_NAME,
            types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
            excludeAcceptAllOption: false
        });
        csvFileHandle = handle;
        await setStoredHandle(handle);
        await loadFromLinkedFile();
    } catch (err) {
        if (err && err.name === 'AbortError') return; // user cancelled the picker
        console.error('[visited planets] File picker failed:', err);
        setFileStatus('Could not open the file picker.');
    }
}

async function loadFromLinkedFile() {
    if (!csvFileHandle) return;
    const granted = await verifyPermission(csvFileHandle, true);
    if (!granted) {
        showConnectUi('Reconnect ' + CSV_SUGGESTED_NAME);
        setFileStatus('Permission needed to read ' + CSV_SUGGESTED_NAME + '.');
        return;
    }
    try {
        const file = await csvFileHandle.getFile();
        const text = await file.text();
        rows = rowsFromCsvText(text);
        console.log('[visited planets] Loaded', rows.length, 'row(s) from', file.name, '(', text.length, 'chars)');
    } catch (err) {
        console.error('[visited planets] Failed to read linked CSV file:', err);
        showConnectUi('Reconnect ' + CSV_SUGGESTED_NAME);
        setFileStatus('Could not read ' + CSV_SUGGESTED_NAME + ' — click Reconnect to try again.');
        return;
    }
    hideConnectUi();
    setFileStatus('Linked: ' + (csvFileHandle.name || CSV_SUGGESTED_NAME) + ' — ' + rows.length + ' row' + (rows.length === 1 ? '' : 's') + ' loaded');
    renderTable();
}

async function writeCsvToLinkedFile() {
    if (!csvFileHandle) return { ok: false, message: 'Not connected to a file' };
    const granted = await verifyPermission(csvFileHandle, true);
    if (!granted) return { ok: false, message: 'Permission denied' };
    try {
        const writable = await csvFileHandle.createWritable();
        await writable.write(buildCsv());
        await writable.close();
        return { ok: true, message: 'Saved ✓' };
    } catch (err) {
        console.error('[visited planets] Failed to write linked CSV file:', err);
        return { ok: false, message: 'Save failed' };
    }
}

/* ---------------- Init ---------------- */

async function connectOnLoad() {
    if (!window.showOpenFilePicker) {
        setFileStatus('Direct file access isn\'t supported in this browser — use Chrome or Edge to load/save ' + CSV_SUGGESTED_NAME + '.');
        return;
    }

    const stored = await getStoredHandle();
    if (!stored || typeof stored.getFile !== 'function') {
        if (stored) await clearStoredHandle(); // stale/invalid entry — drop it
        showConnectUi('Connect ' + CSV_SUGGESTED_NAME);
        setFileStatus('Not connected — click Connect to link data/' + CSV_SUGGESTED_NAME + ' (one-time).');
        return;
    }
    csvFileHandle = stored;
    const granted = await verifyPermission(csvFileHandle, false);
    if (granted) {
        await loadFromLinkedFile();
    } else {
        showConnectUi('Reconnect ' + CSV_SUGGESTED_NAME);
        setFileStatus('Permission needed to read ' + CSV_SUGGESTED_NAME + ' again.');
    }
}

async function init() {
    buildPalette();
    initBuilderControls();
    initToolbar();
    initSortControls();
    renderBuilder();
    renderTable();

    try {
        await connectOnLoad();
    } catch (err) {
        console.error('[visited planets] Unexpected error connecting to the data file:', err);
        showConnectUi('Connect ' + CSV_SUGGESTED_NAME);
        setFileStatus('Something went wrong connecting to ' + CSV_SUGGESTED_NAME + ' — click Connect to retry.');
    }
}

document.addEventListener('DOMContentLoaded', init);
