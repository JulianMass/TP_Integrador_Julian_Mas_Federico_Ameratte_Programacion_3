const express = require('express');
const path = require('path');
const session = require('express-session');

const productoRoutes = require('../routes/productoRoutes');
const ventaRoutes = require('../routes/ventaRoutes');
const usuarioRoutes = require('../routes/usuarioRoutes');
const verificarAdministrador = require('../middlewares/verificarAdministrador');

const app = express();

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

// Configuración para recibir datos JSON 
app.use(express.json());

// Configuración para recibir datos de formularios
app.use(express.urlencoded({ extended: true }));

// Archivos públicos del cliente
app.use('/cliente', express.static(path.join(__dirname, '../../public/cliente')));

// Archivos de imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', __dirname);

app.get('/', (req, res) => {
    res.redirect('/cliente/index.html');
});

// Login del administrador (acceso público)
app.get('/admin/login.html', (req, res) => {
    res.render('login');
});

// Dashboard protegido (vista EJS)
app.get('/admin/dashboard.html', verificarAdministrador, (req, res) => {
    res.render('dashboard');
});

// Gestión de productos protegida (vista EJS)
app.get('/admin/productos.html', verificarAdministrador, (req, res) => {
    res.render('productos');
});

// Archivos CSS, JavaScript e imágenes del administrador
app.use('/admin/css', express.static(path.join(__dirname, '../../public/admin/css')));

app.use('/admin/js', express.static(path.join(__dirname, '../../public/admin/js')));

app.use('/admin/img', express.static(path.join(__dirname, '../../public/admin/img')));

app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/usuarios', usuarioRoutes);

module.exports = app;