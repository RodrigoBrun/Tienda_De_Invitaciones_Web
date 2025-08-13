/* =========================================================
   tienda.js — Precios y Formulario Solicitar (UI)
   - UMD (sin import/export). Expone window.Tienda
   - Clásica: usa <template id="tpl-sobres-clasica"> del HTML
   - Premium: color de sobre (swatches + color input)
========================================================= */
(function () {
  let sistema = null;
  function setSistema(instancia){ sistema = instancia }

  /* 💵 Tabla de precios */
  function renderPrecios(sc){
    if(!sistema || !sc) return;
    const productos = sistema.obtenerProductos?.() || [];
    const filas = productos.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>USD ${Number(p.precioBase||0).toLocaleString()}</td>
      </tr>
    `).join("");
    sc.innerHTML = `
      <section class="bloque seccion" id="precios">
        <div class="titulo"><i class="ph ph-tag"></i><h1>Precios</h1></div>
        <div class="tabla-wrap">
          <table class="tabla">
            <thead><tr><th>Plan</th><th>Precio</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* 📝 Formulario Solicitar */
  function renderFormulario(sc){
    if(!sistema || !sc) return;

    const tipos = sistema.obtenerTiposEvento?.() || ["Cumpleaños","Boda","Fiesta privada"];
    const optsEvento = tipos.map(t=>`<option value="${t}">${t}</option>`).join("");

    const productos = sistema.obtenerProductos?.() || [];
    const precioClasica = productos.find(p=>/clasica/i.test(p.nombre))?.precioBase ?? 1000;
    const precioPremium = productos.find(p=>/premium/i.test(p.nombre))?.precioBase ?? 1500;

    sc.innerHTML = `
      <section class="bloque seccion" id="solicitar">
        <div class="titulo"><i class="ph ph-seal-question"></i><h1>Solicitar tarjeta</h1></div>

        <form id="form-solicitud" class="form" novalidate>
          <!-- Tipo -->
          <div class="fila">
            <label class="label">Tipo de tarjeta</label>
            <select id="tipo-tarjeta" class="input select">
              <option value="clasica">Clásica (USD ${precioClasica})</option>
              <option value="premium">Premium (USD ${precioPremium})</option>
            </select>
          </div>

          <!-- Base -->
          <div class="fila">
            <label class="label">Tipo de evento</label>
            <select id="tipo-evento" class="input select">${optsEvento}</select>
          </div>

          <div class="fila fila-2">
            <div>
              <label class="label">Nombre del evento</label>
              <input id="nombre-evento" class="input" type="text" placeholder="Ej: Cumple de Lucila">
            </div>
            <div>
              <label class="label">Fecha</label>
              <input id="fecha-evento" class="input" type="date">
            </div>
          </div>

          <div class="fila fila-2">
            <div>
              <label class="label">Canción (opcional)</label>
              <input id="cancion" class="input" type="text" placeholder="Link o nombre">
            </div>
            <div>
              <label class="label">Tipografía</label>
              <input id="tipografia" class="input" type="text" placeholder="Ej: Playfair / Inter">
            </div>
          </div>

          <!-- PREMIUM -->
          <fieldset id="extras-premium" class="fieldset toggle-extra" aria-label="Opciones premium" style="display:none">
            <legend class="label">Color del sobre (Premium)</legend>
            <div class="swatches">
              ${['#c2a671','#9c8a5b','#bfa5a0','#8aa6a3','#2f2f2f'].map(hex =>
                `<button type="button" class="swatch" data-hex="${hex}" style="background:${hex}" aria-label="${hex}"></button>`
              ).join('')}
            </div>
            <div class="fila fila-2">
              <div>
                <label class="label">Hex personalizado</label>
                <input id="sobre-color" class="input" type="text" placeholder="#c2a671" value="#c2a671">
              </div>
              <div>
                <label class="label">Picker</label>
                <input id="sobre-color-picker" class="input" type="color" value="#c2a671">
              </div>
            </div>
            <p class="texto-sec">El sobre de la Premium es único, solo definimos su color.</p>
          </fieldset>

          <!-- CLÁSICA -->
          <fieldset id="extras-clasica" class="fieldset toggle-extra" aria-label="Opciones clásicas">
            <legend class="label">Sobre (clásica)</legend>

            <button id="btn-sobre-clasica" class="btn-link" type="button" aria-expanded="false" aria-controls="panel-sobres">
              <i class="ph ph-caret-down" aria-hidden="true"></i>
              Elegir icono de sobre
            </button>
            <!-- Aquí se inyectará el panel desde el <template id="tpl-sobres-clasica"> -->
          </fieldset>

          <!-- Contacto + Mensaje -->
          <div class="fila fila-2">
            <div>
              <label class="label">Contacto</label>
              <input id="contacto" class="input" type="text" placeholder="WhatsApp o email">
            </div>
            <div>
              <label class="label">Mensaje (opcional)</label>
              <input id="mensaje" class="input" type="text" placeholder="Contame detalles que querés incluir...">
            </div>
          </div>

          <!-- Resumen -->
          <div class="fila">
            <div class="resumen-precio card" style="padding:14px">
              <div><strong>Precio base:</strong> <span id="precio-base">—</span></div>
              <div><strong>Extras:</strong> <span id="precio-extras">0 pesos</span></div>
              <div><strong>Total:</strong> <span id="precio-total">—</span></div>
            </div>
          </div>

          <div class="acciones"><button type="submit" class="btn-cta">Enviar solicitud</button></div>
          <p id="alerta" class="alerta" style="display:none">Mensaje</p>
        </form>
      </section>
    `;

    // ---------- wiring ----------
    const form            = document.getElementById("form-solicitud");
    const tipoTarjeta     = document.getElementById("tipo-tarjeta");
    const panelClasica    = document.getElementById("extras-clasica");
    const panelPremium    = document.getElementById("extras-premium");
    const pBase           = document.getElementById("precio-base");
    const pExtras         = document.getElementById("precio-extras");
    const pTotal          = document.getElementById("precio-total");
    const btnSobreClasica = document.getElementById("btn-sobre-clasica");

    // Inyectar panel de sobres desde el TEMPLATE del HTML
    let panelSobres = null;
    (function injectTemplate(){
      const tpl = document.getElementById('tpl-sobres-clasica');
      if (!tpl) return;
      const clone = tpl.content.cloneNode(true);
      panelClasica.appendChild(clone);
      panelSobres = panelClasica.querySelector('#panel-sobres');

      // marcar visualmente selección de radio
      markSelected(panelClasica.querySelector('input[name="sobreIcono"]:checked'));
      panelClasica.addEventListener('change', (e)=>{
        if (e.target && e.target.name === 'sobreIcono'){
          markSelected(e.target);
          calcularTotal();
        }
      });
    })();

    // Toggle abrir/cerrar panel
    btnSobreClasica?.addEventListener('click', ()=>{
      if (!panelSobres) return;
      const abierto = !panelSobres.hasAttribute('hidden');
      if (abierto){
        panelSobres.setAttribute('hidden','');
        btnSobreClasica.setAttribute('aria-expanded','false');
      } else {
        panelSobres.removeAttribute('hidden');
        btnSobreClasica.setAttribute('aria-expanded','true');
      }
      setTimeout(()=> window.AOS && AOS.refresh(), 120);
    });

    // Swatches premium
    const swatches    = Array.from(document.querySelectorAll(".swatch"));
    const sobreHex    = document.getElementById("sobre-color");
    const sobrePicker = document.getElementById("sobre-color-picker");
    swatches.forEach(s=>{
      s.addEventListener('click', ()=>{
        const hex = s.getAttribute('data-hex') || '#c2a671';
        if (sobreHex)    sobreHex.value = hex;
        if (sobrePicker) sobrePicker.value = hex;
      });
    });
    sobrePicker?.addEventListener('input', ()=>{ if (sobreHex) sobreHex.value = sobrePicker.value });

    // Precios
    const precios = { clasica: Number(precioClasica), premium: Number(precioPremium) };
    const EXTRA_PERSONALIZADO = 150;

    function mostrarExtras(){
      const t = (tipoTarjeta?.value || 'clasica');
      const isClasica = t === 'clasica';
      panelClasica.style.display = isClasica ? 'block' : 'none';
      panelPremium.style.display = isClasica ? 'none'  : 'block';
      if (panelSobres){
        if (isClasica){
          // mantener estado
        } else {
          panelSobres.setAttribute('hidden','');
          btnSobreClasica?.setAttribute('aria-expanded','false');
        }
      }
      pBase.textContent = 'USD ' + (precios[t]||0).toLocaleString();
      calcularTotal();
      setTimeout(()=> window.AOS && AOS.refresh(), 120);
    }
    tipoTarjeta?.addEventListener('change', mostrarExtras);
    mostrarExtras();

    // Calcular extras
    function extrasPesos(){
      if ((tipoTarjeta?.value || 'clasica') !== 'clasica') return 0;
      const icono = (panelClasica.querySelector('input[name="sobreIcono"]:checked')?.value || 'clasico-dorado');
      return (icono === 'personalizado') ? EXTRA_PERSONALIZADO : 0;
    }
    function calcularTotal(){
      const t = (tipoTarjeta?.value || 'clasica');
      const base   = precios[t] || 0;
      const extras = extrasPesos();
      pExtras.textContent = `${extras} pesos`;
      pTotal.textContent  = `USD ${base.toLocaleString()}${extras ? ' + ' + extras + ' pesos' : ''}`;
    }

    // Submit
    form.addEventListener("submit", (e)=>{
      e.preventDefault();

      const ttarjeta   = (tipoTarjeta?.value || 'clasica');
      const tipo       = val("tipo-evento");
      const nombre     = val("nombre-evento");
      const fecha      = val("fecha-evento");
      const cancion    = val("cancion");
      const tipografia = val("tipografia");
      const contacto   = val("contacto");
      const mensaje    = val("mensaje");

      if(!contacto){ return mostrar("Falta contacto (WhatsApp o email).", true) }

      let sobreInfo = '';
      if (ttarjeta === 'premium'){
        const hex = (sobreHex?.value || '#c2a671').trim();
        sobreInfo = `Sobre premium color ${hex}`;
      } else {
        const icono = (panelClasica.querySelector('input[name="sobreIcono"]:checked')?.value || 'clasico-dorado');
        const extra = (icono === 'personalizado') ? ' (+150 pesos)' : '';
        sobreInfo = `Sobre clásica: ${icono}${extra}`;
      }

      try {
        sistema.altaPedido?.({
          tipoEvento: tipo,
          nombreEvento: nombre,
          fecha,
          cancion,
          tipografia,
          sobre: sobreInfo,
          mensaje,
          contacto
        });
      } catch(_) {}

      const numero = window.WAPP_NUM || "59892992182";
      const base   = precios[ttarjeta];
      const extras = extrasPesos();

      const texto =
        `Hola! Quiero una invitación web.%0A` +
        `Tarjeta: ${ttarjeta}%0A` +
        `Tipo evento: ${tipo}%0A` +
        `Evento: ${nombre}%0A` +
        `Fecha: ${fecha}%0A` +
        `Canción: ${cancion}%0A` +
        `Tipografía: ${tipografia}%0A` +
        `${sobreInfo}%0A` +
        `Contacto: ${contacto}%0A` +
        `Detalles: ${mensaje}%0A%0A` +
        `Precio base: USD ${base}%0A` +
        `Extras: ${extras} pesos`;

      window.open(`https://wa.me/${numero}?text=${texto}`, "_blank");
      mostrar("¡Listo! Te abro WhatsApp con tus datos.", false);
      form.reset();
      mostrarExtras();
    });

    // Helpers
    function val(id){ return (document.getElementById(id)?.value || '').trim() }
    function mostrar(msg, esError){
      const a = document.getElementById("alerta");
      if(!a) return;
      a.style.display = "block";
      a.textContent = msg;
      if(esError){
        a.style.background = "rgba(212,90,90,.1)";
        a.style.border = "1px solid rgba(212,90,90,.4)";
        a.style.color = "#9a3c3c";
      } else {
        a.style.background = "rgba(98,184,117,.12)";
        a.style.border = "1px solid rgba(98,184,117,.35)";
        a.style.color = "#1f5130";
      }
    }

    function markSelected(input){
      if(!input) return;
      // limpiar
      panelClasica.querySelectorAll('.sobre-item').forEach(l=> l.classList.remove('is-selected'));
      // aplicar
      const label = input.closest('.sobre-item');
      label && label.classList.add('is-selected');
    }
  }

  // expose
  window.Tienda = { setSistema, renderPrecios, renderFormulario };
})();
