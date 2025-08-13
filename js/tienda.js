/* =========================================================
   tienda.js — Precios y Formulario Solicitar
   - UI pura. Lee de Sistema y arma HTML.
========================================================= */
let sistema = null
function setSistema(instancia){ sistema = instancia }

/* 💵 Tabla de precios */
function renderPrecios(sc){
  if(!sistema || !sc) return
  let productos = sistema.obtenerProductos()

  let filas = ``
  for (let p of productos){
    filas += `
      <tr>
        <td>${p.nombre}</td>
        <td>USD ${p.precioBase.toLocaleString()}</td>
      </tr>
    `
  }

  sc.innerHTML = `
    <section class = "bloque">
      <div class = "titulo">
        <i class = "ph ph-tag"></i>
        <h1>Precios</h1>
      </div>

      <div class = "tabla-wrap">
        <table class = "tabla">
          <thead>
            <tr><th>Plan</th><th>Precio</th></tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </section>
  `
}

/* 📝 Formulario Solicitar */
function renderFormulario(sc){
  if(!sistema || !sc) return

  // opciones de tipo de evento
  let opts = ``
  let tipos = sistema.obtenerTiposEvento()
  for (let t of tipos){ opts += `<option value = "${t}">${t}</option>` }

  sc.innerHTML = `
    <section class = "bloque">
      <div class = "titulo">
        <i class = "ph ph-seal-question"></i>
        <h1>Solicitar</h1>
      </div>

      <form id = "form-solicitud" class = "form">
        <div class = "fila">
          <label class = "label">Tipo de evento</label>
          <select id = "tipo-evento" class = "input select">${opts}</select>
        </div>

        <div class = "fila fila-2">
          <div>
            <label class = "label">Nombre del evento</label>
            <input id = "nombre-evento" class = "input" type = "text" placeholder = "Ej: Cumple de Lucila">
          </div>
          <div>
            <label class = "label">Fecha</label>
            <input id = "fecha-evento" class = "input" type = "date">
          </div>
        </div>

        <div class = "fila fila-2">
          <div>
            <label class = "label">Canción (opcional)</label>
            <input id = "cancion" class = "input" type = "text" placeholder = "Link o nombre">
          </div>
          <div>
            <label class = "label">Tipografía</label>
            <input id = "tipografia" class = "input" type = "text" placeholder = "Ej: Playfair / Inter">
          </div>
        </div>

        <div class = "fila fila-2">
          <div>
            <label class = "label">Estilo de sobre</label>
            <input id = "sobre" class = "input" type = "text" placeholder = "Ej: Clásico dorado">
          </div>
          <div>
            <label class = "label">Contacto</label>
            <input id = "contacto" class = "input" type = "text" placeholder = "WhatsApp o email">
          </div>
        </div>

        <div class = "fila">
          <label class = "label">Mensaje para la tarjeta</label>
          <textarea id = "mensaje" class = "input" rows = "4" placeholder = "Contame los detalles que querés incluir..."></textarea>
        </div>

        <div class = "acciones">
          <button type = "submit" class = "btn-cta">Enviar solicitud</button>
        </div>

        <p id = "alerta" class = "alerta" style = "display:none">Mensaje</p>
      </form>
    </section>
  `

  // 🎣 Evento submit (crea pedido en Sistema)
  let form = document.getElementById("form-solicitud")
  form.addEventListener("submit", (e)=>{
    e.preventDefault()

    // toma de datos del form
    let datos = {
      tipoEvento: document.getElementById("tipo-evento").value,
      nombreEvento: document.getElementById("nombre-evento").value,
      fecha: document.getElementById("fecha-evento").value,
      cancion: document.getElementById("cancion").value,
      tipografia: document.getElementById("tipografia").value,
      sobre: document.getElementById("sobre").value,
      mensaje: document.getElementById("mensaje").value,
      contacto: document.getElementById("contacto").value
    }

    try{
      // alta en dominio
      let pedido = sistema.altaPedido(datos)

      // WhatsApp prearmado (acá se cambia el número)
      let numero = "59892992182" // ← tu número sin +
      let texto = `Hola! Quiero una invitación web.%0A
Tipo: ${pedido.tipoEvento}%0A
Evento: ${pedido.nombreEvento}%0A
Fecha: ${pedido.fecha}%0A
Contacto: ${pedido.contacto}`
      window.open(`https://wa.me/${numero}?text=${texto}`, "_blank")

      mostrarOk("¡Listo! Te abro WhatsApp con tus datos.")
      form.reset()
    }catch(err){
      mostrarError(err.message)
    }
  })

  function mostrarError(msg){
    let a = document.getElementById("alerta")
    a.style.display = "block"
    a.style.background = "rgba(212,90,90,.1)"
    a.style.border = "1px solid rgba(212,90,90,.4)"
    a.textContent = msg
  }
  function mostrarOk(msg){
    let a = document.getElementById("alerta")
    a.style.display = "block"
    a.style.background = "rgba(98,184,117,.12)"
    a.style.border = "1px solid rgba(98,184,117,.35)"
    a.textContent = msg
  }
}

export { setSistema, renderPrecios, renderFormulario }
