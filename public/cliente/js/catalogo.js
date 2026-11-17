// Obtener el nombre del cliente
const nombreCliente = sessionStorage.getItem('nombreCliente');

// Si no ingresó su nombre, volver al inicio
if (!nombreCliente) {
    window.location.href = 'index.html';
}

// Mostrar el nombre en la bienvenida
document.getElementById('nombreCliente').textContent = nombreCliente;

// Elementos del catálogo
const contenedorProductos = document.getElementById('contenedorProductos');
const botonesCategorias = document.querySelectorAll('.btn-categoria');
const btnAnterior = document.getElementById('btnAnterior');
const btnSiguiente = document.getElementById('btnSiguiente');
const textoPagina = document.getElementById('paginaActual');

// Variables del catálogo
let productos = [];
let categoriaActual = 'todos';
let paginaActual = 1;
const productosPorPagina = 8;

// Obtener productos desde el backend
const cargarProductos = async () => {
    try {
        const respuesta = await fetch('/api/productos?pagina=1&limite=50');

        if (!respuesta.ok) {
            throw new Error('No se pudieron obtener los productos.');
        }

        const datos = await respuesta.json();

        productos = datos.productos;

        mostrarProductos();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        contenedorProductos.innerHTML =
            '<p>No se pudieron cargar los productos. Intentá nuevamente más tarde.</p>';
    }
};

// Obtener productos según la categoría seleccionada
const obtenerProductosFiltrados = () => {
    if (categoriaActual === 'todos') {
        return productos;
    }

    return productos.filter(producto =>
        producto.categoria === categoriaActual
    );
};

// Mostrar los productos en pantalla
const mostrarProductos = () => {
    const productosFiltrados = obtenerProductosFiltrados();

    // Calcular los productos correspondientes a la página actual
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;

    const productosPagina = productosFiltrados.slice(inicio, fin);

    contenedorProductos.innerHTML = '';

    if (productosFiltrados.length === 0) {
        contenedorProductos.innerHTML =
            '<p>No hay productos disponibles en esta categoría.</p>';
    }

    productosPagina.forEach(producto => {

        // Crear tarjeta del producto
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('producto');

        // Imagen
        const imagen = document.createElement('img');
        imagen.src = producto.imagen || '';
        imagen.alt = producto.nombre;

        if (!producto.imagen) {
            imagen.alt = 'Imagen no disponible';
            imagen.style.display = 'none';
        }

        // Nombre
        const nombre = document.createElement('h3');
        nombre.textContent = producto.nombre;

        // Descripción
        const descripcion = document.createElement('p');
        descripcion.textContent = producto.descripcion;

        // Precio
        const precio = document.createElement('p');
        precio.classList.add('precio');
        precio.textContent = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2
        }).format(producto.precio);

        // Stock
        const stock = document.createElement('p');
        stock.textContent = `Stock disponible: ${producto.stock}`;

        // Botón para agregar al carrito
        const botonAgregar = document.createElement('button');
        botonAgregar.textContent = 'Agregar al carrito';

        if (producto.stock <= 0) {
            botonAgregar.textContent = 'Sin stock';
            botonAgregar.disabled = true;
        } else {
            botonAgregar.addEventListener('click', () => {
                agregarAlCarrito(producto);
            });
        }

        // Agregar elementos a la tarjeta
        tarjeta.append(
            imagen,
            nombre,
            descripcion,
            precio,
            stock,
            botonAgregar
        );

        contenedorProductos.appendChild(tarjeta);
    });

    // Actualizar paginación
    actualizarPaginacion(productosFiltrados.length);
};

// Actualizar botones de paginación
const actualizarPaginacion = (totalProductos) => {
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

    textoPagina.textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;

    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual >= totalPaginas;
};

// Cambiar de página
btnAnterior.addEventListener('click', () => {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarProductos();
    }
});

btnSiguiente.addEventListener('click', () => {
    const totalPaginas = Math.ceil(
        obtenerProductosFiltrados().length / productosPorPagina
    );

    if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarProductos();
    }
});

// Filtrar por categoría
botonesCategorias.forEach(boton => {
    boton.addEventListener('click', () => {

        categoriaActual = boton.dataset.categoria;
        paginaActual = 1;

        // Actualizar botón seleccionado
        botonesCategorias.forEach(btn =>
            btn.classList.remove('activo')
        );

        boton.classList.add('activo');

        mostrarProductos();
    });
});

// Agregar productos al carrito
const agregarAlCarrito = (producto) => {

    // Recuperar el carrito guardado
    let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];

    // Comprobar si el producto ya está agregado
    const productoExistente = carrito.find(item =>
        item.id === producto.id
    );

    if (productoExistente) {
        if (productoExistente.cantidad >= producto.stock) {
            alert('No hay más unidades disponibles de este producto.');
            return;
        }

        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen: producto.imagen,
            stock: producto.stock,
            cantidad: 1
        });
    }

    // Guardar el carrito actualizado
    sessionStorage.setItem('carrito', JSON.stringify(carrito));

    alert(`${producto.nombre} se agregó al carrito.`);
};

// Iniciar el catálogo
cargarProductos();