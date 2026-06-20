'use strict';

// ── Temas visuales / skins ─────────────────────────────────────────────────────
// Cada skin define:
//   - palette: array opcional indexado igual que COLORS (1-7+). Si falta un índice
//     se usa fallback a COLORS[colorIndex] en drawBlock().
//   - bodyClass: clase aplicada a <body> para ajustar CSS vars (fondo, grid…).
//   - shadowBlur / shadowColor: efecto glow (neon).
//   - rounded: dibuja esquinas redondeadas (pastel).
//   - texture: dibuja patrón de textura sobre el bloque (pixel art).
//
// drawBlock() en game.js consulta window.activeSkin para color y efectos.
// COLORS es const en pieces.js — NO se reasigna; estas paletas son alternativas.

const SKINS = {
  retro: {
    name: 'Retro',
    palette: null,        // usa COLORS tal cual → render idéntico al actual
    bodyClass: null,
    shadowBlur: 0,
    rounded: false,
    texture: false,
  },

  neon: {
    name: 'Neon',
    // Colores saturados sobre fondo negro
    palette: [
      null,
      '#00f0ff', // 1 I
      '#fff200', // 2 O
      '#d600ff', // 3 T
      '#00ff85', // 4 S
      '#ff1744', // 5 Z
      '#2979ff', // 6 J
      '#ff9100', // 7 L
      '#ff4081', // 8 +
      '#1de9b6', // 9 U
      '#b2ff59', // 10 Y
      '#ffff00', // 11 single
      '#40c4ff', // 12 anillo
    ],
    bodyClass: 'skin-neon',
    shadowBlur: 12,
    shadowColor: null,    // null → usa el color del bloque
    rounded: false,
    texture: false,
  },

  pastel: {
    name: 'Pastel',
    palette: [
      null,
      '#a0e7e5', // 1 I
      '#fbe7a1', // 2 O
      '#d6b3f0', // 3 T
      '#b5ead7', // 4 S
      '#ffb3b3', // 5 Z
      '#b3c7f0', // 6 J
      '#ffd6a5', // 7 L
      '#fcc2d7', // 8 +
      '#a0d8d2', // 9 U
      '#d0f0a0', // 10 Y
      '#fff3b0', // 11 single
      '#bcd8f5', // 12 anillo
    ],
    bodyClass: 'skin-pastel',
    shadowBlur: 0,
    rounded: true,
    texture: false,
  },

  pixel: {
    name: 'Pixel art',
    palette: null,        // mismos colores base que retro
    bodyClass: 'skin-pixel',
    shadowBlur: 0,
    rounded: false,
    texture: true,
  },
};

const SKIN_STORAGE_KEY = 'tetris-skin';

function getSkin(id) {
  return SKINS[id] || SKINS.retro;
}

// Aplica clases de body (ajustan CSS vars: --bg, --canvas-bg, --grid-color…).
function applySkinBodyClass(skin) {
  for (const key in SKINS) {
    const cls = SKINS[key].bodyClass;
    if (cls) document.body.classList.remove(cls);
  }
  if (skin.bodyClass) document.body.classList.add(skin.bodyClass);
}

// Cambia la skin activa, persiste y fuerza redibujo sin recargar.
function setSkin(id) {
  const skin = getSkin(id);
  window.activeSkin = skin;
  window.activeSkinId = SKINS[id] ? id : 'retro';
  try { localStorage.setItem(SKIN_STORAGE_KEY, window.activeSkinId); } catch (e) {}
  applySkinBodyClass(skin);

  // Forzar repintado inmediato: el loop repinta cada frame, pero si el juego
  // está pausado/parado, dibujamos manualmente si está disponible.
  if (typeof draw === 'function' && typeof board !== 'undefined' && board) {
    try { draw(); } catch (e) {}
  }
  if (typeof drawNext === 'function') { try { drawNext(); } catch (e) {} }
  if (typeof drawHold === 'function') { try { drawHold(); } catch (e) {} }
}

// Inicializa la skin guardada y conecta el selector del DOM.
function initSkins() {
  let stored = 'retro';
  try { stored = localStorage.getItem(SKIN_STORAGE_KEY) || 'retro'; } catch (e) {}
  if (!SKINS[stored]) stored = 'retro';

  const skin = getSkin(stored);
  window.activeSkin = skin;
  window.activeSkinId = stored;
  applySkinBodyClass(skin);

  const select = document.getElementById('skin-select');
  if (select) {
    select.value = stored;
    select.addEventListener('change', () => setSkin(select.value));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkins);
} else {
  initSkins();
}
