/* =========================================================
   clases.js — Dominio del sistema (UMD, sin tocar el DOM)
   - Entidades: Estilo, ProductoInvitacion, PedidoInvitacion
   - Sistema: administra productos, tipos de evento y pedidos
   - Expone en: window.Sistema (y CommonJS si existe)
========================================================= */
(function (global) {
  'use strict';

  // ================================
  // 📦 Entidades
  // ================================
  class Estilo {
    constructor(nombre){ this.nombre = nombre }
  }

  class ProductoInvitacion {
    constructor(id, nombre, descripcion, precioBase, estilos){
      this.id = id;
      this.nombre = nombre;
      this.descripcion = descripcion;
      this.precioBase = Number(precioBase || 0); // número (USD)
      this.estilos = Array.isArray(estilos) ? estilos : [];
    }
  }

  class PedidoInvitacion {
    // datos: { tipoEvento, nombreEvento, fecha, cancion, tipografia, sobre, mensaje, contacto }
    constructor(datos){
      this.tipoEvento   = datos.tipoEvento || '';
      this.nombreEvento = datos.nombreEvento || '';
      this.fecha        = datos.fecha || '';
      this.cancion      = datos.cancion || '';
      this.tipografia   = datos.tipografia || '';
      this.sobre        = datos.sobre || '';
      this.mensaje      = datos.mensaje || '';
      this.contacto     = datos.contacto || '';
      this.estado       = 'Nuevo';     // "Nuevo" | "En proceso" | "Listo"
      this.creado       = new Date();  // timestamp
    }
  }

  // ================================
  // 🧠 Sistema (admin general)
  // ================================
  class Sistema {
    constructor(){
      this.productos   = []; // Array<ProductoInvitacion>
      this.pedidos     = []; // Array<PedidoInvitacion>
      this.tiposEvento = []; // Array<string>
    }

    // ⚙️ Precarga inicial (editá acá tu catálogo y tipos)
    precargar(){
      const estilos = [
        new Estilo('Elegante'),
        new Estilo('Minimalista'),
        new Estilo('Floral'),
      ];

      this.productos.push(
        new ProductoInvitacion(1, 'Clásica', 'Diseño base, galería y datos del evento.', 1000, estilos)
      );
      this.productos.push(
        new ProductoInvitacion(2, 'Premium', 'Música, sobre animado, RSVP conectado.', 1500, estilos)
      );

      this.tiposEvento.push(
        'Fiesta privada',
        'Cumpleaños de 15',
        'Cumpleaños',
        'Fiesta sorpresa',
        'Aniversario',
        'Boda'
      );
    }

    // Consultas (devolvemos copias para no mutar estado interno sin querer)
    obtenerProductos(){ return this.productos.map(p => ({ ...p })); }
    obtenerTiposEvento(){ return this.tiposEvento.slice(); }
    obtenerPedidos(){ return this.pedidos.map(p => ({ ...p })); }

    // Alta de pedido (con validaciones básicas)
    altaPedido(datos){
      if(!datos) throw new Error('Datos de pedido vacíos.');
      if(!datos.tipoEvento) throw new Error('Falta tipo de evento.');
      if(!datos.contacto) throw new Error('Falta contacto del cliente.');
      const pedido = new PedidoInvitacion(datos);
      this.pedidos.push(pedido);
      return pedido;
    }
  }

  // ================================
  // 🌍 Export UMD
  // ================================
  global.Sistema = Sistema;
  global.ProductoInvitacion = ProductoInvitacion;
  global.PedidoInvitacion = PedidoInvitacion;
  global.Estilo = Estilo;

  // CommonJS (Node / bundlers que no usen ESM)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Sistema, ProductoInvitacion, PedidoInvitacion, Estilo };
  }

})(typeof window !== 'undefined' ? window : this);
