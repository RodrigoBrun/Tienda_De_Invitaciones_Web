/* =========================================================
   app.js — Bootstrap mínimo (sin ES modules)
   - Toma Sistema desde window.Sistema (clases.js)
   - Pasa la instancia a Tienda (window.Tienda)
   - Renderiza Precios y Solicitar si existen en el DOM
   - Refresca AOS después de renderizar
========================================================= */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // ✨ AOS (si está cargado)
    if (window.AOS) {
      AOS.init({ once: true, offset: 20, duration: 500, easing: 'ease-out' });
    }

    // 🧠 Dominio (Sistema desde clases.js)
    const SistemaCtor = window.Sistema;
    if (!SistemaCtor) {
      console.error('No se encontró window.Sistema (clases.js).');
      return;
    }
    const sistema = new SistemaCtor();
    if (typeof sistema.precargar === 'function') {
      try { sistema.precargar(); } catch (_) {}
    }

    // 🛒 UI Tienda (desde tienda.js)
    if (!window.Tienda || typeof window.Tienda.setSistema !== 'function') {
      console.error('No se encontró window.Tienda (tienda.js).');
      return;
    }
    window.Tienda.setSistema(sistema);

    // 🧩 Render dinámico de secciones (si existen)
    const scPrecios   = document.getElementById('precios');
    const scSolicitar = document.getElementById('solicitar');

    if (scPrecios)   { window.Tienda.renderPrecios(scPrecios); }
    if (scSolicitar) { window.Tienda.renderFormulario(scSolicitar); }

    // 🟢 WhatsApp flotante (cambiá el número si querés)
    window.WAPP_NUM = window.WAPP_NUM || "59892992182";
    const wbtn = document.getElementById('btn-wapp');
    if (wbtn) wbtn.href = "https://wa.me/" + window.WAPP_NUM;

    // 🔁 AOS refresh después de inyectar HTML
    setTimeout(() => { if (window.AOS) AOS.refreshHard(); }, 150);
  });
})();
