const express = require('express');
const router = express.Router();

const ventaController = require('../controllers/ventaController');
const validarVenta = require('../middlewares/validarVenta');
const verificarAdministrador = require('../middlewares/verificarAdministrador');
const { generarTicketPDF } = require('../services/ticketService');

// Obtener todas las ventas (solo administrador)
router.get('/', verificarAdministrador, ventaController.obtenerVentas);

// Registrar una nueva venta (acceso público)
router.post('/', validarVenta, ventaController.crearVenta);

// Descargar el ticket de una venta en PDF
router.get('/:id/pdf', async (req, res) => {
    try {
        const {Venta, Producto} = require('../models');

        const venta = await Venta.findByPk(req.params.id, {
            include: [{
                model: Producto,
                through: {
                    attributes: ['cantidad', 'precioUnitario']
                }
            }]
        });

        // Comprobar que exista la venta
        if (!venta) {
            return res.status(404).json({
                mensaje: 'No se encontró la venta solicitada'
            });
        }

        // Generar el PDF
        const pdf = await generarTicketPDF(venta);

        // Enviar el archivo al navegador
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ticket-${venta.id}.pdf"`);

        res.send(pdf);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al generar el ticket PDF',
            error: error.message
        });
    }
});

module.exports = router;