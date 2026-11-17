// Validar los datos recibidos de una venta
const validarVenta = (req, res, next) => {
    const {nombreCliente, productos} = req.body || {};

    const errores = [];

    // Validar nombre del cliente
    if (typeof nombreCliente !== 'string' || nombreCliente.trim() === '') {
        errores.push('El nombre del cliente es obligatorio');
    }

    // Validar que se haya enviado al menos un producto
    if (!Array.isArray(productos) || productos.length === 0) {
        errores.push('La venta debe incluir al menos un producto');
    } else {

        // Validar cada producto de la venta
        productos.forEach((producto, indice) => {

            if (!Number.isInteger(Number(producto.id)) || Number(producto.id) <= 0) {
                errores.push(`El ID del producto ${indice + 1} no es válido`);
            }

            if (
                producto.cantidad === '' ||
                typeof producto.cantidad === 'boolean' ||
                !Number.isInteger(Number(producto.cantidad)) ||
                Number(producto.cantidad) <= 0
            ) {
                errores.push(`La cantidad del producto ${indice + 1} debe ser un entero mayor que cero`);
            }
        });
    }

    // Si existen errores, devolverlos
    if (errores.length > 0) {
        return res.status(400).json({
            mensaje: 'Error en los datos de la venta',
            errores
        });
    }

    // Si todo está correcto, continuar
    next();
};

module.exports = validarVenta;