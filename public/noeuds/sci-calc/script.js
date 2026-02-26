// State
let currentInput = '0';
let expression = '';
let justEvaluated = false;
let memory = 0;
let isDeg = true;

// DOM
const screen = document.getElementById('calc-screen');
const exprScreen = document.getElementById('expression-screen');

function updateDisplay(value) {
    // Truncate very long numbers for display
    let display = String(value);
    if (!isNaN(display) && display.includes('.') && display.length > 14) {
        display = parseFloat(display).toPrecision(10);
    }
    screen.value = display;
}

function updateExpression(text) {
    exprScreen.value = text;
}

// Append a digit or decimal point
function appendNumber(num) {
    if (justEvaluated) {
        currentInput = String(num);
        expression = '';
        justEvaluated = false;
    } else {
        if (num === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && num !== '.') {
            currentInput = String(num);
        } else {
            currentInput += num;
        }
    }
    updateDisplay(currentInput);
    updateExpression(expression + currentInput);
}

// Append an operator
function appendOperator(op) {
    justEvaluated = false;
    expression = expression + currentInput + ' ' + op + ' ';
    currentInput = '0';
    updateDisplay('0');
    updateExpression(expression);
}

// Evaluate
function calculate() {
    let full = expression + currentInput;
    if (!full.trim()) return;
    updateExpression(full + ' =');
    try {
        let result = Function('"use strict"; return (' + full + ')')();
        if (!isFinite(result)) result = 'Erreur';
        else result = +result.toPrecision(12); // clean floating point
        currentInput = String(result);
        expression = '';
        justEvaluated = true;
        updateDisplay(result);
    } catch (e) {
        updateDisplay('Erreur');
        currentInput = '0';
        expression = '';
        justEvaluated = true;
    }
}

// Clear all
function clearAll() {
    currentInput = '0';
    expression = '';
    justEvaluated = false;
    updateDisplay('0');
    updateExpression('');
}

// Clear entry (just current input)
function clearEntry() {
    currentInput = '0';
    updateDisplay('0');
    updateExpression(expression);
}

// Backspace
function backspace() {
    if (justEvaluated) { clearAll(); return; }
    if (currentInput.length <= 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay(currentInput);
    updateExpression(expression + currentInput);
}

// Toggle sign
function negate() {
    if (currentInput === '0') return;
    currentInput = String(-parseFloat(currentInput));
    updateDisplay(currentInput);
    updateExpression(expression + currentInput);
}

// Percent: current value as % of expression result
function percent() {
    let val = parseFloat(currentInput);
    val = val / 100;
    currentInput = String(val);
    updateDisplay(currentInput);
    updateExpression(expression + currentInput);
}

// Helper: convert to radians for trig
function toRad(x) {
    return isDeg ? x * Math.PI / 180 : x;
}

function fromRad(x) {
    return isDeg ? x * 180 / Math.PI : x;
}

// Scientific function
function sciFunc(fn) {
    let val = parseFloat(currentInput);
    let result;
    switch (fn) {
        case 'sin':  result = Math.sin(toRad(val)); break;
        case 'cos':  result = Math.cos(toRad(val)); break;
        case 'tan':  result = Math.tan(toRad(val)); break;
        case 'asin': result = fromRad(Math.asin(val)); break;
        case 'acos': result = fromRad(Math.acos(val)); break;
        case 'atan': result = fromRad(Math.atan(val)); break;
        case 'log':  result = Math.log10(val); break;
        case 'ln':   result = Math.log(val); break;
        case 'exp':  result = Math.exp(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'cbrt': result = Math.cbrt(val); break;
        case 'sq':   result = val * val; break;
        case 'cube': result = val * val * val; break;
        case 'inv':  result = 1 / val; break;
        case 'pow10': result = Math.pow(10, val); break;
        case 'fact':
            if (val < 0 || !Number.isInteger(val)) { result = NaN; break; }
            result = 1;
            for (let i = 2; i <= val; i++) result *= i;
            break;
        case 'abs':  result = Math.abs(val); break;
        case 'pi':   result = Math.PI; break;
        case 'e':    result = Math.E; break;
        default: return;
    }
    if (!isFinite(result) || isNaN(result)) {
        updateDisplay('Erreur');
        updateExpression(fn + '(' + val + ') =');
        currentInput = '0';
        justEvaluated = true;
        return;
    }
    result = +result.toPrecision(12);
    updateExpression(fn + '(' + val + ') =');
    currentInput = String(result);
    justEvaluated = true;
    updateDisplay(result);
}

// Power (x^y) – sets up operator
function powerOp() {
    expression = expression + currentInput + ' ** ';
    currentInput = '0';
    justEvaluated = false;
    updateDisplay('0');
    updateExpression(expression);
}

// Memory
function memStore()  { memory = parseFloat(currentInput); }
function memRecall() { currentInput = String(memory); justEvaluated = false; updateDisplay(currentInput); updateExpression(expression + currentInput); }
function memClear()  { memory = 0; }
function memAdd()    { memory += parseFloat(currentInput); }
function memSub()    { memory -= parseFloat(currentInput); }

// DEG / RAD toggle
function setMode(mode) {
    isDeg = (mode === 'DEG');
    document.getElementById('btn-deg').classList.toggle('active', isDeg);
    document.getElementById('btn-rad').classList.toggle('active', !isDeg);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    else if (e.key === '.') appendNumber('.');
    else if (e.key === '+') appendOperator('+');
    else if (e.key === '-') appendOperator('-');
    else if (e.key === '*') appendOperator('*');
    else if (e.key === '/') { e.preventDefault(); appendOperator('/'); }
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clearAll();
    else if (e.key === '%') percent();
});
