const express = require('express');
const router = express.Router();

const productoController = require('../controllers/productoController');
const validarProducto = require('../middlewares/validarProducto');
const subirImagen = require('../middlewares/subirImagen');
const verificarAdministrador = require('../middlewares/verificarAdministrador');

// Consultar productos
router.get('/', (req, res, next) => {

    // Si solicita productos inactivos, verificar que sea administrador
    if (req.query.incluirInactivos === 'true') {
        return verificarAdministrador(req, res, next);
    }

    // Si no solicita productos inactivos, continuar
    next();

}, productoController.obtenerProductos);

// Crear producto (solo administrador)
router.post('/', verificarAdministrador, subirImagen.single('imagen'), validarProducto, productoController.crearProducto);

// Modificar producto (solo administrador)
router.put('/:id', verificarAdministrador, subirImagen.single('imagen'), validarProducto, productoController.modificarProducto);

// Dar de baja un producto (solo administrador)
router.delete( '/:id', verificarAdministrador, productoController.eliminarProducto);

// Reactivar un producto (solo administrador)
router.put('/:id/reactivar', verificarAdministrador, productoController.reactivarProducto);

module.exports = router;