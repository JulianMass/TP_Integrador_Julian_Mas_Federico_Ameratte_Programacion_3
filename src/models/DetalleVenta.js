const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define('DetalleVenta', {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'detalles_venta'
});

module.exports = DetalleVenta;