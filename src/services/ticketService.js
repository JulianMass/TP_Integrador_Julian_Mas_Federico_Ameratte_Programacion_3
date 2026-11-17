const puppeteer = require('puppeteer');

// Generar PDF del ticket de compra
const generarTicketPDF = async (venta) => {

    // Escapar caracteres especiales para evitar interpretar HTML
    const escaparHTML = (texto) => {
        return String(texto).replace(/[&<>"']/g, caracter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[caracter]);
    };

    const navegador = await puppeteer.launch({
        headless: true
    });

    try {
        const pagina = await navegador.newPage();

        // Formatear precios
        const formatearPrecio = (precio) => {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS'
            }).format(precio);
        };

        // Obtener productos de la venta
        const productos = venta.Productos;

        // Generar filas de productos
        const filasProductos = productos.map(producto => {

            const cantidad = producto.DetalleVenta.cantidad;
            const precio = Number(producto.DetalleVenta.precioUnitario);
            const subtotal = cantidad * precio;

            return `
                <tr>
                    <td>${escaparHTML(producto.nombre)}</td>
                    <td>${cantidad}</td>
                    <td>${formatearPrecio(precio)}</td>
                    <td>${formatearPrecio(subtotal)}</td>
                </tr>
            `;

        }).join('');

        // Crear contenido HTML del ticket
        const contenidoHTML = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        color: #222;
                    }

                    .ticket {
                        max-width: 600px;
                        margin: auto;
                    }

                    h1, h2 {
                        text-align: center;
                    }

                    .empresa {
                        text-align: center;
                        margin-bottom: 30px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    th, td {
                        border-bottom: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                    }

                    .total {
                        text-align: right;
                        margin-top: 25px;
                        font-size: 20px;
                        font-weight: bold;
                    }

                    .final {
                        text-align: center;
                        margin-top: 40px;
                        font-size: 12px;
                    }
                </style>
            </head>

            <body>

                <div class="ticket">

                    <div class="empresa">
                        <h1>TechPoint</h1>
                        <p>Tecnología y accesorios</p>
                        <p>Comprobante de compra</p>
                    </div>

                    <h2>Ticket de compra</h2>

                    <p><strong>Cliente:</strong> ${escaparHTML(venta.nombreCliente)}</p>
                    <p><strong>Número de venta:</strong> ${venta.id}</p>
                    <p><strong>Fecha:</strong> ${new Date(venta.fecha || venta.createdAt).toLocaleString('es-AR')}</p>

                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${filasProductos}
                        </tbody>
                    </table>

                    <div class="total">
                        Total: ${formatearPrecio(venta.total)}
                    </div>

                    <div class="final">
                        <p>¡Gracias por elegir TechPoint!</p>
                    </div>

                </div>

            </body>
            </html>
        `;

        // Cargar el HTML en Puppeteer
        await pagina.setContent(contenidoHTML, {
            waitUntil: 'networkidle0'
        });

        // Generar PDF
        const pdf = await pagina.pdf({
            format: 'A4',
            printBackground: true
        });

        return pdf;

    } finally {
        await navegador.close();
    }
};

module.exports = {
    generarTicketPDF
};