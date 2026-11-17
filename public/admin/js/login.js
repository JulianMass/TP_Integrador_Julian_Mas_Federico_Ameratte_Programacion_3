// Obtener elementos del formulario
const formLogin = document.getElementById('formLogin');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const btnAccesoRapido = document.getElementById('btnAccesoRapido');
const mensaje = document.getElementById('mensaje');

// Credenciales de prueba para docentes
const emailPrueba = 'admin@techpoint.com';
const passwordPrueba = 'TechPoint2026!';

// Iniciar sesión
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    mensaje.textContent = 'Verificando credenciales...';

    try {
        const respuesta = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: inputEmail.value.trim(),
                password: inputPassword.value
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'No se pudo iniciar sesión';
            return;
        }

        // Guardar los datos del administrador
        sessionStorage.setItem('administrador', JSON.stringify(datos.usuario));

        mensaje.textContent = 'Inicio de sesión correcto. Redirigiendo...';

        // Ir al panel de administración
        window.location.href = '/admin/dashboard.html';

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mensaje.textContent = 'No se pudo conectar con el servidor';
    }
});

// Completar credenciales para docentes
btnAccesoRapido.addEventListener('click', () => {
    inputEmail.value = emailPrueba;
    inputPassword.value = passwordPrueba;

    mensaje.textContent = 'Credenciales de prueba completadas';
});