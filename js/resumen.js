// js/resumen.js

const API_URL = 'api/stock.json';
const LS_FAVORITOS_KEY = 'stockvision_favoritos';

let productos = [];
let productosFiltrados = [];

// Al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    configurarEventosFiltros();
});

// ----------------------
// Carga de datos
// ----------------------
function cargarDatos() {
    fetch(API_URL)
        .then(respuesta => respuesta.json())
        .then(data => {
            productos = data;
            productosFiltrados = [...productos];
            pintarKPIs();
            pintarProductos(productosFiltrados);
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            const contenedor = document.getElementById('productos-contenedor');
            if (contenedor) {
                contenedor.innerHTML = '<p>Error al cargar los datos de stock.</p>';
            }
        });
}

// ----------------------
// KPIs
// ----------------------
function pintarKPIs() {
    const kpiSection = document.getElementById('kpi-section');
    if (!kpiSection) return;

    const total = productos.length;
    const totalLaLiga = productos.filter(p => p.liga === 'LaLiga').length;
    const totalPremier = productos.filter(p => p.liga === 'Premier League').length;
    const totalSerieA = productos.filter(p => p.liga === 'Serie A').length;

    kpiSection.innerHTML = `
        <div class="sv-kpi-card">
            <h3>Total productos</h3>
            <p>${total}</p>
        </div>
        <div class="sv-kpi-card">
            <h3>Camisetas LaLiga</h3>
            <p>${totalLaLiga}</p>
        </div>
        <div class="sv-kpi-card">
            <h3>Premier League</h3>
            <p>${totalPremier}</p>
        </div>
        <div class="sv-kpi-card">
            <h3>Serie A</h3>
            <p>${totalSerieA}</p>
        </div>
    `;
}

// ----------------------
// Pintar productos
// ----------------------
function pintarProductos(lista) {
    const contenedor = document.getElementById('productos-contenedor');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    const favoritos = obtenerFavoritos();

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = '<p>No se han encontrado productos con los filtros seleccionados.</p>';
        return;
    }

    lista.forEach(producto => {
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('sv-producto-card');

        const esFavorito = favoritos.includes(producto.id);

        tarjeta.innerHTML = `
            <div class="sv-producto-imagen">
                <img src="${producto.imagen}" alt="${producto.equipo}">
            </div>
            <div class="sv-producto-contenido">
                <h3>${producto.equipo}</h3>
                <p><strong>Jugador:</strong> ${producto.jugador}</p>
                <p><strong>Liga:</strong> ${producto.liga}</p>
                <p><strong>Precio:</strong> ${producto.precio} €</p>
                <p><strong>Stock:</strong> ${producto.stock} uds</p>
                <p><strong>Popularidad:</strong> ${producto.popularidad}</p>
            </div>
            <div class="sv-producto-acciones">
                <button class="sv-btn-detalle" data-id="${producto.id}">
                    Ver detalle
                </button>
                <button class="sv-btn-favorito ${esFavorito ? 'activo' : ''}" data-id="${producto.id}" title="Marcar como favorito">
                    ★
                </button>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });

    // Añadir eventos a los botones de detalle y favoritos
    configurarEventosTarjetas();
}

// ----------------------
// Filtros
// ----------------------
function configurarEventosFiltros() {
    const filtroLiga = document.getElementById('filtro-liga');
    const ordenPrecio = document.getElementById('orden-precio');

    if (filtroLiga) {
        filtroLiga.addEventListener('change', aplicarFiltros);
    }

    if (ordenPrecio) {
        ordenPrecio.addEventListener('change', aplicarFiltros);
    }
}

function aplicarFiltros() {
    const filtroLiga = document.getElementById('filtro-liga');
    const ordenPrecio = document.getElementById('orden-precio');

    let lista = [...productos];

    // Filtro por liga
    if (filtroLiga && filtroLiga.value !== 'todas') {
        lista = lista.filter(p => p.liga === filtroLiga.value);
    }

    // Orden por precio
    if (ordenPrecio && ordenPrecio.value === 'asc') {
        lista.sort((a, b) => a.precio - b.precio);
    } else if (ordenPrecio && ordenPrecio.value === 'desc') {
        lista.sort((a, b) => b.precio - a.precio);
    }

    productosFiltrados = lista;
    pintarProductos(productosFiltrados);
}

// ----------------------
// Eventos en tarjetas (detalle + favoritos)
// ----------------------
function configurarEventosTarjetas() {
    const botonesDetalle = document.querySelectorAll('.sv-btn-detalle');
    const botonesFavorito = document.querySelectorAll('.sv-btn-favorito');

    botonesDetalle.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id) {
                // Ir a la página de detalle con el id por query string
                window.location.href = `detalle.html?id=${id}`;
            }
        });
    });

    botonesFavorito.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.stopPropagation(); // por si acaso
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            if (!isNaN(id)) {
                toggleFavorito(id);
                // Volvemos a pintar productos para actualizar el estado visual
                pintarProductos(productosFiltrados);
            }
        });
    });
}

// ----------------------
// Gestión de favoritos con localStorage
// ----------------------
function obtenerFavoritos() {
    const datos = localStorage.getItem(LS_FAVORITOS_KEY);
    if (!datos) return [];
    try {
        return JSON.parse(datos);
    } catch (e) {
        console.error('Error al parsear favoritos de localStorage:', e);
        return [];
    }
}

function guardarFavoritos(listaIds) {
    localStorage.setItem(LS_FAVORITOS_KEY, JSON.stringify(listaIds));
}

function toggleFavorito(id) {
    const favoritos = obtenerFavoritos();
    const indice = favoritos.indexOf(id);

    if (indice === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(indice, 1);
    }

    guardarFavoritos(favoritos);
}
