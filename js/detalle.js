// js/detalle.js

const API_URL = 'api/stock.json';

document.addEventListener('DOMContentLoaded', () => {
    const idProducto = obtenerIdDesdeURL();
    if (!idProducto) {
        mostrarMensajeError('No se ha especificado ningún producto para mostrar.');
        return;
    }

    fetch(API_URL)
        .then(respuesta => respuesta.json())
        .then(data => {
            const productos = data;
            const producto = productos.find(p => p.id === idProducto);

            if (!producto) {
                mostrarMensajeError('No se ha encontrado el producto seleccionado.');
                return;
            }

            pintarDetalle(producto);
            pintarGraficoStock(producto, productos);
        })
        .catch(error => {
            console.error('Error al cargar datos de detalle:', error);
            mostrarMensajeError('Se ha producido un error al cargar los datos.');
        });
});


function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const idStr = params.get('id');
    const id = parseInt(idStr);
    return isNaN(id) ? null : id;
}

function mostrarMensajeError(mensaje) {
    const seccionDetalle = document.getElementById('detalle-producto');
    if (seccionDetalle) {
        seccionDetalle.innerHTML = `<p class="sv-mensaje-error">${mensaje}</p>`;
    }
}

function pintarDetalle(producto) {
    const img = document.getElementById('detalle-imagen');
    const equipo = document.getElementById('detalle-equipo');
    const jugador = document.getElementById('detalle-jugador');
    const liga = document.getElementById('detalle-liga');
    const precio = document.getElementById('detalle-precio');
    const stock = document.getElementById('detalle-stock');
    const tallas = document.getElementById('detalle-tallas');
    const descripcion = document.getElementById('detalle-descripcion');

    if (img) img.src = producto.imagen;
    if (img) img.alt = producto.equipo;
    if (equipo) equipo.textContent = producto.equipo;
    if (jugador) jugador.textContent = producto.jugador;
    if (liga) liga.textContent = producto.liga;
    if (precio) precio.textContent = producto.precio;
    if (stock) stock.textContent = producto.stock;
    if (tallas) tallas.textContent = producto.tallas.join(', ');
    if (descripcion) descripcion.textContent = producto.descripcion;
}


function pintarGraficoStock(producto, productos) {
    const contenedor = document.getElementById('grafico-stock');
    if (!contenedor) return;

    // Limpiamos por si se vuelve a pintar
    contenedor.innerHTML = '';

    // Stock máximo del catálogo
    const maxStock = Math.max(...productos.map(p => p.stock));

    // Altura máxima de las barras (en píxeles)
    const ALTURA_MAX_BARRA = 160;

    // Alturas en píxeles, proporcionales al stock
    let alturaActualPx = 0;
    let alturaMaxPx = ALTURA_MAX_BARRA;

    if (maxStock > 0) {
        alturaActualPx = (producto.stock / maxStock) * ALTURA_MAX_BARRA;
    }

    // Altura mínima para que se vea algo aunque haya poco stock
    const ALTURA_MIN_BARRA = 8;
    alturaActualPx = Math.max(ALTURA_MIN_BARRA, alturaActualPx);
    alturaMaxPx = Math.max(ALTURA_MIN_BARRA, alturaMaxPx);

    // --- COLUMNA STOCK ACTUAL ---
    const columnaActual = document.createElement('div');
    columnaActual.classList.add('sv-columna-grafico');

    const barraActual = document.createElement('div');
    barraActual.classList.add('sv-barra-stock', 'sv-barra-actual');
    barraActual.style.height = `${alturaActualPx}px`;
    barraActual.title = `Este producto tiene ${producto.stock} unidades en stock.`;

    const etiquetaActual = document.createElement('span');
    etiquetaActual.textContent = `Stock actual: ${producto.stock} uds`;

    columnaActual.appendChild(barraActual);
    columnaActual.appendChild(etiquetaActual);

    // --- COLUMNA STOCK MÁXIMO CATÁLOGO ---
    const columnaMax = document.createElement('div');
    columnaMax.classList.add('sv-columna-grafico');

    const barraMax = document.createElement('div');
    barraMax.classList.add('sv-barra-stock', 'sv-barra-max');
    barraMax.style.height = `${alturaMaxPx}px`;
    barraMax.title = `El producto con más stock tiene ${maxStock} unidades.`;

    const etiquetaMax = document.createElement('span');
    etiquetaMax.textContent = `Stock máximo del catálogo: ${maxStock} uds`;

    columnaMax.appendChild(barraMax);
    columnaMax.appendChild(etiquetaMax);

    // Añadimos al contenedor
    contenedor.appendChild(columnaActual);
    contenedor.appendChild(columnaMax);
}
