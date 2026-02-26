// ── Conversion data ──────────────────────────────────────────────
const CATEGORIES = {
    length: {
        label: 'Longueur',
        units: {
            mm: { label: 'mm', factor: 0.001 },
            cm: { label: 'cm', factor: 0.01 },
            m: { label: 'm', factor: 1 },
            km: { label: 'km', factor: 1000 },
            in: { label: 'in', factor: 0.0254 },
            ft: { label: 'ft', factor: 0.3048 },
            yd: { label: 'yd', factor: 0.9144 },
            mi: { label: 'mi', factor: 1609.344 },
        }
    },
    mass: {
        label: 'Masse',
        units: {
            mg: { label: 'mg', factor: 1e-6 },
            g: { label: 'g', factor: 0.001 },
            kg: { label: 'kg', factor: 1 },
            t: { label: 't', factor: 1000 },
            oz: { label: 'oz', factor: 0.028349 },
            lb: { label: 'lb', factor: 0.453592 },
        }
    },
    temp: {
        label: 'Temp.',
        units: {
            C: { label: '°C', factor: null },
            F: { label: '°F', factor: null },
            K: { label: 'K', factor: null },
        }
    },
    volume: {
        label: 'Volume',
        units: {
            ml: { label: 'mL', factor: 0.001 },
            cl: { label: 'cL', factor: 0.01 },
            l: { label: 'L', factor: 1 },
            m3: { label: 'm³', factor: 1000 },
            fl_oz: { label: 'fl oz', factor: 0.029573 },
            cup: { label: 'cup', factor: 0.236588 },
            pt: { label: 'pt', factor: 0.473176 },
            gal: { label: 'gal', factor: 3.785411 },
        }
    },
    area: {
        label: 'Surface',
        units: {
            mm2: { label: 'mm²', factor: 1e-6 },
            cm2: { label: 'cm²', factor: 1e-4 },
            m2: { label: 'm²', factor: 1 },
            km2: { label: 'km²', factor: 1e6 },
            ha: { label: 'ha', factor: 1e4 },
            in2: { label: 'in²', factor: 6.4516e-4 },
            ft2: { label: 'ft²', factor: 0.092903 },
            acre: { label: 'acre', factor: 4046.856 },
        }
    },
    speed: {
        label: 'Vitesse',
        units: {
            ms: { label: 'm/s', factor: 1 },
            kmh: { label: 'km/h', factor: 1 / 3.6 },
            mph: { label: 'mph', factor: 0.44704 },
            kn: { label: 'nœud', factor: 0.514444 },
        }
    },
    time: {
        label: 'Temps',
        units: {
            ms_t: { label: 'ms', factor: 0.001 },
            s: { label: 's', factor: 1 },
            min: { label: 'min', factor: 60 },
            h: { label: 'h', factor: 3600 },
            d: { label: 'j', factor: 86400 },
            wk: { label: 'sem.', factor: 604800 },
        }
    },
    data: {
        label: 'Données',
        units: {
            bit: { label: 'bit', factor: 1 },
            B: { label: 'octet', factor: 8 },
            KB: { label: 'Ko', factor: 8192 },
            MB: { label: 'Mo', factor: 8388608 },
            GB: { label: 'Go', factor: 8589934592 },
            TB: { label: 'To', factor: 8796093022208 },
        }
    },
};

// ── State ─────────────────────────────────────────────────────────
let currentCategory = 'length';
let fromUnit = 'm';
let toUnit = 'km';
let activeField = 'from';   // which input is the "source"
let fromRaw = '';           // current string being typed

// ── DOM refs ──────────────────────────────────────────────────────
const fromInput = document.getElementById('from-input');
const toInput = document.getElementById('to-input');
const fromSelect = document.getElementById('from-unit');
const toSelect = document.getElementById('to-unit');

// ── Build tabs ────────────────────────────────────────────────────
function buildTabs() {
    const container = document.getElementById('tabs');
    container.innerHTML = '';
    for (const [key, cat] of Object.entries(CATEGORIES)) {
        const btn = document.createElement('button');
        btn.className = 'tab' + (key === currentCategory ? ' active' : '');
        btn.textContent = cat.label;
        btn.onclick = () => selectCategory(key);
        container.appendChild(btn);
    }
}

// ── Build unit selects ────────────────────────────────────────────
function buildSelects() {
    const units = CATEGORIES[currentCategory].units;
    const keys = Object.keys(units);

    // default: first two units
    fromUnit = keys[0];
    toUnit = keys[1] || keys[0];

    [fromSelect, toSelect].forEach((sel, idx) => {
        sel.innerHTML = '';
        for (const [k, u] of Object.entries(units)) {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = u.label;
            sel.appendChild(opt);
        }
        sel.value = idx === 0 ? fromUnit : toUnit;
    });

    fromSelect.onchange = () => { fromUnit = fromSelect.value; convert(); };
    toSelect.onchange = () => { toUnit = toSelect.value; convert(); };
}

// ── Category change ───────────────────────────────────────────────
function selectCategory(key) {
    currentCategory = key;
    fromRaw = '';
    fromInput.value = '';
    toInput.value = '';
    activeField = 'from';
    buildTabs();
    buildSelects();
}

// ── Temperature helpers ────────────────────────────────────────────
function convertTemp(value, from, to) {
    // Convert to Celsius first
    let c;
    if (from === 'C') c = value;
    else if (from === 'F') c = (value - 32) * 5 / 9;
    else if (from === 'K') c = value - 273.15;

    if (to === 'C') return c;
    if (to === 'F') return c * 9 / 5 + 32;
    if (to === 'K') return c + 273.15;
}

// ── Conversion logic ───────────────────────────────────────────────
function convert() {
    const src = activeField === 'from' ? fromInput : toInput;
    const dest = activeField === 'from' ? toInput : fromInput;
    const sUnit = activeField === 'from' ? fromUnit : toUnit;
    const dUnit = activeField === 'from' ? toUnit : fromUnit;

    const val = parseFloat(src.value);
    if (isNaN(val) || src.value.trim() === '') { dest.value = ''; return; }

    let result;
    if (currentCategory === 'temp') {
        result = convertTemp(val, sUnit, dUnit);
    } else {
        const units = CATEGORIES[currentCategory].units;
        const inSI = val * units[sUnit].factor;
        result = inSI / units[dUnit].factor;
    }

    // Pretty formatting
    const abs = Math.abs(result);
    let display;
    if (abs === 0) display = '0';
    else if (abs >= 1e10 || (abs < 1e-4 && abs > 0)) display = result.toExponential(4);
    else display = +result.toPrecision(8) + '';

    dest.value = display;
}

// ── Numpad input ───────────────────────────────────────────────────
function setActive(field) {
    activeField = field;
    fromInput.style.outline = field === 'from' ? '1px dotted #000' : 'none';
    toInput.style.outline = field === 'to' ? '1px dotted #000' : 'none';
}

fromInput.addEventListener('focus', () => setActive('from'));
toInput.addEventListener('focus', () => setActive('to'));

function getRaw() {
    return activeField === 'from' ? fromInput.value : toInput.value;
}

function setRaw(v) {
    if (activeField === 'from') fromInput.value = v;
    else toInput.value = v;
    convert();
}

function appendNum(ch) {
    let cur = getRaw();
    if (ch === '.' && cur.includes('.')) return;
    if (cur === '0' && ch !== '.') cur = ch;
    else cur += ch;
    setRaw(cur);
}

function doClear() {
    fromInput.value = '';
    toInput.value = '';
    setActive('from');
}

function doBackspace() {
    let cur = getRaw();
    cur = cur.slice(0, -1) || '';
    setRaw(cur);
}

function doNegate() {
    let cur = getRaw();
    if (!cur || cur === '0') return;
    cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur;
    setRaw(cur);
}

function doSwap() {
    // Swap units
    const tmp = fromUnit; fromUnit = toUnit; toUnit = tmp;
    fromSelect.value = fromUnit;
    toSelect.value = toUnit;
    // Swap values
    const tmpV = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmpV;
    // Update active field
    activeField = activeField === 'from' ? 'to' : 'from';
    setActive(activeField);
    convert();
}

// ── Keyboard ───────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'SELECT') return;
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') appendNum(e.key);
    else if (e.key === 'Backspace') doBackspace();
    else if (e.key === 'Escape') doClear();
    else if (e.key === 'Tab') {
        e.preventDefault();
        setActive(activeField === 'from' ? 'to' : 'from');
    }
});

// ── Init ───────────────────────────────────────────────────────────
buildTabs();
buildSelects();
setActive('from');
