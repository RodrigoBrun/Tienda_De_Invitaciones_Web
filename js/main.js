/* =========================================================
   main.js — Utilidades globales + navegación + overlay + Wpp
   - No toca la lógica de precios ni del formulario (va en tienda.js)
   - Deja helpers en window.App para que otros archivos los usen
========================================================= */
(function (global) {
  'use strict';

  // ================================
  // 🔧 Helpers DOM (usá estos siempre)
  // ================================
  const qs  = (sel, sc = document) => sc.querySelector(sel);
  const qsa = (sel, sc = document) => Array.from(sc.querySelectorAll(sel));

  // Scroll suave a una sección por id (sin #)
  function irASeccion(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Marca activo el link que apunta a la sección id
  function marcarActivo(id) {
    qsa('.nav-link.is-active').forEach(a => a.classList.remove('is-active'));
    qsa(`.nav-link[data-target="${id}"]`).forEach(a => a.classList.add('is-active'));
  }

  // ================================
  // 🧭 Navegación por data-target
  // ================================
  function bindNavegacion() {
    // Links con data-target (navbar + sidebar + CTAs)
    qsa('.nav-link[data-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('data-target');
        if (!id) return;
        irASeccion(id);
        cerrarSidebar();     // cerrar en mobile si estaba abierto
        marcarActivo(id);
        // Refrescar AOS por si cambió el layout (si existe)
        setTimeout(() => { global.AOS && global.AOS.refresh(); }, 220);
      });
    });

    // Anchors tradicionales (href="#id")
    qsa('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        const id = hash.replace('#', '').trim();
        if (!id) return;
        e.preventDefault();
        irASeccion(id);
        cerrarSidebar();
        marcarActivo(id);
        setTimeout(() => { global.AOS && global.AOS.refresh(); }, 220);
      });
    });
  }

  // ================================
  // 📱 Sidebar + Overlay
  // ================================
  const state = { sidebarAbierto: false };

  function abrirSidebar() {
    const sidebar = qs('#sidebar');
    const overlay = qs('#overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.add('active');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    state.sidebarAbierto = true;
  }

  function cerrarSidebar() {
    const sidebar = qs('#sidebar');
    const overlay = qs('#overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    state.sidebarAbierto = false;
  }

  function toggleSidebar() {
    state.sidebarAbierto ? cerrarSidebar() : abrirSidebar();
  }

  function bindSidebar() {
    const btnOpen  = qs('#hamburguesa');
    const btnClose = qs('#cerrar-sidebar');
    const overlay  = qs('#overlay');

    btnOpen  && btnOpen.addEventListener('click', toggleSidebar);
    btnClose && btnClose.addEventListener('click', cerrarSidebar);
    overlay  && overlay.addEventListener('click', cerrarSidebar);

    // Cerrar con Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.sidebarAbierto) cerrarSidebar();
    });
  }

  // ================================
  // 🟢 WhatsApp (CTA y flotante)
  // ================================
  function buildWhatsAppURL(numeroE164, mensaje) {
    // numeroE164 sin + (ej: 59892992182)
    const base = 'https://wa.me/';
    const msg  = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
    return `${base}${numeroE164}${msg}`;
  }

  function bindWhatsApp() {
    const numero = '59892992182'; // ✅ tu número en formato E.164 sin '+'
    const msgDef = 'Hola Rodrigo, quiero solicitar una invitación web 👋';

    const cta = qs('#cta-wapp');
    const fab = qs('#btn-wapp');

    if (cta) cta.setAttribute('href', buildWhatsAppURL(numero, msgDef));
    if (fab) fab.setAttribute('href', buildWhatsAppURL(numero, msgDef));
  }

  // ================================
  // 🗓️ Año del footer
  // ================================
  function setAnioFooter() {
    const el = qs('#anio');
    if (!el) return;
    el.textContent = String(new Date().getFullYear());
  }

  // ================================
  // ✨ AOS Fail-safe + Init
  // ================================
  function initAOS() {
    if (!global.AOS) return;     // si no está cargado, no falla
    global.AOS.init({ once: true, duration: 600, easing: 'ease-out' });
    document.body.classList.add('aos-ready'); // quita el fail-safe visual
  }

  // ================================
  // 🚀 Bootstrap de este archivo
  // ================================
  document.addEventListener('DOMContentLoaded', () => {
    bindNavegacion();
    bindSidebar();
    bindWhatsApp();
    setAnioFooter();
    initAOS();
  });

  // ================================
  // 🌍 Exponer API mínima a otros JS
  // ================================
  global.App = Object.assign(global.App || {}, {
    qs, qsa,
    irASeccion, marcarActivo,
    abrirSidebar, cerrarSidebar, toggleSidebar,
    buildWhatsAppURL
  });

})(window);
