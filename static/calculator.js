(() => {
  const display = document.getElementById('display');
  const expression = document.getElementById('expression');
  const error = document.getElementById('calcError');
  const keypad = document.getElementById('keypad');
  const angleMode = document.getElementById('angleMode');
  const historyList = document.getElementById('historyList');
  const historyToggle = document.getElementById('historyToggle');
  const clearHistory = document.getElementById('clearHistory');
  let justEvaluated = false;
  let answer = 0;
  let history = [];

  function insert(value) {
    error.textContent = '';
    const start = display.selectionStart ?? display.value.length;
    const end = display.selectionEnd ?? display.value.length;
    let current = display.value === '0' || (justEvaluated && /^[0-9.(πe]/.test(value)) ? '' : display.value;
    let next = current.slice(0, start) + value + current.slice(end);
    display.value = next || '0';
    const cursor = (current.slice(0, start) + value).length;
    display.focus();
    display.setSelectionRange(cursor, cursor);
    justEvaluated = false;
  }

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error('Factorial needs an integer from 0 to 170.');
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  // Tokenize and parse explicitly; user-entered text is never passed to eval or Function.
  function tokenize(input) {
    const s = input.replace(/π/g, 'pi').replace(/×/g, '*').replace(/÷/g, '/');
    const tokens = [];
    const re = /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:([eE][+-]?\d+))?|([A-Za-z]+)|(.) )/y;
    let i = 0;
    while (i < s.length) {
      if (/\s/.test(s[i])) { i++; continue; }
      const rest = s.slice(i);
      const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);
      if (number) { tokens.push({type:'number', value:Number(number[0])}); i += number[0].length; continue; }
      const word = /^[A-Za-z]+/.exec(rest);
      if (word) { tokens.push({type:'word', value:word[0].toLowerCase()}); i += word[0].length; continue; }
      const ch = s[i];
      if ('+-*/^()%!'.includes(ch)) { tokens.push({type:ch, value:ch}); i++; continue; }
      throw new Error(`Unsupported character: ${ch}`);
    }
    tokens.push({type:'eof'});
    return tokens;
  }

  function evaluate(input) {
    const tokens = tokenize(input);
    let pos = 0;
    const peek = () => tokens[pos];
    const take = (type) => {
      if (peek().type !== type) throw new Error(`Expected "${type}"`);
      return tokens[pos++];
    };
    const trig = (name, x) => {
      const v = angleMode.value === 'DEG' ? x * Math.PI / 180 : x;
      if (name === 'sin') return Math.sin(v);
      if (name === 'cos') return Math.cos(v);
      if (name === 'tan') {
        if (Math.abs(Math.cos(v)) < 1e-12) throw new Error('Tangent is undefined at this angle.');
        return Math.tan(v);
      }
    };
    const funcs = {
      sin: x => trig('sin', x), cos: x => trig('cos', x), tan: x => trig('tan', x),
      sqrt: x => { if (x < 0) throw new Error('Square root requires a non-negative value.'); return Math.sqrt(x); },
      log: x => { if (x <= 0) throw new Error('log requires a positive value.'); return Math.log10(x); },
      ln: x => { if (x <= 0) throw new Error('ln requires a positive value.'); return Math.log(x); },
      abs: x => Math.abs(x), exp: x => Math.exp(x)
    };
    function primary() {
      if (peek().type === '+') { take('+'); return unary(); }
      if (peek().type === '-') { take('-'); return -unary(); }
      if (peek().type === 'number') return take('number').value;
      if (peek().type === '(') { take('('); const v = add(); take(')'); return v; }
      if (peek().type === 'word') {
        const name = take('word').value;
        if (name === 'pi') return Math.PI;
        if (name === 'e') return Math.E;
        if (name === 'ans') return answer;
        if (funcs[name]) {
          take('('); const v = add(); take(')');
          return funcs[name](v);
        }
        throw new Error(`Unknown function or constant: ${name}`);
      }
      throw new Error('Check your expression.');
    }
    function postfix() {
      let v = primary();
      while (peek().type === '!' || peek().type === '%') {
        if (peek().type === '!') { take('!'); v = factorial(v); }
        else { take('%'); v /= 100; }
      }
      return v;
    }
    function power() {
      let v = postfix();
      if (peek().type === '^') { take('^'); v = Math.pow(v, unary()); }
      return v;
    }
    function unary() { return power(); }
    function multiply() {
      let v = unary();
      while (peek().type === '*' || peek().type === '/') {
        const op = tokens[pos++].type; const r = unary();
        if (op === '/' && r === 0) throw new Error('Cannot divide by zero.');
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function add() {
      let v = multiply();
      while (peek().type === '+' || peek().type === '-') {
        const op = tokens[pos++].type; const r = multiply();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    const result = add();
    if (peek().type !== 'eof') throw new Error('Check the expression near the end.');
    if (!Number.isFinite(result)) throw new Error('The result is outside the supported numeric range.');
    return result;
  }

  function format(n) {
    if (Object.is(n, -0)) n = 0;
    return Number(n.toPrecision(12)).toString();
  }
  function calculate() {
    const raw = display.value.trim();
    if (!raw || raw === '0') return;
    try {
      const result = evaluate(raw);
      answer = result;
      expression.textContent = raw + ' =';
      display.value = format(result);
      error.textContent = '';
      history.unshift(`${raw} = ${format(result)}`);
      history = history.slice(0, 30);
      renderHistory();
      justEvaluated = true;
    } catch (e) { error.textContent = e.message || 'Unable to calculate this expression.'; }
  }
  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      historyList.appendChild(li);
    });
  }
  function clear() { display.value = '0'; expression.textContent = ''; error.textContent = ''; justEvaluated = false; display.focus(); }
  keypad.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.dataset.action === 'clear') return clear();
    if (button.dataset.action === 'delete') {
      display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0';
      justEvaluated = false; error.textContent = ''; return;
    }
    if (button.dataset.action === 'equals') return calculate();
    insert(button.dataset.insert);
  });
  display.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
    if (e.key === 'Escape') { e.preventDefault(); clear(); }
  });
  historyToggle.addEventListener('click', () => { historyList.hidden = !historyList.hidden; });
  clearHistory.addEventListener('click', () => { history = []; renderHistory(); historyList.hidden = false; });
  // Make typed "pi" usable; normalize the visible pi symbol to parser's supported constant.
  display.addEventListener('input', () => { error.textContent = ''; });
})();
