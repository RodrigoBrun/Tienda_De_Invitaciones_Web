/* =========================================================
   clases.js — Dominio del sistema
   - Entidades: Plan, Extra, PedidoInvitacion
   - Clase Sistema: administra planes y cálculo de precios
   - No toca el DOM (solo lógica y datos)
========================================================= */
(function (global) {
  'use strict';

  // ================================
  // 📦 Entidad Plan
  // ================================
  class Plan {
    constructor(nombre, precioUSD) {
      this.nombre = nombre;            // string
      this.precioUSD = Number(precioUSD) || 0; // número
    }
  }

  // ================================
  // 🎁 Entidad Extra
  // ================================
  class Extra {
    constructor(nombre, precioPesos) {
      this.nombre = nombre;            // string
      this.precioPesos = Number(precioPesos) || 0; // número en pesos
    }
  }

  // ================================
  // 📝 Pedido de invitación
  // ================================
  class PedidoInvitacion {
    constructor(plan) {
      if (!(plan instanceof Plan)) {
        throw new Error('El pedido debe tener un Plan válido');
      }
      this.plan = plan;
      this.extras = []; // Array<Extra>
    }

    agregarExtra(extra) {
      if (!(extra instanceof Extra)) {
        throw new Error('El extra debe ser instancia de Extra');
      }
      this.extras.push(extra);
    }

    quitarExtraPorNombre(nombre) {
      this.extras = this.extras.filter(e => e.nombre !== nombre);
    }

    getPrecioBaseUSD() {
      return this.plan.precioUSD;
    }

    getTotalExtrasPesos() {
      return this.extras.reduce((acc, e) => acc + e.precioPesos, 0);
    }

    getTotalUSD() {
      return this.getPrecioBaseUSD();
    }
  }

  // ================================
  // 🛠️ Clase Sistema (administradora)
  // ================================
  class Sistema {
    constructor() {
      // Pre-carga de planes y extras disponibles
      this.planes = [
        new Plan('clasica', 1000),
        new Plan('premium', 1500)
      ];

      this.extrasDisponibles = [
        new Extra('Sobre personalizado', 150)
      ];
    }

    obtenerPlan(nombre) {
      return this.planes.find(p => p.nombre.toLowerCase() === nombre.toLowerCase()) || null;
    }

    obtenerExtra(nombre) {
      return this.extrasDisponibles.find(e => e.nombre.toLowerCase() === nombre.toLowerCase()) || null;
    }

    crearPedido(nombrePlan) {
      const plan = this.obtenerPlan(nombrePlan);
      if (!plan) throw new Error('Plan no encontrado');
      return new PedidoInvitacion(plan);
    }
  }

  // ================================
  // 🌍 Exponer al ámbito global
  // ================================
  global.Sistema = Sistema;
  global.Plan = Plan;
  global.Extra = Extra;
  global.PedidoInvitacion = PedidoInvitacion;

})(window);
