const {Producto} = require('../models');

// Obtener productos activos con paginación
const obtenerProductos = async (req, res) => {
    try {
        const pagina = Number(req.query.pagina || 1);
        const limite = Number(req.query.limite || 5);

        // Validar los parámetros de paginación
        if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(limite) || limite < 1 || limite > 50) {
            return res.status(400).json({
                mensaje: 'Los parámetros de paginación no son válidos'
            });
        }

        const offset = (pagina - 1) * limite;

        // Determinar si se deben mostrar también los productos inactivos
        const incluirInactivos = req.query.incluirInactivos === 'true';

        const resultado = await Producto.findAndCountAll({
            where: incluirInactivos ? {} : { activo: true },
            limit: limite,
            offset: offset,
            order: [['id', 'ASC']]
        });

        res.status(200).json({
            totalProductos: resultado.count,
            totalPaginas: Math.ceil(resultado.count / limite),
            paginaActual: pagina,
            productos: resultado.rows
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los productos',
            error: error.message
        });
    }
};

// Registrar nuevo producto
const crearProducto = async (req, res) => {
    try {
        const {nombre, descripcion, precio, stock, categoria} = req.body;

        const nuevoProducto = await Producto.create({
            nombre, descripcion, precio, stock, categoria, imagen: req.file ? '/uploads/' + req.file.filename : null
        });

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            producto: nuevoProducto
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el producto',
            error: error.message
        });
    }
};

// Modificar un producto existente
const modificarProducto = async (req, res) => {
    try {
        const {id} = req.params;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        const camposPermitidos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];

        const datosActualizar = {};

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                datosActualizar[campo] = req.body[campo];
            }
        });

        // Si se recibió una nueva imagen, guardar su ruta
        if (req.file) {
            datosActualizar.imagen = '/uploads/' + req.file.filename;
        }

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                mensaje: 'No se recibieron datos para modificar'
            });
        }

        await producto.update(datosActualizar);

        res.status(200).json({
            mensaje: 'Producto modificado correctamente',
            producto
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al modificar el producto',
            error: error.message
        });
    }
};

// Dar de baja un producto
const eliminarProducto = async (req, res) => {
    try {
        const {id} = req.params;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        await producto.update({
            activo: false
        });

        res.status(200).json({
            mensaje: 'Producto dado de baja correctamente',
            producto
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al dar de baja el producto',
            error: error.message
        });
    }
};

// Reactivar un producto
const reactivarProducto = async (req, res) => {
    try {
        const {id} = req.params;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        await producto.update({
            activo: true
        });

        res.status(200).json({
            mensaje: 'Producto reactivado correctamente',
            producto
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al reactivar el producto',
            error: error.message
        });
    }
};

module.exports = {
    obtenerProductos, crearProducto, modificarProducto, eliminarProducto, reactivarProducto
};