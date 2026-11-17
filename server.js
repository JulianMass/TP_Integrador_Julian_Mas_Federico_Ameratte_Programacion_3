require('dotenv').config();

const app = require('./src/views/app');
const sequelize = require('./src/config/database');

// Importar los modelos y sus relaciones
require('./src/models');

const PORT = process.env.PORT || 3000;

// Conectar con MySQL y crear las tablas
sequelize.sync()
    .then(() => {
        console.log('Tablas creadas correctamente');

        app.listen(PORT, () => {
            console.log(`Servidor TechPoint funcionando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al crear las tablas:', error);
    });