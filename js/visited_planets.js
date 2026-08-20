/* ============================================================
   XENO ARENA — Visited Planets
   visited_planets.js

   Single file containing:
     1. GALAXIES data
     2. BIOMES data
     3. Glyph builder + table app logic
     4. CSV saving (File System Access API, with download fallback)
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
   belongs to. Dropdown shows "Label (Main)".
   ------------------------------------------------------------ */

const BIOMES = [
  // --- Lush ---
  { label: 'Lush', main: 'Lush' },
  { label: 'Paradise', main: 'Lush' },
  { label: 'Verdant', main: 'Lush' },
  { label: 'Rainy', main: 'Lush' },
  { label: 'Tropical', main: 'Lush' },
  { label: 'Viridescent', main: 'Lush' },
  { label: 'Grassy', main: 'Lush' },
  { label: 'Temperate', main: 'Lush' },
  { label: 'Humid', main: 'Lush' },
  { label: 'Overgrown', main: 'Lush' },
  { label: 'Flourishing', main: 'Lush' },
  { label: 'Bountiful', main: 'Lush' },

  // --- Barren ---
  { label: 'Barren', main: 'Barren' },
  { label: 'Desert', main: 'Barren' },
  { label: 'Rocky', main: 'Barren' },
  { label: 'Bleak', main: 'Barren' },
  { label: 'Parched', main: 'Barren' },
  { label: 'Abandoned (Barren)', main: 'Barren' },
  { label: 'Dusty', main: 'Barren' },
  { label: 'Desolate (Barren)', main: 'Barren' },
  { label: 'Wind-swept', main: 'Barren' },

  // --- Dead ---
  { label: 'Dead', main: 'Dead' },
  { label: 'Airless', main: 'Dead' },
  { label: 'Empty', main: 'Dead' },
  { label: 'Desolate (Dead)', main: 'Dead' },
  { label: 'Lifeless', main: 'Dead' },
  { label: 'Forsaken', main: 'Dead' },
  { label: 'Life-Incompatible', main: 'Dead' },
  { label: 'Low Atmosphere', main: 'Dead' },
  { label: 'Abandoned (Dead)', main: 'Dead' },
  { label: 'Terraforming Catastrophe', main: 'Dead' },

  // --- Scorched ---
  { label: 'Scorched', main: 'Scorched' },
  { label: 'Charred', main: 'Scorched' },
  { label: 'Arid', main: 'Scorched' },
  { label: 'Hot', main: 'Scorched' },
  { label: 'Fiery', main: 'Scorched' },
  { label: 'Boiling', main: 'Scorched' },
  { label: 'Torrid', main: 'Scorched' },
  { label: 'Incandescent', main: 'Scorched' },
  { label: 'Scalding', main: 'Scorched' },

  // --- Frozen ---
  { label: 'Frozen', main: 'Frozen' },
  { label: 'Icy', main: 'Frozen' },
  { label: 'Frosty', main: 'Frozen' },
  { label: 'Snowy', main: 'Frozen' },
  { label: 'Glacial', main: 'Frozen' },
  { label: 'Permafrost', main: 'Frozen' },
  { label: 'Arctic', main: 'Frozen' },
  { label: 'Wintry', main: 'Frozen' },

  // --- Toxic ---
  { label: 'Toxic', main: 'Toxic' },
  { label: 'Caustic', main: 'Toxic' },
  { label: 'Acidic', main: 'Toxic' },
  { label: 'Poisonous', main: 'Toxic' },
  { label: 'Corrosive', main: 'Toxic' },
  { label: 'Venomous', main: 'Toxic' },
  { label: 'Noxious', main: 'Toxic' },
  { label: 'Fetid', main: 'Toxic' },

  // --- Irradiated / Radioactive ---
  { label: 'Irradiated', main: 'Irradiated' },
  { label: 'Radioactive', main: 'Irradiated' },
  { label: 'Contaminated', main: 'Irradiated' },
  { label: 'Nuclear', main: 'Irradiated' },
  { label: 'Isotopic', main: 'Irradiated' },
  { label: 'Decaying Nuclear', main: 'Irradiated' },
  { label: 'Gamma-Intensive', main: 'Irradiated' },
  { label: 'Supercritical', main: 'Irradiated' },

  // --- Marsh ---
  { label: 'Marsh', main: 'Marsh' },
  { label: 'Marshy', main: 'Marsh' },
  { label: 'Swamp', main: 'Marsh' },
  { label: 'Foggy', main: 'Marsh' },
  { label: 'Misty', main: 'Marsh' },
  { label: 'Boggy', main: 'Marsh' },
  { label: 'Quagmire', main: 'Marsh' },
  { label: 'Hazy', main: 'Marsh' },
  { label: 'Murky', main: 'Marsh' },
  { label: 'Damp', main: 'Marsh' },

  // --- Volcanic ---
  { label: 'Volcanic', main: 'Volcanic' },
  { label: 'Lava', main: 'Volcanic' },
  { label: 'Magma', main: 'Volcanic' },
  { label: 'Erupting', main: 'Volcanic' },
  { label: 'Ash-Shrouded', main: 'Volcanic' },
  { label: 'Ashen', main: 'Volcanic' },
  { label: 'Tectonic', main: 'Volcanic' },
  { label: 'Molten', main: 'Volcanic' },
  { label: 'Obsidian', main: 'Volcanic' },

  // --- Exotic ---
  { label: 'Exotic', main: 'Exotic' },
  { label: 'Anomalous', main: 'Exotic' },
  { label: 'Breached', main: 'Exotic' },
  { label: 'Foaming', main: 'Exotic' },
  { label: 'Glass', main: 'Exotic' },
  { label: 'Hex', main: 'Exotic' },
  { label: 'Webbed', main: 'Exotic' },
  { label: 'Nanophage', main: 'Exotic' },

  // --- Mega Exotic ---
  { label: 'Mega Exotic', main: 'Mega Exotic' },
  { label: 'Chromatic', main: 'Mega Exotic' },
  { label: 'Crimson', main: 'Mega Exotic' },
  { label: 'Azure', main: 'Mega Exotic' },
  { label: 'Monochrome', main: 'Mega Exotic' },
  { label: 'Doomed', main: 'Mega Exotic' },
  { label: 'Haunted', main: 'Mega Exotic' },
];

/* ------------------------------------------------------------
   3. APP LOGIC
   ------------------------------------------------------------ */

const GLYPH_CHARS = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
const ADDRESS_LENGTH = 12;
const LOCAL_CACHE_KEY = 'xenoArena.visitedPlanets.v1';
const NOTES_WORD_LIMIT = 30;
const GLYPH_IMG_DIR = 'images/glyphs/';

let rows = [];          // array of row objects, cached to localStorage as a safety net
let builderDigits = []; // digits currently in the glyph builder
let saveTimer = null;
let csvFileHandle = null; // File System Access API handle, once chosen

function makeId() {
    return 'row_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function makeEmptyRow() {
    return {
        id: makeId(),
        galaxy: GALAXIES.length ? String(GALAXIES[0].index) : '',
        address: '',
        biome: BIOMES.length ? BIOMES[0].label : '',
        outlaw: false,
        dissonant: false,
        notes: ''
    };
}

/* ---------------- Local cache (safety net only — the CSV file
   written via the Save buttons is the actual "save") ---------- */

function loadCachedRows() {
    try {
        const raw = localStorage.getItem(LOCAL_CACHE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('Failed to read local cache:', err);
        return [];
    }
}

function cacheRows() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try {
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(rows));
        } catch (err) {
            console.error('Failed to cache rows locally:', err);
        }
    }, 250);
}

/* ---------------- Glyph helpers (builder box only) ---------- */

function glyphImgSrc(char) {
    return GLYPH_IMG_DIR + char.toUpperCase() + '.png';
}

/* ---------------- Dropdown builders ---------------- */

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

/* ---------------- Table rendering ---------------- */

function countWords(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

function autoGrow(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

function findRow(id) {
    return rows.find(r => r.id === id);
}

function renderTable() {
    const tbody = document.getElementById('planet-tbody');
    tbody.innerHTML = '';

    if (rows.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'empty-table-row';
        const td = document.createElement('td');
        td.colSpan = 7;
        td.textContent = 'No planets logged yet. Use the glyph builder above, or click "Add row" to start.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    for (const row of rows) {
        tbody.appendChild(buildRowEl(row));
    }
}

function buildRowEl(row) {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;

    // Galaxy
    const tdGalaxy = document.createElement('td');
    const galSelect = document.createElement('select');
    galSelect.className = 'row-galaxy';
    buildGalaxyOptions(galSelect, row.galaxy);
    galSelect.addEventListener('change', () => {
        row.galaxy = galSelect.value;
        cacheRows();
    });
    tdGalaxy.appendChild(galSelect);
    tr.appendChild(tdGalaxy);

    // Portal address
    const tdAddress = document.createElement('td');
    const addrInput = document.createElement('input');
    addrInput.type = 'text';
    addrInput.className = 'address-input';
    addrInput.maxLength = ADDRESS_LENGTH;
    addrInput.placeholder = '12-digit hex';
    addrInput.value = row.address || '';
    addrInput.spellcheck = false;
    const validateAddr = () => {
        const clean = addrInput.value.trim().toUpperCase();
        const valid = clean === '' || /^[0-9A-F]{1,12}$/.test(clean);
        addrInput.classList.toggle('address-invalid', !valid);
    };
    addrInput.addEventListener('input', () => {
        addrInput.value = addrInput.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, ADDRESS_LENGTH);
        row.address = addrInput.value;
        validateAddr();
        cacheRows();
    });
    validateAddr();
    tdAddress.appendChild(addrInput);
    tr.appendChild(tdAddress);

    // Main biome
    const tdBiome = document.createElement('td');
    const biomeSelect = document.createElement('select');
    biomeSelect.className = 'row-biome';
    buildBiomeOptions(biomeSelect, row.biome);
    biomeSelect.addEventListener('change', () => {
        row.biome = biomeSelect.value;
        cacheRows();
    });
    tdBiome.appendChild(biomeSelect);
    tr.appendChild(tdBiome);

    // Outlaw
    const tdOutlaw = document.createElement('td');
    tdOutlaw.className = 'col-checkbox';
    const outlawCb = document.createElement('input');
    outlawCb.type = 'checkbox';
    outlawCb.checked = !!row.outlaw;
    outlawCb.addEventListener('change', () => {
        row.outlaw = outlawCb.checked;
        cacheRows();
    });
    tdOutlaw.appendChild(outlawCb);
    tr.appendChild(tdOutlaw);

    // Dissonant
    const tdDissonant = document.createElement('td');
    tdDissonant.className = 'col-checkbox';
    const dissonantCb = document.createElement('input');
    dissonantCb.type = 'checkbox';
    dissonantCb.checked = !!row.dissonant;
    dissonantCb.addEventListener('change', () => {
        row.dissonant = dissonantCb.checked;
        cacheRows();
    });
    tdDissonant.appendChild(dissonantCb);
    tr.appendChild(tdDissonant);

    // Notes
    const tdNotes = document.createElement('td');
    tdNotes.className = 'col-notes';
    const notesArea = document.createElement('textarea');
    notesArea.rows = 1;
    notesArea.value = row.notes || '';
    notesArea.placeholder = 'Why revisit this one…';
    const wordCount = document.createElement('div');
    wordCount.className = 'word-count';
    const updateWordCount = () => {
        const n = countWords(notesArea.value);
        wordCount.textContent = n + ' / ' + NOTES_WORD_LIMIT + ' words';
        wordCount.classList.toggle('word-count-over', n > NOTES_WORD_LIMIT);
    };
    notesArea.addEventListener('input', () => {
        row.notes = notesArea.value;
        autoGrow(notesArea);
        updateWordCount();
        cacheRows();
    });
    updateWordCount();
    tdNotes.appendChild(notesArea);
    tdNotes.appendChild(wordCount);
    tr.appendChild(tdNotes);
    requestAnimationFrame(() => autoGrow(notesArea));

    // Actions: Save (writes the whole table to the CSV file) + Duplicate + Delete
    const tdActions = document.createElement('td');
    tdActions.className = 'col-actions row-save-cell';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'icon-button';
    saveBtn.title = 'Save table to CSV file';
    saveBtn.textContent = '💾';

    const statusEl = document.createElement('span');
    statusEl.className = 'row-save-status';

    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        statusEl.textContent = 'Saving…';
        statusEl.className = 'row-save-status';
        const result = await saveRowsToCsvFile();
        statusEl.textContent = result.message;
        statusEl.classList.add(result.ok ? 'row-save-status-ok' : 'row-save-status-warn');
        saveBtn.disabled = false;
        setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'row-save-status'; }, 4000);
    });

    const dupBtn = document.createElement('button');
    dupBtn.type = 'button';
    dupBtn.className = 'icon-button';
    dupBtn.title = 'Duplicate row';
    dupBtn.textContent = '⧉';
    dupBtn.addEventListener('click', () => {
        const idx = rows.findIndex(r => r.id === row.id);
        const copy = Object.assign({}, row, { id: makeId() });
        rows.splice(idx + 1, 0, copy);
        cacheRows();
        renderTable();
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-button icon-button-danger';
    delBtn.title = 'Delete row';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
        if (!confirm('Delete this planet entry? This cannot be undone.')) return;
        rows = rows.filter(r => r.id !== row.id);
        cacheRows();
        renderTable();
    });

    tdActions.appendChild(saveBtn);
    tdActions.appendChild(dupBtn);
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
        const row = makeEmptyRow();
        row.address = builderDigits.join('');
        rows.unshift(row);
        cacheRows();
        renderTable();
        builderDigits = [];
        renderBuilder();
        const newTr = document.querySelector('#planet-tbody tr[data-id="' + row.id + '"]');
        if (newTr) newTr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/* ---------------- Toolbar: add row / clear all / choose file ---------------- */

function initToolbar() {
    document.getElementById('add-row-btn').addEventListener('click', () => {
        rows.unshift(makeEmptyRow());
        cacheRows();
        renderTable();
    });

    document.getElementById('clear-all-btn').addEventListener('click', () => {
        if (rows.length === 0) return;
        if (!confirm('Delete ALL ' + rows.length + ' planet entries? This cannot be undone. Save to CSV first if you want a backup.')) return;
        rows = [];
        cacheRows();
        renderTable();
    });

    const chooseBtn = document.getElementById('choose-file-btn');
    if (window.showSaveFilePicker) {
        chooseBtn.addEventListener('click', async () => {
            await ensureCsvFileHandle(true);
            updateFileStatus();
        });
    } else {
        chooseBtn.disabled = true;
        chooseBtn.title = 'Your browser does not support choosing a file to overwrite directly (Chrome/Edge only). Save will download a new file instead.';
    }
    updateFileStatus();
}

function updateFileStatus() {
    const el = document.getElementById('file-status');
    if (!window.showSaveFilePicker) {
        el.textContent = 'Direct file save not supported in this browser — Save will download a CSV each time.';
        return;
    }
    el.textContent = csvFileHandle
        ? ('Saving to: ' + (csvFileHandle.name || 'chosen file'))
        : 'No file chosen yet — first Save will ask you to pick or create one.';
}

/* ---------------- CSV saving ---------------- */

function csvEscape(value) {
    const str = String(value === undefined || value === null ? '' : value);
    if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function buildCsv() {
    const header = ['Galaxy', 'PortalAddress', 'MainBiome', 'Outlaw', 'Dissonant', 'Notes'];
    const lines = [header.join(',')];
    for (const row of rows) {
        const galaxyEntry = GALAXIES.find(g => String(g.index) === String(row.galaxy));
        const galaxyLabel = galaxyEntry ? (galaxyEntry.index + ' - ' + galaxyEntry.name) : row.galaxy;
        lines.push([
            csvEscape(galaxyLabel),
            csvEscape(row.address),
            csvEscape(row.biome),
            csvEscape(row.outlaw ? 'yes' : 'no'),
            csvEscape(row.dissonant ? 'yes' : 'no'),
            csvEscape(row.notes)
        ].join(','));
    }
    return lines.join('\r\n');
}

async function ensureCsvFileHandle(forcePrompt) {
    if (csvFileHandle && !forcePrompt) return csvFileHandle;
    if (!window.showSaveFilePicker) return null;
    try {
        csvFileHandle = await window.showSaveFilePicker({
            suggestedName: 'xeno-arena-visited-planets.csv',
            types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }]
        });
        return csvFileHandle;
    } catch (err) {
        // User cancelled the picker — not an error
        return null;
    }
}

function downloadCsv(csvText) {
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xeno-arena-visited-planets.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function saveRowsToCsvFile() {
    const csv = buildCsv();

    if (window.showSaveFilePicker) {
        const handle = await ensureCsvFileHandle(false);
        updateFileStatus();
        if (handle) {
            try {
                const writable = await handle.createWritable();
                await writable.write(csv);
                await writable.close();
                return { ok: true, message: 'Saved ✓' };
            } catch (err) {
                console.error('Direct file write failed:', err);
                downloadCsv(csv);
                return { ok: false, message: 'Write failed — downloaded instead' };
            }
        }
        // User cancelled the file picker
        return { ok: false, message: 'Cancelled — nothing saved' };
    }

    downloadCsv(csv);
    return { ok: true, message: 'Downloaded ✓' };
}

/* ---------------- Init ---------------- */

function init() {
    rows = loadCachedRows();
    buildPalette();
    initBuilderControls();
    initToolbar();
    renderBuilder();
    renderTable();
}

document.addEventListener('DOMContentLoaded', init);
