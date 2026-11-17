const multer = require('multer');
const path = require('path');

// Configurar dónde se guardan las imágenes
const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },

    // Asignar un nombre único a cada imagen
    filename: (req, file, cb) => {
        const nombre = Date.now() + path.extname(file.originalname);
        cb(null, nombre);
    }
});

// Validar el formato de la imagen
const filtrarImagen = (req, file, cb) => {
    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp']; // JPEG incluye JPG

    if (formatosPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Sólo se permiten imágenes JPG, JPEG, PNG y WEBP'));
    }
};

// Configurar Multer
const subirImagen = multer({
    storage: almacenamiento,
    fileFilter: filtrarImagen,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = subirImagen;