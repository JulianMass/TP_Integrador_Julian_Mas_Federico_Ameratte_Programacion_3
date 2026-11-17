// Obtener elementos del HTML
const contenedorPerifericos = document.getElementById('contenedorPerifericos');
const contenedorAccesorios = document.getElementById('contenedorAccesorios');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroEstado = document.getElementById('filtroEstado');
const mensaje = document.getElementById('mensaje');

// Obtener elementos del formulario
const formularioProducto = document.getElementById('formularioProducto');
const formProducto = document.getElementById('formProducto');
const tituloFormulario = document.getElementById('tituloFormulario');

const inputNombre = document.getElementById('nombre');
const inputDescripcion = document.getElementById('descripcion');
const inputPrecio = document.getElementById('precio');
const inputStock = document.getElementById('stock');
const inputCategoria = document.getElementById('categoria');
const inputImagen = document.getElementById('imagen');

const btnNuevoProducto = document.getElementById('btnNuevoProducto');
const btnCancelarFormulario = document.getElementById('btnCancelarFormulario');

const mensajeFormulario = document.getElementById('mensajeFormulario');

// Guardar el ID del producto que estamos editando
let productoEditandoId = null;

// Almacenar los productos obtenidos de la API
let productos = [];

// Obtener productos desde el servidor
const obtenerProductos = async () => {
    try {
        mensaje.textContent = 'Cargando productos...';

        const respuesta = await fetch(
            '/api/productos?incluirInactivos=true&pagina=1&limite=50'
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No se pudieron obtener los productos');
        }

        productos = datos.productos;

        mostrarProductos();

        mensaje.textContent = `Se encontraron ${datos.totalProductos} productos.`;

    } catch (error) {
        console.error('Error al obtener productos:', error);
        mensaje.textContent = 'No se pudieron cargar los productos.';
    }
};

// Mostrar los productos en pantalla
const mostrarProductos = () => {
    // Limpiar los contenedores
    contenedorPerifericos.innerHTML = '';
    contenedorAccesorios.innerHTML = '';

    // Obtener los valores de los filtros
    const categoriaSeleccionada = filtroCategoria.value;
    const estadoSeleccionado = filtroEstado.value;

    // Recorrer los productos
    productos.forEach(producto => {

        // Aplicar filtro de categoría
        if (
            categoriaSeleccionada !== 'todos' &&
            producto.categoria !== categoriaSeleccionada
        ) {
            return;
        }

        // Aplicar filtro de estado
        if (estadoSeleccionado === 'activos' && !producto.activo) {
            return;
        }

        if (estadoSeleccionado === 'inactivos' && producto.activo) {
            return;
        }

        // Crear tarjeta del producto
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('tarjeta-producto');

        // Imagen del producto
        const imagen = document.createElement('img');
        imagen.src = producto.imagen || '../cliente/img/logo.png';
        imagen.alt = producto.nombre;

        // Nombre
        const nombre = document.createElement('h3');
        nombre.textContent = producto.nombre;

        // Descripción
        const descripcion = document.createElement('p');
        descripcion.textContent = producto.descripcion;

        // Precio
        const precio = document.createElement('p');
        precio.classList.add('precio');
        precio.textContent = `$${Number(producto.precio).toLocaleString('es-AR')}`;

        // Stock
        const stock = document.createElement('p');
        stock.textContent = `Stock: ${producto.stock}`;

        // Estado
        const estado = document.createElement('p');
        estado.textContent = producto.activo ? 'Estado: Activo' : 'Estado: Inactivo';

        // Crear contenedor de acciones
        const acciones = document.createElement('div');
        acciones.classList.add('acciones');

        // Botón para editar el producto
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn-editar');
        btnEditar.addEventListener('click', () => {
            editarProducto(producto.id);
        });

        // Botón para dar de baja o reactivar
        const btnEstado = document.createElement('button');

        if (producto.activo) {
            btnEstado.textContent = 'Dar de baja';
            btnEstado.classList.add('btn-eliminar');

            btnEstado.addEventListener('click', () => {
                cambiarEstadoProducto(producto.id, false);
            });

        } else {
            btnEstado.textContent = 'Reactivar';
            btnEstado.classList.add('btn-reactivar');

            btnEstado.addEventListener('click', () => {
                cambiarEstadoProducto(producto.id, true);
            });
        }

        // Agregar botones al contenedor
        acciones.append(btnEditar, btnEstado);

        // Agregar elementos a la tarjeta
        tarjeta.append(
            imagen,
            nombre,
            descripcion,
            precio,
            stock,
            estado,
            acciones
        );

        // Ubicar tarjeta según su categoría
        if (producto.categoria === 'perifericos') {
            contenedorPerifericos.appendChild(tarjeta);
        } else if (producto.categoria === 'accesorios') {
            contenedorAccesorios.appendChild(tarjeta);
        }
    });

    // Mostrar mensaje si no hay productos en alguna categoría
    if (contenedorPerifericos.children.length === 0 &&
        (categoriaSeleccionada === 'todos' || categoriaSeleccionada === 'perifericos')) {
        contenedorPerifericos.textContent = 'No hay productos para mostrar.';
    }

    if (contenedorAccesorios.children.length === 0 &&
        (categoriaSeleccionada === 'todos' || categoriaSeleccionada === 'accesorios')) {
        contenedorAccesorios.textContent = 'No hay productos para mostrar.';
    }
};

// Actualizar listado al cambiar los filtros
filtroCategoria.addEventListener('change', mostrarProductos);
filtroEstado.addEventListener('change', mostrarProductos);

// Cambiar el estado de un producto
const cambiarEstadoProducto = async (id, reactivar) => {
    const accion = reactivar ? 'reactivar' : 'dar de baja';

    const confirmar = confirm(
        `¿Estás seguro de que querés ${accion} este producto?`
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            reactivar
                ? `/api/productos/${id}/reactivar`
                : `/api/productos/${id}`,
            {
                method: reactivar ? 'PUT' : 'DELETE'
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No se pudo modificar el producto');
        }

        mensaje.textContent = datos.mensaje;

        // Volver a consultar los productos
        await obtenerProductos();

    } catch (error) {
        console.error('Error al cambiar el estado:', error);
        mensaje.textContent = error.message;
    }
};

// Mostrar el formulario para editar un producto
const editarProducto = (id) => {
    // Buscar el producto seleccionado
    const producto = productos.find(producto => producto.id === id);

    if (!producto) {
        mensaje.textContent = 'No se encontró el producto';
        return;
    }

    // Guardar el ID del producto
    productoEditandoId = id;

    // Completar los campos con sus datos actuales
    inputNombre.value = producto.nombre;
    inputDescripcion.value = producto.descripcion;
    inputPrecio.value = producto.precio;
    inputStock.value = producto.stock;
    inputCategoria.value = producto.categoria;

    // No es necesario seleccionar otra imagen
    inputImagen.value = '';

    // Cambiar el título del formulario
    tituloFormulario.textContent = 'Editar producto';

    // Mostrar el formulario
    formularioProducto.classList.remove('oculto');

    mensajeFormulario.textContent = '';

    formularioProducto.scrollIntoView({
        behavior: 'smooth'
    });
};

// Mostrar el formulario para agregar un producto
btnNuevoProducto.addEventListener('click', () => {

    // Indicar que estamos creando un producto nuevo
    productoEditandoId = null;

    // Limpiar los campos
    formProducto.reset();

    // Cambiar el título
    tituloFormulario.textContent = 'Agregar producto';

    // Limpiar mensajes
    mensajeFormulario.textContent = '';

    // Mostrar el formulario
    formularioProducto.classList.remove('oculto');

    formularioProducto.scrollIntoView({
        behavior: 'smooth'
    });
});

// Cancelar el formulario
btnCancelarFormulario.addEventListener('click', () => {

    // Ocultar el formulario
    formularioProducto.classList.add('oculto');

    // Limpiar los campos
    formProducto.reset();

    // Reiniciar el producto seleccionado
    productoEditandoId = null;

    // Limpiar mensajes
    mensajeFormulario.textContent = '';
});

// Guardar un producto nuevo o modificar uno existente
formProducto.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Crear FormData con los datos del formulario
    const datosFormulario = new FormData();

    datosFormulario.append('nombre', inputNombre.value.trim());
    datosFormulario.append('descripcion', inputDescripcion.value.trim());
    datosFormulario.append('precio', inputPrecio.value);
    datosFormulario.append('stock', inputStock.value);
    datosFormulario.append('categoria', inputCategoria.value);

    // Agregar imagen solamente si se seleccionó una
    if (inputImagen.files.length > 0) {
        datosFormulario.append('imagen', inputImagen.files[0]);
    }

    // Determinar si estamos creando o modificando
    const esEdicion = productoEditandoId !== null;

    const url = esEdicion
        ? `/api/productos/${productoEditandoId}`
        : '/api/productos';

    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        mensajeFormulario.textContent = 'Guardando producto...';

        const respuesta = await fetch(url, {
            method: metodo,
            body: datosFormulario
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            const errores = datos.errores
                ? datos.errores.join(', ')
                : datos.mensaje;

            throw new Error(errores || 'No se pudo guardar el producto');
        }

        mensajeFormulario.textContent = datos.mensaje;

        // Limpiar y ocultar el formulario
        formProducto.reset();
        formularioProducto.classList.add('oculto');
        productoEditandoId = null;

        // Actualizar el listado de productos
        await obtenerProductos();

    } catch (error) {
        console.error('Error al guardar el producto:', error);
        mensajeFormulario.textContent = error.message;
    }
});

// Cargar productos al entrar a la página
obtenerProductos();