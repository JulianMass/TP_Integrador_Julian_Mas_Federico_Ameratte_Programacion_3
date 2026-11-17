const Producto = require('./Producto');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Usuario = require('./Usuario');

// Relación entre Venta y Producto
Venta.belongsToMany(Producto, {
    through: DetalleVenta,
    foreignKey: 'ventaId',
    otherKey: 'productoId'
});

Producto.belongsToMany(Venta, {
    through: DetalleVenta,
    foreignKey: 'productoId',
    otherKey: 'ventaId'
});

// Relaciones directas con la tabla intermedia
Venta.hasMany(DetalleVenta, {
    foreignKey: 'ventaId'
});

DetalleVenta.belongsTo(Venta, {
    foreignKey: 'ventaId'
});

Producto.hasMany(DetalleVenta, {
    foreignKey: 'productoId'
});

DetalleVenta.belongsTo(Producto, {
    foreignKey: 'productoId'
});

module.exports = {
    Producto,
    Venta,
    DetalleVenta,
    Usuario
};