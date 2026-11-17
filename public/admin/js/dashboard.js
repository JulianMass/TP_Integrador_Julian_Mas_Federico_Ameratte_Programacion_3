// Recuperar los datos del administrador
const administradorGuardado = sessionStorage.getItem('administrador');

// Obtener elementos del HTML
const nombreAdministrador = document.getElementById('nombreAdministrador');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Verificar si existe un administrador guardado
if (!administradorGuardado) {
    window.location.href = '/admin/login.html';

} else {
    // Mostrar el nombre del administrador
    const administrador = JSON.parse(administradorGuardado);

    if (nombreAdministrador) {
        nombreAdministrador.textContent = `Hola, ${administrador.nombre}`;
    }
}

// Cerrar sesión
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', async () => {

        try {
            const respuesta = await fetch('/api/usuarios/logout', {
                method: 'POST'
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo cerrar la sesión');
            }

            // Limpiar los datos del navegador
            sessionStorage.removeItem('administrador');

            // Volver al login
            window.location.href = '/admin/login.html';

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });
}