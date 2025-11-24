// js/extra.js

const API_URL = 'api/stock.json';
const LS_FAVORITOS_KEY = 'stockvision_favoritos';

document.addEventListener('DOMContentLoaded', () => {
    cargarFavoritos();
});

function cargarFavoritos() {
    const favoritosIds = obtenerFavoritos();
    const contenedor = document.getElementById('favoritos-contenedor');
    const mensajeSin = document.getElementById('mensaje-sin-favoritos');

    if (!favoritosIds || favoritosIds.length === 0) {
        if (mensajeSin) mensajeSin.style.display = 'block';
        return;
    }

    fetch(API_URL)
        .then(respuesta => respuesta.json())
        .then(productos => {
            const favoritos = productos.filter(p => favoritosIds.includes(p.id));

            if (favoritos.length === 0) {
                if (mensajeSin) mensajeSin.style.display = 'block';
                return;
            }

            if (mensajeSin) mensajeSin.style.display = 'none';
            pintarFavoritos(favoritos, contenedor);
        })
        .catch(error => {
            console.error('Error al cargar favoritos:', error);
            if (mensajeSin) {
                mensajeSin.textContent = 'Error al cargar los favoritos.';
                mensajeSin.style.display = 'block';
            }
        });
}

function pintarFavoritos(lista, contenedor) {
    if (!contenedor) return;

    contenedor.innerHTML = '';

    lista.forEach(producto => {
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('sv-producto-card');

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
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });

    // botón ver detalle
    const botonesDetalle = contenedor.querySelectorAll('.sv-btn-detalle');
    botonesDetalle.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id) {
                window.location.href = `detalle.html?id=${id}`;
            }
        });
    });
}

// Reutilizamos las funciones de favoritos
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
