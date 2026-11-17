// Recuperar el tema guardado o utilizar el tema claro por defecto
let temaActual = localStorage.getItem('tema') || 'claro';

// Aplicar el tema al documento
const aplicarTema = () => {
    document.body.classList.remove('tema-claro', 'tema-oscuro');
    document.body.classList.add(`tema-${temaActual}`);
};

// Cambiar entre tema claro y oscuro
const cambiarTema = () => {

    if (temaActual === 'claro') {
        temaActual = 'oscuro';
    } else {
        temaActual = 'claro';
    }

    // Guardar la preferencia
    localStorage.setItem('tema', temaActual);

    aplicarTema();

    actualizarBotonTema();
};

// Actualizar el texto del botón
const actualizarBotonTema = () => {

    const btnTema = document.getElementById('btnTema');

    if (btnTema) {
        btnTema.textContent = temaActual === 'claro'
            ? '🌙 Tema oscuro'
            : '☀️ Tema claro';
    }
};

// Inicializar el tema al cargar la página
aplicarTema();
actualizarBotonTema();

// Configurar el botón cuando exista
document.addEventListener('DOMContentLoaded', () => {

    const btnTema = document.getElementById('btnTema');

    if (btnTema) {
        btnTema.addEventListener('click', cambiarTema);
    }

});