
// Variables para almacenar los datos
let productos = [];
let carrito = [];
let usuario = null;
let categoriaActual = "todo";
let busqueda = "";
let ordenActual = "original";


// Recuperar la cesta guardada en el navegador
try {
    const carritoGuardado = localStorage.getItem("carrito");

    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }

    if (!Array.isArray(carrito)) {
        carrito = [];
    }

} catch (error) {
    carrito = [];
}


// Cargar los productos desde el archivo JSON
fetch("products.json")
    .then(response => response.json())
    .then(datos => {

        productos = datos;

        // Mostrar todos los productos
        mostrarProductos("todo");

        // Actualizar el contador
        actualizarContador();

    })
    .catch(error => {
        console.error("Error al cargar los productos:", error);
    });


// Cargar los datos del usuario
fetch("userdata.json")
    .then(response => response.json())
    .then(datos => {

        usuario = datos;

    })
    .catch(error => {
        console.error("Error al cargar los datos del usuario:", error);
    });


// Función para mostrar los productos
function mostrarProductos(categoria = categoriaActual) {

    const catalogo = document.getElementById("catalogo");

    // Guardar la categoría seleccionada
    categoriaActual = categoria;

    // Vaciar el catálogo
    catalogo.innerHTML = "";

    // Filtrar productos por categoría, stock y búsqueda
    const productosFiltrados = productos.filter(producto => {

        const coincideCategoria =
            categoriaActual === "todo" ||
            producto.category === categoriaActual;

        const coincideBusqueda =
            producto.name.toLowerCase().includes(busqueda) ||
            producto.description.toLowerCase().includes(busqueda);

        return producto.stock > 0 &&
            coincideCategoria &&
            coincideBusqueda;

    });


    // Ordenar los productos
    if (ordenActual === "precio-asc") {

        productosFiltrados.sort((a, b) => a.price - b.price);

    } else if (ordenActual === "precio-desc") {

        productosFiltrados.sort((a, b) => b.price - a.price);

    } else if (ordenActual === "nombre") {

        productosFiltrados.sort((a, b) =>
            a.name.localeCompare(b.name, "es")
        );

    }


    // Crear una tarjeta para cada producto
    productosFiltrados.forEach(producto => {

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("producto");

        tarjeta.innerHTML = `
            <img src="${producto.image}" alt="${producto.name}">
            <h3>${producto.name}</h3>
            <p>${producto.description}</p>
            <p>Precio: ${producto.price.toLocaleString("es-ES")} ptas.</p>
            <p>Stock: ${producto.stock}</p>
            <button class="btn-anadir">Añadir a la cesta</button>
        `;

        // Seleccionar el botón de añadir
        const botonAnadir = tarjeta.querySelector(".btn-anadir");

        // Añadir producto al carrito
        botonAnadir.addEventListener("click", () => {

            const cantidadActual = carrito.filter(id =>
                String(id) === String(producto.id)
            ).length;

            // Comprobar que no se supere el stock
            if (cantidadActual < producto.stock) {

                carrito.push(producto.id);

                actualizarContador();

            }

        });

        catalogo.appendChild(tarjeta);

    });


    // Mostrar mensaje si no hay resultados
    if (productosFiltrados.length === 0) {

        catalogo.innerHTML = "<p>No se encontraron productos.</p>";

    }

}


// Función para actualizar el contador y guardar la cesta
function actualizarContador() {

    const botonCarrito = document.getElementById("btn-carrito");

    botonCarrito.textContent = `Ver Cesta (${carrito.length})`;

    // Guardar la cesta en LocalStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

}


// Función para mostrar el contenido del carrito
function mostrarCarrito() {

    const listaCarrito = document.getElementById("lista-carrito");
    const datosUsuario = document.getElementById("datos-usuario");

    // Mostrar los datos del usuario
    if (usuario) {

        datosUsuario.textContent =
            `Enviando pedido a: ${usuario.name}, ${usuario.address}`;

    } else {

        datosUsuario.textContent = "Cargando datos del cliente...";

    }

    // Vaciar la lista antes de actualizarla
    listaCarrito.innerHTML = "";

    // Comprobar si el carrito está vacío
    if (carrito.length === 0) {

        listaCarrito.innerHTML = "<p>La cesta está vacía.</p>";

        actualizarTotal();

        return;

    }

    // Recorrer los productos
    productos.forEach(producto => {

        // Calcular cuántas unidades hay de este producto
        const cantidad = carrito.filter(id =>
            String(id) === String(producto.id)
        ).length;

        // Mostrar solamente los productos añadidos
        if (cantidad > 0) {

            const elemento = document.createElement("div");
            elemento.classList.add("producto-carrito");

            elemento.innerHTML = `
                <h3>${producto.name}</h3>
                <p>Precio: ${producto.price.toLocaleString("es-ES")} ptas.</p>

                <p>
                    Cantidad: ${cantidad}
                    <button class="btn-restar" data-id="${producto.id}">-</button>
                    <button class="btn-sumar" data-id="${producto.id}"
                        ${cantidad >= producto.stock ? "disabled" : ""}>+</button>
                </p>

                <p>Subtotal: ${(producto.price * cantidad).toLocaleString("es-ES")} ptas.</p>

                <button class="btn-eliminar" data-id="${producto.id}">
                    Eliminar
                </button>
            `;

            listaCarrito.appendChild(elemento);

        }

    });

    actualizarTotal();

}


// Función para calcular el precio total
function actualizarTotal() {

    let total = 0;

    // Sumar el precio de todos los productos
    productos.forEach(producto => {

        const cantidad = carrito.filter(id =>
            String(id) === String(producto.id)
        ).length;

        total += producto.price * cantidad;

    });

    document.getElementById("total-carrito").textContent =
        `Total: ${total.toLocaleString("es-ES")} ptas.`;

}


// Gestionar los botones de la cesta
document.getElementById("lista-carrito").addEventListener("click", evento => {

    const boton = evento.target;
    const id = boton.dataset.id;

    if (!id) return;

    // Aumentar cantidad
    if (boton.classList.contains("btn-sumar")) {

        const producto = productos.find(p =>
            String(p.id) === id
        );

        const cantidad = carrito.filter(productoId =>
            String(productoId) === id
        ).length;

        if (producto && cantidad < producto.stock) {

            carrito.push(producto.id);

        }

    }

    // Reducir cantidad
    if (boton.classList.contains("btn-restar")) {

        const posicion = carrito.findIndex(productoId =>
            String(productoId) === id
        );

        if (posicion !== -1) {

            carrito.splice(posicion, 1);

        }

    }

    // Eliminar producto completamente
    if (boton.classList.contains("btn-eliminar")) {

        carrito = carrito.filter(productoId =>
            String(productoId) !== id
        );

    }

    // Actualizar cesta y contador
    actualizarContador();
    mostrarCarrito();

});


// Seleccionar los botones de categorías
const botonesFiltro = document.querySelectorAll(".filtro");

// Añadir eventos a los botones
botonesFiltro.forEach(boton => {

    boton.addEventListener("click", () => {

        const categoria = boton.dataset.categoria;

        mostrarProductos(categoria);

    });

});


// Gestionar el buscador
const buscador = document.getElementById("buscador");

buscador.addEventListener("input", () => {

    busqueda = buscador.value.toLowerCase().trim();

    mostrarProductos();

});


// Gestionar el selector de orden
const selectorOrden = document.getElementById("ordenar");

selectorOrden.addEventListener("change", () => {

    ordenActual = selectorOrden.value;

    mostrarProductos();

});


// Elementos de la ventana emergente
const modal = document.getElementById("modal-carrito");
const botonCarrito = document.getElementById("btn-carrito");
const cerrarModal = document.getElementById("cerrar-modal");


// Abrir la cesta
botonCarrito.addEventListener("click", () => {

    mostrarCarrito();

    modal.style.display = "flex";

});


// Cerrar la cesta
cerrarModal.addEventListener("click", () => {

    modal.style.display = "none";

});


// Finalizar compra
document.getElementById("finalizar-compra").addEventListener("click", () => {

    // Vaciar el carrito
    carrito = [];

    // Actualizar el contador y guardar la cesta vacía
    actualizarContador();

    // Cerrar la ventana
    modal.style.display = "none";

});


// Actualizar el contador al cargar la página
actualizarContador();

