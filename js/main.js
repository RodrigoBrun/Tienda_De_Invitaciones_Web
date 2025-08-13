/* =========================================================
   main.js — Sidebar + Modo oscuro + Navegación + WhatsApp + Form
   - NO toca el dominio (eso vive en clases.js)
   - Usa data-target para navegar entre secciones
   - Mobile-first: cierra sidebar al elegir una opción
   - Fixes: overlay, stopPropagation, tecla ESC, sombra header, link activo
========================================================= */

document.addEventListener('DOMContentLoaded', ()=>{

  // =========================================
  // ✨ AOS (animaciones on-scroll)
  // =========================================
  if(window.AOS){ AOS.init() }

  // =========================================
  // 🗓️ Año en footer (auto)
  // =========================================
  let y = document.getElementById('anio')
  if(y){ y.textContent = new Date().getFullYear() }

  // =========================================
  // 🍔 Sidebar + Overlay (abre/cierra en mobile)
  // - IDs requeridos: #hamburguesa, #sidebar, #cerrar-sidebar, #overlay
  // =========================================
  let hamburguesa  = document.getElementById('hamburguesa')
  let sidebar      = document.getElementById('sidebar')
  let cerrarSidebar= document.getElementById('cerrar-sidebar')
  let overlay      = document.getElementById('overlay')

  function abrirSidebar(){
    sidebar?.classList.add('active')
    overlay?.classList.add('active')
  }
  function cerrarSidebarFn(){
    sidebar?.classList.remove('active')
    overlay?.classList.remove('active')
  }

  if(hamburguesa && sidebar){
    hamburguesa.addEventListener('click', (e)=>{
      e.stopPropagation() // evita cierre inmediato por click global
      if(sidebar.classList.contains('active')) cerrarSidebarFn()
      else abrirSidebar()
    })
  }
  if(cerrarSidebar){
    cerrarSidebar.addEventListener('click', (e)=>{
      e.stopPropagation()
      cerrarSidebarFn()
    })
  }
  if(overlay){
    overlay.addEventListener('click', cerrarSidebarFn) // tap en cortina cierra
  }

  // Cerrar al hacer click fuera del panel
  document.addEventListener('click', (e)=>{
    if(!sidebar) return
    let clickDentro = sidebar.contains(e.target) || (hamburguesa && hamburguesa.contains(e.target))
    if(!clickDentro){ cerrarSidebarFn() }
  })

  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){ cerrarSidebarFn() }
  })

  // Evitar que los clicks internos del panel se propaguen
  if(sidebar){ sidebar.addEventListener('click', (e)=> e.stopPropagation()) }


  // =========================================
  // 🧭 Navegación por data-target (navbar + sidebar + CTAs)
  // =========================================
  let links = document.querySelectorAll('.nav-link[data-target]')
  for (let link of links){
    link.addEventListener('click', (e)=>{
      e.preventDefault()
      let id = link.getAttribute('data-target')
      irASeccion(id)
      cerrarSidebarFn()              // cerrar panel en mobile
      marcarActivo(id)
    })
  }

  // Smooth para anchors tradicionales (href="#id")
  let anchors = document.querySelectorAll('a[href^="#"]')
  for (let a of anchors){
    a.addEventListener('click', (e)=>{
      let id = a.getAttribute('href')
      if(!id || id === '#') return
      let el = document.querySelector(id)
      if(el){
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  // =========================================
  // 🟢 WhatsApp (botón flotante + CTA contacto)
  // =========================================
  let numero = "59892992182" // ← tu número
  let bw = document.getElementById('btn-wapp')
  if(bw){ bw.href = "https://wa.me/" + numero }
  let cta = document.getElementById('cta-wapp')
  if(cta){ cta.href = "https://wa.me/" + numero }

  // =========================================
  // 📝 Form "Solicitar" → WhatsApp
  // =========================================
  let form = document.getElementById('form-solicitud')
  let alerta = document.getElementById('alerta')

  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault()

      let tipo       = val('tipo-evento')
      let nombre     = val('nombre-evento')
      let fecha      = val('fecha-evento')
      let cancion    = val('cancion')
      let tipografia = val('tipografia')
      let sobre      = val('sobre')
      let contacto   = val('contacto')
      let mensaje    = val('mensaje')

      if(!contacto){
        mostrarAlerta("Falta contacto (WhatsApp o email).", true)
        return
      }

      let texto =
        `Hola! Quiero una invitación web.%0A` +
        `Tipo: ${tipo}%0A` +
        `Evento: ${nombre}%0A` +
        `Fecha: ${fecha}%0A` +
        `Canción: ${cancion}%0A` +
        `Tipografía: ${tipografia}%0A` +
        `Sobre: ${sobre}%0A` +
        `Contacto: ${contacto}%0A` +
        `Detalles: ${mensaje}`

      window.open(`https://wa.me/${numero}?text=${texto}`, "_blank")
      mostrarAlerta("¡Listo! Te abro WhatsApp con tus datos.", false)
      form.reset()
    })
  }

  // =========================================
  // ⛳ Estado inicial mobile (opcional)
  // =========================================
  if(window.matchMedia('(max-width: 768px)').matches){
    marcarActivo('hero')
  }

  // =========================================
  // 🌫️ Sombra del header al hacer scroll
  // =========================================
  let header = document.querySelector('.header')
  function updateHeaderShadow(){
    if(!header) return
    if(window.scrollY > 2){ header.classList.add('with-shadow') }
    else { header.classList.remove('with-shadow') }
  }
  updateHeaderShadow()
  window.addEventListener('scroll', updateHeaderShadow, { passive: true })

  // =========================================
  // 🔎 Link activo por sección visible
  // =========================================
  let secciones = document.querySelectorAll('.seccion[id]')
  if('IntersectionObserver' in window && secciones.length){
    let obs = new IntersectionObserver((entries)=>{
      let visible = entries
        .filter(en => en.isIntersecting)
        .sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0]
      if(!visible) return
      let id = visible.target.getAttribute('id')
      marcarActivo(id)
    }, { root: null, threshold: [0.4, 0.6, 0.8] })
    for (let s of secciones){ obs.observe(s) }
  }

  // ================================
  // Helpers
  // ================================
  function val(id){ return (document.getElementById(id)?.value || '').trim() }

  function mostrarAlerta(msg, esError){
    if(!alerta) return
    alerta.style.display = "block"
    alerta.textContent = msg
    if(esError){
      alerta.style.background = "rgba(212,90,90,.1)"
      alerta.style.border = "1px solid rgba(212,90,90,.35)"
      alerta.style.color = "#9a3c3c"
    } else {
      alerta.style.background = "rgba(98,184,117,.12)"
      alerta.style.border = "1px solid rgba(98,184,117,.35)"
      alerta.style.color = "#1f5130"
    }
  }

  function irASeccion(id){
    let el = document.getElementById(id)
    if(!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function marcarActivo(id){
    let todos = document.querySelectorAll('.nav-link[data-target]')
    for (let a of todos){ a.classList.remove('is-active') }
    let activos = document.querySelectorAll(`.nav-link[data-target="${id}"]`)
    for (let a of activos){ a.classList.add('is-active') }
  }
})
