/* =========================================================
   modoOscuro.js — Toggle de tema oscuro con persistencia
   - Clase en <body>: .modo-oscuro
   - Persistencia en localStorage (rb_theme = 'dark' | 'light')
   - Sin dependencias externas
========================================================= */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'rb_theme';
  const CLASS_DARK  = 'modo-oscuro';

  const qs = (s, sc = document) => sc.querySelector(s);

  // Detecta preferencia del sistema
  const prefersDark = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;

  function getStoredTheme() {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : null;
  }

  function setStoredTheme(mode) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }

  function applyTheme(mode) {
    const isDark = mode === 'dark';
    document.body.classList.toggle(CLASS_DARK, isDark);
    syncIcon(isDark);
  }

  function currentMode() {
    return document.body.classList.contains(CLASS_DARK) ? 'dark' : 'light';
  }

  function toggleTheme() {
    const next = currentMode() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
  }

  function syncIcon(isDark) {
    const btn  = qs('#btn-modo-oscuro');
    const icon = btn ? btn.querySelector('i') : null;
    if (!btn || !icon) return;
    // Cambia icono y etiqueta accesible
    icon.className = isDark ? 'ph ph-sun-dim' : 'ph ph-moon';
    btn.setAttribute('aria-label', isDark ? 'Desactivar modo oscuro' : 'Activar modo oscuro');
  }

  // ================================
  // 🚀 Init
  // ================================
  document.addEventListener('DOMContentLoaded', () => {
    // Resuelve el modo inicial: localStorage > sistema
    const stored = getStoredTheme();
    const initial = stored ? stored : (prefersDark ? 'dark' : 'light');
    applyTheme(initial);

    // Bind del botón
    const btn = qs('#btn-modo-oscuro');
    if (btn) btn.addEventListener('click', toggleTheme);

    // Si el usuario no tiene preferencia guardada, reaccionar a cambios del sistema
    if (!stored && global.matchMedia) {
      const mq = global.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', (e) => {
        // Solo si no hay preferencia guardada
        if (!getStoredTheme()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  });

})(window);
