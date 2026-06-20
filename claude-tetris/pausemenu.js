'use strict';

// ── Menú de pausa completo ──────────────────────────────────────────────────
// Wiring de los botones del overlay #pause-menu. game.js controla la
// visibilidad vía togglePause().
(function () {
  const START_LEVEL_KEY = 'tetris-start-level';

  function clampLevel(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) n = 1;
    return Math.min(15, Math.max(1, n));
  }

  function getStartLevel() {
    return clampLevel(localStorage.getItem(START_LEVEL_KEY) || 1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const resumeBtn     = document.getElementById('pause-resume');
    const restartBtn    = document.getElementById('pause-restart');
    const controlsBtn   = document.getElementById('pause-controls-btn');
    const controlsPanel = document.getElementById('pause-controls-panel');
    const levelSelect   = document.getElementById('pause-level-select');

    // Selector de nivel inicial: rellenar 1..15
    if (levelSelect) {
      for (let i = 1; i <= 15; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        levelSelect.appendChild(opt);
      }
      levelSelect.value = getStartLevel();
      levelSelect.addEventListener('change', () => {
        const v = clampLevel(levelSelect.value);
        levelSelect.value = v;
        localStorage.setItem(START_LEVEL_KEY, v);
      });
    }

    // Reanudar
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        resumeBtn.blur();
        if (typeof togglePause === 'function') togglePause();
      });
    }

    // Reiniciar — nueva partida con el modo actual; si no hay modo, menú de modos
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        restartBtn.blur();
        const modeMenu = document.getElementById('mode-menu');
        if (typeof challengeMode !== 'undefined' && challengeMode) {
          if (typeof init === 'function') init(challengeMode);
        } else if (modeMenu) {
          // Salir de pausa y mostrar selección de modo
          if (typeof paused !== 'undefined' && paused && typeof togglePause === 'function') {
            togglePause();
          }
          const pm = document.getElementById('pause-menu');
          if (pm) pm.classList.add('hidden');
          modeMenu.classList.remove('hidden');
        } else if (typeof init === 'function') {
          init();
        }
      });
    }

    // Toggle del panel de controles
    if (controlsBtn && controlsPanel) {
      controlsBtn.addEventListener('click', () => {
        controlsPanel.classList.toggle('hidden');
      });
    }
  });
})();
