const {Usuario} = require('../models');
const bcrypt = require('bcrypt');

// Registrar nuevo cliente
const crearUsuario = async (req, res) => {
    try {
        const {nombre, email, password} = req.body;

        // Generar hash de la contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // Crear el usuario en la base de datos
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password: passwordEncriptada,
            rol: 'cliente'
        });

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email
            }
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                mensaje: 'El correo electrónico ya está registrado'
            });
        }

        res.status(500).json({
            mensaje: 'Error al crear el usuario',
            error: error.message
        });
    }
};

// Crear un nuevo usuario administrador
const crearAdministrador = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Generar hash de la contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // Crear el administrador en la base de datos
        const nuevoAdministrador = await Usuario.create({
            nombre,
            email,
            password: passwordEncriptada,
            rol: 'admin'
        });

        res.status(201).json({
            mensaje: 'Administrador creado correctamente',
            usuario: {
                id: nuevoAdministrador.id,
                nombre: nuevoAdministrador.nombre,
                email: nuevoAdministrador.email,
                rol: nuevoAdministrador.rol
            }
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                mensaje: 'El correo electrónico ya está registrado'
            });
        }

        res.status(500).json({
            mensaje: 'Error al crear el administrador',
            error: error.message
        });
    }
};

// Iniciar sesión de administrador
const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por correo electrónico
        const usuario = await Usuario.findOne({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Correo electrónico o contraseña incorrectos'
            });
        }

        // Comparar contraseña ingresada con el hash almacenado
        const contraseñaValida = await bcrypt.compare(
            password,
            usuario.password
        );

        // Verificar contraseña y rol de administrador
        if (!contraseñaValida || usuario.rol !== 'admin') {
            return res.status(401).json({
                mensaje: 'Correo electrónico o contraseña incorrectos'
            });
        }

        // Regenerar la sesión por seguridad
        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    mensaje: 'Error al iniciar sesión'
                });
            }

            // Guardar los datos del administrador en la sesión
            req.session.administradorId = usuario.id;
            req.session.rol = usuario.rol;

            // Guardar la sesión antes de responder
            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        mensaje: 'Error al guardar la sesión'
                    });
                }

                res.status(200).json({
                    mensaje: 'Inicio de sesión correcto',
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        email: usuario.email,
                        rol: usuario.rol
                    }
                });
            });
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

// Cerrar sesión de administrador
const cerrarSesion = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al cerrar sesión'
            });
        }

        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.status(200).json({
            mensaje: 'Sesión cerrada correctamente'
        });
    });
};

module.exports = {
    crearUsuario, crearAdministrador, iniciarSesion, cerrarSesion
};




/* Para crear administrador desde consola

fetch('/api/usuarios/admin', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        nombre: 'Segundo Administrador',
        email: 'admin2@techpoint.com',
        password: 'TechPoint123'
    })
})
.then(async respuesta => {
    console.log('Código HTTP:', respuesta.status);
    console.log('Respuesta:', await respuesta.json());
});

*/