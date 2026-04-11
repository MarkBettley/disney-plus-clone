// js/main.js
const API_BASE = 'https://api.tvmaze.com';

// Función genérica para obtener datos
async function fetchData(url, containerId, type = 'show') {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="error">No se encontraron resultados</p>';
            return;
        }

        // Renderizar según el tipo
        if (type === 'show' || type === 'series') {
            renderShows(data.slice(0, 12), container);
        } else if (type === 'movies') {
            renderMovies(data.slice(0, 12), container);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        container.innerHTML = '<p class="error">Error al cargar los datos. Intenta de nuevo más tarde.</p>';
    }
}

// Renderizar shows (series/programas)
function renderShows(shows, container) {
    if (!shows || shows.length === 0) {
        container.innerHTML = '<p class="error">No hay shows disponibles</p>';
        return;
    }

    let html = '';
    shows.forEach(show => {
        const imageUrl = show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
        const name = show.name || 'Sin título';
        const rating = show.rating?.average || 'N/A';
        const genres = show.genres?.slice(0, 3).join(', ') || 'Sin género';
        const url = show.url || '#';

        html += `
            <div class="show-card">
                <div class="show-card__image">
                    <img src="${imageUrl}" alt="${name}">
                </div>
                <div class="show-card__info">
                    <h3 class="show-card__title">${name}</h3>
                    <p class="show-card__rating"><i class="fas fa-star"></i> ${rating}</p>
                    <p class="show-card__genres">${genres}</p>
                    <a href="${url}" target="_blank" class="btn btn--secondary btn--block">Ver más</a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Renderizar películas (usando el endpoint de schedule con tipo movie)
async function renderMovies(movies, container) {
    if (!movies || movies.length === 0) {
        container.innerHTML = '<p class="error">No hay películas disponibles</p>';
        return;
    }

    let html = '';
    for (const item of movies) {
        // Para obtener detalles completos de la película/show
        let show = item.show || item;
        const imageUrl = show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
        const name = show.name || 'Sin título';
        const rating = show.rating?.average || 'N/A';
        const genres = show.genres?.slice(0, 3).join(', ') || 'Sin género';
        const url = show.url || '#';

        html += `
            <div class="movie-card">
                <div class="movie-card__image">
                    <img src="${imageUrl}" alt="${name}">
                </div>
                <div class="movie-card__info">
                    <h3 class="movie-card__title">${name}</h3>
                    <p class="movie-card__rating"><i class="fas fa-star"></i> ${rating}</p>
                    <p class="movie-card__genres">${genres}</p>
                    <a href="${url}" target="_blank" class="btn btn--secondary btn--block">Ver más</a>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Cargar programas destacados (endpoint /shows)
async function loadShows() {
    await fetchData(`${API_BASE}/shows`, 'shows-container', 'show');
}

// Cargar películas (usando /schedule?country=US&type=movie)
async function loadMovies() {
    // TVMaze no tiene endpoint específico de películas, usamos schedule y filtramos
    try {
        const response = await axios.get(`${API_BASE}/schedule?country=US`);
        const allShows = response.data;
        // Filtramos shows que son películas (algunos tienen type "Movie")
        const movies = allShows.filter(item => item.show?.type === 'Movie').slice(0, 12);
        const container = document.getElementById('movies-container');
        if (container) {
            if (movies.length === 0) {
                // Si no hay películas, mostramos algunos shows como alternativa
                renderShows(allShows.slice(0, 12), container);
            } else {
                renderMovies(movies, container);
            }
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        const container = document.getElementById('movies-container');
        if (container) {
            container.innerHTML = '<p class="error">Error al cargar películas</p>';
        }
    }
}

// Cargar series específicas (endpoint /shows?page=1)
async function loadSeries() {
    await fetchData(`${API_BASE}/shows?page=1`, 'series-container', 'series');
}

// Inicializar según la página actual
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('series.html')) {
        loadSeries();
    } else {
        // Página principal
        loadShows();
        loadMovies();
    }
});