const {Venta, Producto, DetalleVenta} = require('../models');
const sequelize = require('../config/database');

// Obtener todas las ventas junto con sus productos
const obtenerVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [{
                model: Producto,
                through: {
                    attributes: ['cantidad', 'precioUnitario'] // En DetalleVenta
                }
            }],
            order: [['fecha', 'DESC']]
        });

        res.status(200).json({
            totalVentas: ventas.length,
            ventas
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las ventas',
            error: error.message
        });
    }
};

// Registrar una nueva venta
const crearVenta = async (req, res) => {
    try {
        const {nombreCliente, productos} = req.body;

        const resultado = await sequelize.transaction(async (transaction) => {
            let totalCentavos = 0;
            const detalles = [];
            const productosActualizados = [];

            // Agrupar las cantidades de productos repetidos
            const cantidadesPorProducto = new Map();

            for (const item of productos) {
                const id = Number(item.id);
                const cantidad = Number(item.cantidad);

                const cantidadActual = cantidadesPorProducto.get(id) || 0;

                cantidadesPorProducto.set(id, cantidadActual + cantidad);
            }

            // Convertir los productos agrupados en un array
            const productosAgrupados = Array.from(
                cantidadesPorProducto,
                ([id, cantidad]) => ({ id, cantidad })
            );

            // Buscar y validar cada producto
            for (const item of productosAgrupados) {
                const producto = await Producto.findByPk(item.id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });

                if (!producto) {
                    const error = new Error(`El producto ${item.id} no existe`);
                    error.status = 404;
                    throw error;
                }

                if (!producto.activo) {
                    const error = new Error(`El producto ${item.id} está inactivo`);
                    error.status = 400;
                    throw error;
                }

                if (producto.stock < item.cantidad) {
                    const error = new Error(
                        `Stock insuficiente para el producto ${producto.nombre}`
                    );

                    error.status = 400;
                    throw error;
                }

                // Calcular el importe de este producto
                const precioCentavos = Math.round(Number(producto.precio) * 100);
                totalCentavos += precioCentavos * item.cantidad;

                // Preparar el detalle de la venta
                detalles.push({
                    productoId: producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: producto.precio
                });

                // Descontar las unidades vendidas del stock
                productosActualizados.push({
                    producto,
                    nuevoStock: producto.stock - item.cantidad
                });
            }

            // Crear la venta
            const venta = await Venta.create({
                nombreCliente,
                total: (totalCentavos / 100).toFixed(2)
            }, {transaction});

            // Asociar los productos mediante DetalleVenta
            await Promise.all(detalles.map(detalle =>
                DetalleVenta.create({
                    ...detalle,
                    ventaId: venta.id
                }, {transaction})
            ));

            // Actualizar el stock
            for (const item of productosActualizados) {
                await item.producto.update({
                    stock: item.nuevoStock
                }, {transaction});
            }

            return venta;
        });

        // Recuperar la venta con sus productos asociados
        const ventaCompleta = await Venta.findByPk(resultado.id, {
            include: [{
                model: Producto,
                through: {
                    attributes: ['cantidad', 'precioUnitario']
                }
            }]
        });

        res.status(201).json({
            mensaje: 'Venta registrada correctamente',
            venta: ventaCompleta
        });

    } catch (error) {
        console.error('Error al registrar la venta:', error);

        res.status(error.status || 500).json({
            mensaje: 'No se pudo registrar la venta',
            error: error.message
        });
    }
};

module.exports = {
    obtenerVentas, crearVenta
};