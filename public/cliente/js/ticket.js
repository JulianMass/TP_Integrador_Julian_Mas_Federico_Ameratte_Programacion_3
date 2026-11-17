// Recuperar los datos de la última venta
const datosTicket = JSON.parse(sessionStorage.getItem('ultimaVenta'));

// Obtener elementos del HTML
const nombreTicket = document.getElementById('nombreTicket');
const fechaTicket = document.getElementById('fechaTicket');
const numeroVenta = document.getElementById('numeroVenta');
const productosTicket = document.getElementById('productosTicket');
const totalTicket = document.getElementById('totalTicket');

const btnSalir = document.getElementById('btnSalir');
const btnDescargarPDF = document.getElementById('btnDescargarPDF');

// Formatear precios
const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2
    }).format(precio);
};

// Comprobar que existan datos de una compra
if (!datosTicket || !datosTicket.venta) {

    document.querySelector('.ticket').innerHTML = `
        <h2>No hay ningún ticket disponible</h2>
        <p>Primero necesitás realizar una compra.</p>
        <button id="btnVolverCatalogo">Volver al catálogo</button>
    `;

    document.getElementById('btnVolverCatalogo').addEventListener('click', () => {
        window.location.href = 'catalogo.html';
    });

} else {

    const venta = datosTicket.venta;
    const productos = datosTicket.productos;

    // Mostrar datos generales
    nombreTicket.textContent = venta.nombreCliente;
    numeroVenta.textContent = venta.id;

    const fecha = venta.fecha || venta.createdAt;

    fechaTicket.textContent = fecha
        ? new Date(fecha).toLocaleString('es-AR')
        : new Date().toLocaleString('es-AR');

    // Mostrar productos comprados
    productosTicket.innerHTML = '';

    productos.forEach(producto => {

        const tarjeta = document.createElement('div');
        tarjeta.classList.add('producto-ticket');

        const informacion = document.createElement('div');

        const nombre = document.createElement('p');
        nombre.textContent = producto.nombre;

        const cantidad = document.createElement('p');
        cantidad.textContent = `Cantidad: ${producto.cantidad}`;

        const precioUnitario = document.createElement('p');
        precioUnitario.textContent =
            `Precio unitario: ${formatearPrecio(producto.precio)}`;

        informacion.append(nombre, cantidad, precioUnitario);

        const subtotal = document.createElement('p');
        subtotal.textContent = formatearPrecio(
            Number(producto.precio) * producto.cantidad
        );

        tarjeta.append(informacion, subtotal);

        productosTicket.appendChild(tarjeta);
    });

    // Mostrar total de la venta
    totalTicket.textContent = formatearPrecio(venta.total);
}

// Finalizar el autoservicio
btnSalir.addEventListener('click', () => {

    // Eliminar los datos del cliente y la compra
    sessionStorage.removeItem('nombreCliente');
    sessionStorage.removeItem('carrito');
    sessionStorage.removeItem('ultimaVenta');

    // Volver a la pantalla inicial
    window.location.href = 'index.html';
});

// Descargar el ticket en PDF
btnDescargarPDF.addEventListener('click', async () => {

    if (!datosTicket || !datosTicket.venta) {
        alert('No hay ningún ticket disponible para descargar.');
        return;
    }

    try {
        btnDescargarPDF.disabled = true;
        btnDescargarPDF.textContent = 'Generando PDF...';

        const idVenta = datosTicket.venta.id;

        // Solicitar el PDF al backend
        const respuesta = await fetch(`/api/ventas/${idVenta}/pdf`);

        if (!respuesta.ok) {
            throw new Error('No se pudo generar el ticket PDF.');
        }

        // Convertir la respuesta en un archivo
        const archivoPDF = await respuesta.blob();

        // Crear un enlace temporal para descargarlo
        const url = window.URL.createObjectURL(archivoPDF);

        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `ticket-${idVenta}.pdf`;

        document.body.appendChild(enlace);
        enlace.click();

        // Limpiar el enlace temporal
        enlace.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al descargar el PDF:', error);
        alert(error.message);

    } finally {
        btnDescargarPDF.disabled = false;
        btnDescargarPDF.textContent = 'Descargar ticket PDF';
    }
});