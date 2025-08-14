/* =========================================================
   tienda.js — Lógica de UI para la tienda
   - Conecta el DOM con el dominio (Sistema, PedidoInvitacion)
   - Controla paneles de extras, swatches y resumen de precios
   - No define precios (eso está en clases.js)
========================================================= */
(function (global) {
  'use strict';

  // ================================
  // 🔗 Shorthands y dependencias
  // ================================
  const { qs, qsa, buildWhatsAppURL } = global.App || {
    qs: (s, sc = document) => sc.querySelector(s),
    qsa: (s, sc = document) => Array.from(sc.querySelectorAll(s)),
    buildWhatsAppURL: (n, m) => `https://wa.me/${n}?text=${encodeURIComponent(m||'')}`
  };

  // Dominio
  const Sistema = global.Sistema;
  const Extra = global.Extra;

  // Estado UI
  const ui = {
    sis: null,            // instancia de Sistema
    pedido: null,         // PedidoInvitacion actual
    numeroWpp: '59892992182', // E.164 sin '+'
    extraSobrePerso: 'Sobre personalizado'
  };

  // ================================
  // 🧰 Helpers de UI
  // ================================
  function setText(el, text) { if (el) el.textContent = text; }
  function setValue(el, val)  { if (el) el.value = val; }

  function formDataActual() {
    return {
      plan:       qs('#tipo-tarjeta')?.value || 'clasica',
      tipoEvento: qs('#tipo-evento')?.value || '',
      nombre:     qs('#nombre-evento')?.value?.trim() || '',
      fecha:      qs('#fecha-evento')?.value || '',
      cancion:    qs('#cancion')?.value?.trim() || '',
      tipografia: qs('#tipografia')?.value?.trim() || '',
      contacto:   qs('#contacto')?.value?.trim() || '',
      mensaje:    qs('#mensaje')?.value?.trim() || '',
      // Extras UI
      planEsPremium: qs('#tipo-tarjeta')?.value === 'premium',
      sobreHex: qs('#sobre-color')?.value?.trim() || '',
      sobreHexPicker: qs('#sobre-color-picker')?.value || ''
    };
  }

  // Recalcula y pinta resumen de precio
  function actualizarResumen() {
    const baseUSD   = ui.pedido.getPrecioBaseUSD();
    const extrasUYU = ui.pedido.getTotalExtrasPesos();
    setText(qs('#precio-base'),  `USD ${baseUSD.toLocaleString('en-US')}`);
    setText(qs('#precio-extras'), `${extrasUYU.toLocaleString('es-UY')} pesos`);
    setText(qs('#precio-total'), `USD ${baseUSD.toLocaleString('en-US')} (+ extras en pesos)`);
  }

  // Cambia el plan → crea nuevo pedido, resetea extras y toggles UI
  function aplicarPlan(nombrePlan) {
    ui.pedido = ui.sis.crearPedido(nombrePlan);
    // Toggle de fieldsets
    const fsPrem = qs('#extras-premium');
    const fsClas = qs('#extras-clasica');
    if (nombrePlan === 'premium') {
      fsPrem && (fsPrem.style.display = '');
      fsClas && (fsClas.style.display = 'none');
    } else {
      fsPrem && (fsPrem.style.display = 'none');
      fsClas && (fsClas.style.display = '');
    }
    actualizarResumen();
  }

  // ================================
  // ✉️ Panel de sobres (Clásica)
  // ================================
  function initPanelSobresClasica() {
    const btn = qs('#btn-sobre-clasica');
    const tpl = qs('#tpl-sobres-clasica');
    if (!btn || !tpl) return;

    // Inyectar el panel desde template una única vez
    let panel = qs('#panel-sobres');
    if (!panel) {
      const frag = tpl.content.cloneNode(true);
      qs('#extras-clasica')?.appendChild(frag);
      panel = qs('#panel-sobres');
    }

    // Toggle mostrar/ocultar
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      // refrescar AOS si existe
      setTimeout(() => { global.AOS && global.AOS.refresh(); }, 150);
    });

    // Selección de radio (incluye "Personalizado")
    const radios = qsa('input[name="sobreIcono"]', panel);
    radios.forEach(r => {
      r.addEventListener('change', () => {
        if (r.value === 'personalizado') {
          // agregar extra si no existe
          const ya = ui.pedido.extras.some(e => e.nombre === ui.extraSobrePerso);
          if (!ya) ui.pedido.agregarExtra(new Extra(ui.extraSobrePerso, 150));
        } else {
          // quitar extra
          ui.pedido.quitarExtraPorNombre(ui.extraSobrePerso);
        }
        actualizarResumen();
      });
    });
  }

  // ================================
  // 🎨 Swatches y color premium
  // ================================
  function initSwatchesPremium() {
    const wrap = qs('#extras-premium');
    if (!wrap) return;

    // Swatches → setean inputs
    qsa('.swatch', wrap).forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-hex') || '';
        setValue(qs('#sobre-color'), hex);
        setValue(qs('#sobre-color-picker'), hex);
      });
    });

    // Sync picker -> text
    const picker = qs('#sobre-color-picker');
    picker && picker.addEventListener('input', () => {
      setValue(qs('#sobre-color'), picker.value || '');
    });
  }

  // ================================
  // 🧾 Envío del formulario
  // ================================
  function bindForm() {
    const form = qs('#form-solicitud');
    const alerta = qs('#alerta');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (alerta) alerta.style.display = 'none';

      const d = formDataActual();

      // Validaciones mínimas
      if (!d.nombre || !d.fecha || !d.contacto) {
        if (alerta) {
          alerta.textContent = 'Completá: Nombre del evento, Fecha y Contacto.';
          alerta.style.display = 'block';
        }
        return;
      }

      // Construir resumen legible
      const planTitle = d.plan === 'premium' ? 'Premium' : 'Clásica';
      const extrasUYU = ui.pedido.getTotalExtrasPesos();

      // ¿Personalizado seleccionado?
      let sobreSel = 'N/A';
      const rSel = qs('input[name="sobreIcono"]:checked');
      if (d.plan === 'premium') {
        sobreSel = d.sobreHex || d.sobreHexPicker || 'A definir';
      } else if (rSel) {
        sobreSel = rSel.value === 'personalizado' ? 'Personalizado (+150 UYU)' : rSel.value;
      }

      const mensaje =
        `Hola Rodrigo 👋\n` +
        `Quiero solicitar una invitación web.\n\n` +
        `• Plan: ${planTitle}\n` +
        `• Tipo de evento: ${d.tipoEvento}\n` +
        `• Nombre del evento: ${d.nombre}\n` +
        `• Fecha: ${d.fecha}\n` +
        (d.cancion ? `• Canción: ${d.cancion}\n` : '') +
        (d.tipografia ? `• Tipografía: ${d.tipografia}\n` : '') +
        `• Sobre: ${sobreSel}\n` +
        `• Contacto: ${d.contacto}\n` +
        (d.mensaje ? `• Mensaje: ${d.mensaje}\n` : '') +
        `\nResumen de precios:\n` +
        `- Base: USD ${ui.pedido.getPrecioBaseUSD().toLocaleString('en-US')}\n` +
        `- Extras: ${extrasUYU.toLocaleString('es-UY')} pesos\n` +
        `- Total: USD ${ui.pedido.getPrecioBaseUSD().toLocaleString('en-US')} + extras (UYU)\n`;

      // Abrir WhatsApp con el mensaje
      const url = buildWhatsAppURL(ui.numeroWpp, mensaje);
      window.open(url, '_blank', 'noopener');

      // Feedback visual rápido
      if (alerta) {
        alerta.textContent = 'Abriendo WhatsApp…';
        alerta.style.display = 'block';
      }
    });
  }

  // ================================
  // 🔄 Binding de cambios del plan
  // ================================
  function bindPlanChange() {
    const sel = qs('#tipo-tarjeta');
    if (!sel) return;
    sel.addEventListener('change', () => {
      aplicarPlan(sel.value);
      // Reset de radios al cambiar de plan
      const rPers = qs('input[name="sobreIcono"][value="personalizado"]');
      if (rPers) rPers.checked = false;
      ui.pedido && ui.pedido.quitarExtraPorNombre(ui.extraSobrePerso);
      actualizarResumen();
    });
  }

  // ================================
  // 🚀 Bootstrap
  // ================================
  document.addEventListener('DOMContentLoaded', () => {
    // Sistema + pedido inicial
    ui.sis = new Sistema();
    const planInicial = (qs('#tipo-tarjeta')?.value === 'premium') ? 'premium' : 'clasica';
    aplicarPlan(planInicial);

    // UI bindings
    bindPlanChange();
    initPanelSobresClasica();
    initSwatchesPremium();
    bindForm();

    // Primera pintura del resumen
    actualizarResumen();
  });

})(window);
