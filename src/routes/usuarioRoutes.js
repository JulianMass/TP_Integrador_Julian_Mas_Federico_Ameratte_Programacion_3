const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const validarUsuario = require('../middlewares/validarUsuario');
const verificarAdministrador = require('../middlewares/verificarAdministrador');

// Registrar un nuevo cliente
router.post('/', validarUsuario, usuarioController.crearUsuario);

// Iniciar sesión de administrador
router.post('/login', usuarioController.iniciarSesion);

// Cerrar sesión de administrador
router.post('/logout', usuarioController.cerrarSesion);

// Crear un nuevo administrador (sólo administrador)
router.post('/admin', verificarAdministrador, validarUsuario, usuarioController.crearAdministrador);

module.exports = router;