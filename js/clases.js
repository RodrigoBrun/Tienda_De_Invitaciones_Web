/* =========================================================
   clases.js — Dominio del sistema (sin tocar el DOM)
   - Entidades: Estilo, ProductoInvitacion, PedidoInvitacion
   - Sistema: administra productos, tipos de evento y pedidos
   - Se exporta con ES6 y puede ser importado por otros módulos
========================================================= */

// ================================
// 📦 Entidades
// ================================
class Estilo {
  constructor(nombre){ this.nombre = nombre }
}

class ProductoInvitacion {
  constructor(id, nombre, descripcion, precioBase, estilos){
    this.id = id
    this.nombre = nombre
    this.descripcion = descripcion
    this.precioBase = precioBase   // número (USD)
    this.estilos = estilos         // Array<Estilo>
  }
}

class PedidoInvitacion {
  // datos: { tipoEvento, nombreEvento, fecha, cancion, tipografia, sobre, mensaje, contacto }
  constructor(datos){
    this.tipoEvento = datos.tipoEvento
    this.nombreEvento = datos.nombreEvento
    this.fecha = datos.fecha
    this.cancion = datos.cancion
    this.tipografia = datos.tipografia
    this.sobre = datos.sobre
    this.mensaje = datos.mensaje
    this.contacto = datos.contacto
    this.estado = "Nuevo"  // "Nuevo" | "En proceso" | "Listo"
    this.creado = new Date()
  }
}

// ================================
// 🧠 Sistema (admin general)
// ================================
class Sistema {
  constructor(){
    this.productos = new Array()   // Array<ProductoInvitacion>
    this.pedidos = new Array()     // Array<PedidoInvitacion>
    this.tiposEvento = new Array() // Array<string>
  }

  // ⚙️ Precarga inicial (editá acá tu catálogo y tipos)
  precargar(){
    let estilos = new Array()
    estilos.push(new Estilo("Elegante"))
    estilos.push(new Estilo("Minimalista"))
    estilos.push(new Estilo("Floral"))

    this.productos.push(
      new ProductoInvitacion(1, "Clásica", "Diseño base, galería y datos del evento.", 1000, estilos)
    )
    this.productos.push(
      new ProductoInvitacion(2, "Premium", "Música, sobre animado, RSVP conectado.", 1500, estilos)
    )

    this.tiposEvento.push("Fiesta privada")
    this.tiposEvento.push("Cumpleaños de 15")
    this.tiposEvento.push("Cumpleaños")
    this.tiposEvento.push("Fiesta sorpresa")
    this.tiposEvento.push("Aniversario")
    this.tiposEvento.push("Boda")
  }

  // Consultas
  obtenerProductos(){ return this.productos }
  obtenerTiposEvento(){ return this.tiposEvento }
  obtenerPedidos(){ return this.pedidos }

  // Alta de pedido (con validaciones básicas)
  altaPedido(datos){
    if(!datos) throw new Error("Datos de pedido vacíos.")
    if(!datos.tipoEvento) throw new Error("Falta tipo de evento.")
    if(!datos.contacto) throw new Error("Falta contacto del cliente.")
    let pedido = new PedidoInvitacion(datos)
    this.pedidos.push(pedido)
    return pedido
  }
}

// Export ES6 para usar si querés importarlo en otros módulos
export { Sistema, ProductoInvitacion, PedidoInvitacion, Estilo }
