// Recuperar los productos guardados en el carrito
let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];

// Obtener elementos del HTML
const contenedorCarrito = document.getElementById('contenedorCarrito');
const totalCarrito = document.getElementById('totalCarrito');
const btnConfirmarCompra = document.getElementById('btnConfirmarCompra');
const btnSeguirComprando = document.getElementById('btnSeguirComprando');

// Formatear precios en pesos argentinos
const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2
    }).format(precio);
};

// Guardar los cambios del carrito
const guardarCarrito = () => {
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
};

// Mostrar los productos del carrito
const mostrarCarrito = () => {

    contenedorCarrito.innerHTML = '';

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = '<p>Tu carrito está vacío. ¡Agregá algunos productos!</p>';
        totalCarrito.textContent = formatearPrecio(0);
        btnConfirmarCompra.disabled = true;
        return;
    }

    btnConfirmarCompra.disabled = false;

    carrito.forEach(producto => {

        // Crear tarjeta
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('item-carrito');

        // Imagen
        const imagen = document.createElement('img');

        if (producto.imagen) {
            imagen.src = producto.imagen;
            imagen.alt = producto.nombre;
        } else {
            imagen.style.display = 'none';
        }

        // Información del producto
        const informacion = document.createElement('div');
        informacion.classList.add('info-producto');

        const nombre = document.createElement('h3');
        nombre.textContent = producto.nombre;

        const precio = document.createElement('p');
        precio.textContent = `Precio: ${formatearPrecio(Number(producto.precio))}`;

        const subtotal = document.createElement('p');
        subtotal.textContent = `Subtotal: ${formatearPrecio(Number(producto.precio) * producto.cantidad)}`;

        // Controles de cantidad
        const controles = document.createElement('div');
        controles.classList.add('cantidad');

        const btnRestar = document.createElement('button');
        btnRestar.textContent = '-';
        btnRestar.type = 'button';
        btnRestar.addEventListener('click', () => {
            modificarCantidad(producto.id, -1);
        });

        const cantidad = document.createElement('span');
        cantidad.textContent = producto.cantidad;

        const btnSumar = document.createElement('button');
        btnSumar.textContent = '+';
        btnSumar.type = 'button';
        btnSumar.addEventListener('click', () => {
            modificarCantidad(producto.id, 1);
        });

        controles.append(btnRestar, cantidad, btnSumar);

        // Botón para eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.type = 'button';
        btnEliminar.classList.add('btn-eliminar');

        btnEliminar.addEventListener('click', () => {
            eliminarProducto(producto.id);
        });

        // Armar tarjeta
        informacion.append(nombre, precio, subtotal, controles);
        tarjeta.append(imagen, informacion, btnEliminar);

        contenedorCarrito.appendChild(tarjeta);
    });

    calcularTotal();
};

// Modificar la cantidad de un producto
const modificarCantidad = (id, cambio) => {
    const producto = carrito.find(item => item.id === id);

    if (!producto) {
        return;
    }

    // Verificar que no se supere el stock disponible
    if (cambio > 0 && producto.cantidad >= producto.stock) {
        alert('No hay más unidades disponibles de este producto.');
        return;
    }

    producto.cantidad += cambio;

    // Si la cantidad llega a cero, eliminar el producto
    if (producto.cantidad <= 0) {
        eliminarProducto(id);
        return;
    }

    guardarCarrito();
    mostrarCarrito();
};

// Eliminar un producto del carrito
const eliminarProducto = (id) => {

    carrito = carrito.filter(producto => producto.id !== id);

    guardarCarrito();
    mostrarCarrito();
};

// Calcular el total de la compra
const calcularTotal = () => {

    const total = carrito.reduce((acumulador, producto) => {
        return acumulador + Number(producto.precio) * producto.cantidad;
    }, 0);

    totalCarrito.textContent = formatearPrecio(total);
};

// Volver al catálogo
btnSeguirComprando.addEventListener('click', () => {
    window.location.href = 'catalogo.html';
});

// Obtener elementos del modal
const modalConfirmacion = document.getElementById('modalConfirmacion');
const btnAceptarCompra = document.getElementById('btnAceptarCompra');
const btnCancelarCompra = document.getElementById('btnCancelarCompra');

// Abrir la ventana de confirmación
btnConfirmarCompra.addEventListener('click', () => {

    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    modalConfirmacion.style.display = 'flex';
});

// Cerrar la ventana de confirmación
btnCancelarCompra.addEventListener('click', () => {
    modalConfirmacion.style.display = 'none';
});

// Confirmar y registrar la compra
btnAceptarCompra.addEventListener('click', async () => {

    const nombreCliente = sessionStorage.getItem('nombreCliente');

    if (!nombreCliente) {
        alert('No se encontró el nombre del cliente.');
        return;
    }

    try {
        btnAceptarCompra.disabled = true;
        btnAceptarCompra.textContent = 'Procesando...';

        // Preparar los datos para enviar al backend
        const datosVenta = {
            nombreCliente: nombreCliente,
            productos: carrito.map(producto => ({
                id: producto.id,
                cantidad: producto.cantidad
            }))
        };

        // Enviar la venta a la API
        const respuesta = await fetch('/api/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosVenta)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || datos.mensaje);
        }

        // Guardar los datos de la venta y sus productos para el ticket
        const datosTicket = {
            venta: datos.venta,
            productos: carrito.map(producto => ({
                ...producto
            }))
        };

        sessionStorage.setItem(
            'ultimaVenta',
            JSON.stringify(datosTicket)
        );

        // Vaciar el carrito después de la compra exitosa
        carrito = [];
        guardarCarrito();

        // Ir a la pantalla del ticket
        window.location.href = 'ticket.html';

    } catch (error) {
        console.error('Error al registrar la venta:', error);

        alert(error.message || 'No se pudo registrar la compra.');

        btnAceptarCompra.disabled = false;
        btnAceptarCompra.textContent = 'Sí, confirmar';
    }
});

// Mostrar el carrito al ingresar
mostrarCarrito();