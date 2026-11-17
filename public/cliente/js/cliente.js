// Obtener el formulario de bienvenida
const formulario = document.getElementById('formBienvenida');

// Detectar cuando el cliente presiona Comenzar
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Obtener y limpiar el nombre ingresado
    const nombre = document.getElementById('nombreCliente').value.trim();

    // Validar que no esté vacío
    if (nombre === '') {
        alert('Por favor, ingresá tu nombre para continuar.');
        return;
    }

    // Guardar el nombre durante la sesión del cliente
    sessionStorage.setItem('nombreCliente', nombre);

    // Ir al catálogo de productos
    window.location.href = 'catalogo.html';
});