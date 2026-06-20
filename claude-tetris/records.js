'use strict';

// ── Records locales (localStorage) ────────────────────────────────────────────
// Estructura persistida en la clave 'tetris-records':
//   { scores: [{ name, score }, ...], bestCombo, maxLines }
// scores: top 5 ordenado desc por score.
// bestCombo: mejor combo VISIBLE conseguido (combo + 1), acumulado entre partidas.
// maxLines: líneas máximas en una sola partida, acumulado entre partidas.

const RECORDS_KEY = 'tetris-records';
const RECORDS_MAX = 5;

function loadRecords() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(RECORDS_KEY));
  } catch (e) {
    data = null;
  }
  if (!data || typeof data !== 'object') data = {};
  return {
    scores: Array.isArray(data.scores) ? data.scores : [],
    bestCombo: Number(data.bestCombo) || 0,
    maxLines: Number(data.maxLines) || 0,
  };
}

function saveRecords(data) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(data));
  } catch (e) { /* localStorage no disponible */ }
}

// Devuelve true si `score` entra en el top RECORDS_MAX.
function qualifies(score) {
  if (score <= 0) return false;
  const { scores } = loadRecords();
  if (scores.length < RECORDS_MAX) return true;
  return score > scores[scores.length - 1].score;
}

// Inserta una puntuación con nombre; recorta a top RECORDS_MAX. Devuelve el índice.
function addScore(name, score) {
  const data = loadRecords();
  const entry = { name: (name || 'ANON').slice(0, 12), score };
  data.scores.push(entry);
  data.scores.sort((a, b) => b.score - a.score);
  data.scores = data.scores.slice(0, RECORDS_MAX);
  saveRecords(data);
  return data.scores.indexOf(entry);
}

// ── Hook: capturar mejor combo (combo interno; visible = combo + 1) ───────────
function recordCombo(internalCombo) {
  const visible = internalCombo + 1;
  const data = loadRecords();
  if (visible > data.bestCombo) {
    data.bestCombo = visible;
    saveRecords(data);
  }
}

// ── Render de tabla ───────────────────────────────────────────────────────────
// highlightScore: si se pasa, resalta la primera fila cuyo score coincida.
function buildTable(highlightIndex) {
  const data = loadRecords();
  const wrap = document.createElement('div');
  wrap.className = 'records-table';

  const title = document.createElement('p');
  title.className = 'records-title';
  title.textContent = 'TOP 5';
  wrap.appendChild(title);

  if (data.scores.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'records-empty';
    empty.textContent = 'Sin records aún';
    wrap.appendChild(empty);
  } else {
    data.scores.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'records-row';
      if (i === highlightIndex) row.classList.add('records-highlight');

      const rank = document.createElement('span');
      rank.className = 'records-rank';
      rank.textContent = `${i + 1}.`;

      const nm = document.createElement('span');
      nm.className = 'records-name';
      nm.textContent = s.name;

      const sc = document.createElement('span');
      sc.className = 'records-score';
      sc.textContent = Number(s.score).toLocaleString();

      row.appendChild(rank);
      row.appendChild(nm);
      row.appendChild(sc);
      wrap.appendChild(row);
    });
  }

  const stats = document.createElement('p');
  stats.className = 'records-stats';
  stats.textContent = `Mejor combo: ×${data.bestCombo} · Líneas máx: ${data.maxLines}`;
  wrap.appendChild(stats);

  return wrap;
}

// Renderiza la tabla del menú de inicio (#records-list) con botón de reset.
function renderMenuTable() {
  const container = document.getElementById('records-list');
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(buildTable(-1));

  const resetBtn = document.createElement('button');
  resetBtn.className = 'cancel-btn records-reset';
  resetBtn.textContent = 'Resetear records';
  resetBtn.addEventListener('click', () => {
    try { localStorage.removeItem(RECORDS_KEY); } catch (e) {}
    renderMenuTable();
  });
  container.appendChild(resetBtn);
}

// ── Game over hook ────────────────────────────────────────────────────────────
function onGameOver(finalScore, finalLines) {
  // Actualizar líneas máximas acumuladas.
  const data = loadRecords();
  if (finalLines > data.maxLines) {
    data.maxLines = finalLines;
    saveRecords(data);
  }

  const container = document.getElementById('overlay-records');
  if (!container) return;
  container.innerHTML = '';

  if (qualifies(finalScore)) {
    // Pedir nombre con un input inline.
    const form = document.createElement('div');
    form.className = 'records-form';

    const prompt = document.createElement('p');
    prompt.className = 'records-prompt';
    prompt.textContent = '¡Nuevo record! Tu nombre:';

    const input = document.createElement('input');
    input.className = 'records-input';
    input.type = 'text';
    input.maxLength = 12;
    input.placeholder = 'ANON';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'records-save';
    saveBtn.textContent = 'Guardar';

    const submit = () => {
      const idx = addScore(input.value.trim() || 'ANON', finalScore);
      container.innerHTML = '';
      container.appendChild(buildTable(idx));
      renderMenuTable();
    };

    saveBtn.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });

    form.appendChild(prompt);
    form.appendChild(input);
    form.appendChild(saveBtn);
    container.appendChild(form);
    setTimeout(() => input.focus(), 0);
  } else {
    container.appendChild(buildTable(-1));
  }
}

// ── Wiring inicial: pintar tabla del menú al cargar ───────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderMenuTable);
} else {
  renderMenuTable();
}
