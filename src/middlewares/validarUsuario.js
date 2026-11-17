// Validar los datos recibidos de un usuario
const validarUsuario = (req, res, next) => {
    const {nombre, email, password} = req.body || {};

    const errores = [];

    // Validar nombre
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('El nombre es obligatorio');
    }

    // Validar email
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.push('El correo electrónico no es válido');
    }

    // Validar contraseña
    if (typeof password !== 'string' || password.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Si existen errores, devolverlos
    if (errores.length > 0) {
        return res.status(400).json({
            mensaje: 'Error en los datos del usuario',
            errores
        });
    }

    // Si todo está correcto, continuar
    next();
};

module.exports = validarUsuario;