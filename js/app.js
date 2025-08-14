/* =========================================================
   app.js — Bootstrap liviano de la app
   - Punto de extensión por si querés inicializar más cosas
   - Deja una bandera global y evita duplicar inits
========================================================= */
(function (global) {
  'use strict';

  if (global.__RB_APP_BOOTSTRAPPED__) return;
  global.__RB_APP_BOOTSTRAPPED__ = true;

  document.addEventListener('DOMContentLoaded', () => {
    // Si AOS no está, aseguramos que nada quede oculto por el failsafe
    if (!global.AOS) {
      document.body.classList.add('aos-ready');
    }

    // Gancho para futuras inicializaciones (analytics, etc.)
    global.App = Object.assign(global.App || {}, {
      bootTime: Date.now()
    });
  });
})(window);
