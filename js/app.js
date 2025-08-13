/* =========================================================
   app.js — Bootstrap, navegación y wiring de módulos UI
   - Dominio en clases.js; la UI se arma en home.js / tienda.js.
========================================================= */
import { Sistema } from './clases.js'
import { setSistema as setHomeSistema, renderDisenos } from './home.js'
import { setSistema as setTiendaSistema, renderPrecios, renderFormulario } from './tienda.js'

let sistema = null

document.addEventListener('DOMContentLoaded', ()=>{
  // ✅ AOS
  if(window.AOS){ AOS.init() }

  // 🧠 Dominio
  sistema = new Sistema()
  sistema.precargar()

  // Compartimos instancia a módulos UI
  setHomeSistema(sistema)
  setTiendaSistema(sistema)

  // 🟢 WhatsApp flotante (acá se cambia el número)
  let w = document.getElementById('btn-wapp')
  if(w){ w.href = "https://wa.me/59892992182" }

  // 🗺️ Navegación por data-section
  let app = document.getElementById('app')
  let botones = document.querySelectorAll('[data-section]')
  for (let b of botones){
    b.addEventListener('click', (e)=>{
      let sec = b.getAttribute('data-section')
      navegar(sec)
    })
  }

  // 🏠 Carga inicial
  navegar('disenos')
})

/* ================================
   🚏 Router minimalista
================================ */
function navegar(sec){
  let app = document.getElementById('app')
  if(!app) return

  if(sec === 'disenos'){ renderDisenos(app); return }
  if(sec === 'precios'){ renderPrecios(app); return }
  if(sec === 'solicitar'){ renderFormulario(app); return }

  // fallback
  app.innerHTML = `<section class = "bloque"><h1>Página en construcción</h1></section>`
}
