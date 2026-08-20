/* ===========================================================
   Ejercicio 1: Galería de imágenes
   API usada: Lorem Picsum (https://picsum.photos/)
   No requiere API key, entrega fotos reales con id, autor,
   ancho y alto -> ideal para mostrar "información de cada foto".

   Si prefieres usar la API sugerida en el PDF (jsonplaceholder
   /photos) o Pexels, basta con cambiar la función obtenerFotos()
   por la petición correspondiente; el resto del código no cambia.
   =========================================================== */

const CANTIDAD_FOTOS = 12; // mínimo pedido: 10
const contenedor = document.getElementById('galeria');
const status = document.getElementById('status');
const btnReload = document.getElementById('btnReload');

// Petición a la API usando async/await + try/catch
async function obtenerFotos() {
  const url = `https://picsum.photos/v2/list?page=${Math.ceil(Math.random() * 5)}&limit=${CANTIDAD_FOTOS}`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    // Si el servidor responde con error (4xx, 5xx) lo lanzamos como excepción
    throw new Error(`Error del servidor: ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  return datos;
}

// Construye el HTML de una tarjeta de foto
function crearTarjeta(foto, index) {
  const card = document.createElement('article');
  card.className = 'foto-card';

  card.innerHTML = `
    <span class="frame-tag">#${String(index + 1).padStart(2, '0')}</span>
    <img
      src="${foto.download_url}"
      alt="Fotografía de ${foto.author}"
      loading="lazy"
    />
    <div class="foto-info">
      <div class="autor">${foto.author}</div>
      <div>ID API: <span class="frame-id">${foto.id}</span></div>
      <div>${foto.width} × ${foto.height}px</div>
    </div>
  `;

  return card;
}

function mostrarError(mensaje) {
  contenedor.innerHTML = `
    <div class="error-box">
      <strong>No se pudo cargar la galería.</strong><br />
      ${mensaje}<br />
      Verifica tu conexión a internet e intenta de nuevo.
    </div>
  `;
}

// Función principal: pide las fotos y las pinta en pantalla
async function cargarGaleria() {
  status.textContent = 'Cargando rollo de fotos…';
  contenedor.innerHTML = '';

  try {
    const fotos = await obtenerFotos();

    if (!fotos || fotos.length === 0) {
      mostrarError('La API no devolvió imágenes.');
      return;
    }

    fotos.forEach((foto, index) => {
      contenedor.appendChild(crearTarjeta(foto, index));
    });

    status.textContent = `${fotos.length} fotos cargadas`;
  } catch (error) {
    console.error('Error al obtener las fotos:', error);
    mostrarError(error.message);
    status.textContent = 'Error al cargar';
  }
}

// Eventos
btnReload.addEventListener('click', cargarGaleria);
document.addEventListener('DOMContentLoaded', cargarGaleria);
