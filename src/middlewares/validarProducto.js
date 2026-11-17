// Validar los datos recibidos de un producto
const validarProducto = (req, res, next) => {
    const {nombre, descripcion, precio, stock, categoria} = req.body || {};

    const errores = [];

    const esCreacion = req.method === 'POST';

    // Validar nombre
    if (esCreacion || nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            errores.push('El nombre es obligatorio');
        }
    }

    // Validar descripción
    if (esCreacion || descripcion !== undefined) {
        if (typeof descripcion !== 'string' || descripcion.trim() === '') {
            errores.push('La descripción es obligatoria');
        }
    }

    // Validar precio
    if (esCreacion || precio !== undefined) {
        if (precio === '' || typeof precio === 'boolean' || !Number.isFinite(Number(precio)) || Number(precio) <= 0) {
            errores.push('El precio debe ser un número mayor que cero');
        }
    }

    // Validar stock
    if (esCreacion || stock !== undefined) {
        if (stock === '' || typeof stock === 'boolean' || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
            errores.push('El stock debe ser un número entero mayor o igual a cero');
        }
    }

    // Validar categoría
    if (esCreacion || categoria !== undefined) {
        if (!['perifericos', 'accesorios'].includes(categoria)) {
            errores.push('La categoría debe ser perifericos o accesorios');
        }
    }

    // Si existen errores, devolverlos
    if (errores.length > 0) {
        return res.status(400).json({
            mensaje: 'Error en los datos del producto',
            errores
        });
    }

    // Si todo está correcto, continuar
    next();
};

module.exports = validarProducto;