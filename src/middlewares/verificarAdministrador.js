// Verificar si existe una sesión de administrador
const verificarAdministrador = (req, res, next) => {

    if (
        !req.session ||
        !req.session.administradorId ||
        req.session.rol !== 'admin'
    ) {
        return res.status(401).json({
            mensaje: 'No autorizado. Debe iniciar sesión como administrador.'
        });
    }

    next();
};

module.exports = verificarAdministrador;