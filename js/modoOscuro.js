/* =========================================================
   modo-oscuro.js — Gestor de tema oscuro/claro (independiente)
   - Usa variables CSS: cambia todo el sitio sin reescribir estilos
   - Respeta preferencia guardada (localStorage) o la del sistema
   - Aplica clase .modo-oscuro en <html> y <body> (a prueba de fallos)
   - Actualiza el icono del botón #btn-modo-oscuro automáticamente
   - API simple para debug: window.ModoOscuro.set(true/false), reset()
========================================================= */

class ModoOscuro {
  constructor(selectorBoton){
    // Elementos principales que vamos a tocar
    this.boton = document.querySelector(selectorBoton)
    this.html  = document.documentElement
    this.body  = document.body

    // Clave de almacenamiento
    this.storageKey = "modoOscuro"

    // Flag para saber si el usuario fijó manualmente el tema
    this.usuarioFijo = false

    // Media query del sistema (prefiere dark)
    this.mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null

    // Inicialización
    this.init()
  }

  /* ----------------------------------------
     init(): lee preferencia, aplica tema e instala listeners
  ---------------------------------------- */
  init(){
    // 1) Leer preferencia guardada
    let guardado = localStorage.getItem(this.storageKey)

    // 2) ¿Usuario ya eligió antes? (guardado !== null)
    if(guardado !== null){
      this.usuarioFijo = true
      // guardado es "true" o "false"
      let esOscuro = (guardado === "true")
      this.aplicarTema(esOscuro)
    } else {
      // 3) Primera vez → usar preferencia del sistema
      let esOscuro = this.mq ? this.mq.matches : false
      this.aplicarTema(esOscuro)
    }

    // 4) Click en botón (si existe)
    if(this.boton){
      this.boton.addEventListener("click", ()=>{
        let esOscuro = !this.body.classList.contains("modo-oscuro")
        this.usuarioFijo = true                 // desde acá respetamos elección del usuario
        localStorage.setItem(this.storageKey, esOscuro)
        this.aplicarTema(esOscuro)
      })
    }

    // 5) Cambios de tema del sistema (sólo si el usuario NO fijó su preferencia)
    if(this.mq){
      this.mq.addEventListener("change", (e)=>{
        if(!this.usuarioFijo){
          this.aplicarTema(e.matches)
        }
      })
    }

    // Exponer una mini API de utilidad para debug
    window.ModoOscuro = {
      set: (isDark)=>{ this.usuarioFijo = true; localStorage.setItem(this.storageKey, !!isDark); this.aplicarTema(!!isDark) },
      reset: ()=>{
        this.usuarioFijo = false
        localStorage.removeItem(this.storageKey)
        let esOscuro = this.mq ? this.mq.matches : false
        this.aplicarTema(esOscuro)
      }
    }
  }

  /* ----------------------------------------
     aplicarTema(esOscuro): agrega/remueve clase y actualiza icono
     - esOscuro: boolean
  ---------------------------------------- */
  aplicarTema(esOscuro){
    // Asignamos la clase en <html> y <body> (doble capa)
    if(esOscuro){
      this.html.classList.add("modo-oscuro")
      this.body.classList.add("modo-oscuro")
    } else {
      this.html.classList.remove("modo-oscuro")
      this.body.classList.remove("modo-oscuro")
    }

    // Actualizamos icono del botón si existe
    this.actualizarIcono()
  }

  /* ----------------------------------------
     actualizarIcono(): cambia el ícono del botón (luna/sol)
  ---------------------------------------- */
  actualizarIcono(){
    if(!this.boton) return
    let i = this.boton.querySelector("i")
    if(!i) return
    let oscuro = this.body.classList.contains("modo-oscuro")
    i.className = oscuro ? "ph ph-sun" : "ph ph-moon"
  }
}

/* =========================================================
   Bootstrap del módulo (no requiere imports)
   - Esperamos al DOM y activamos el gestor con #btn-modo-oscuro
========================================================= */
document.addEventListener("DOMContentLoaded", function(){
  // Instanciación siguiendo tu patrón
  // Si cambiás el id del botón, modificá el selector abajo
  let modo = new ModoOscuro("#btn-modo-oscuro")
  // no hace falta guardar la variable fuera; queda por si querés usar window.ModoOscuro.*
})
