/* ===========================================================
   Ejercicio 2: Buscador de clima (ClimApp)
   API usada: OpenWeatherMap (https://openweathermap.org/api)

   IMPORTANTE: Debes crear una cuenta gratuita en OpenWeatherMap,
   generar tu API key en https://home.openweathermap.org/api_keys
   y pegarla abajo en API_KEY. Las keys nuevas pueden tardar
   hasta un par de horas en activarse.
   =========================================================== */

const API_KEY = 'TU_API_KEY_AQUI'; // <-- reemplaza esto con tu clave real
const URL_BASE = 'https://api.openweathermap.org/data/2.5/weather';

// Elementos del DOM
const form = document.getElementById('formBusqueda');
const inputCiudad = document.getElementById('inputCiudad');
const btnBuscar = document.getElementById('btnBuscar');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');

const elCiudad = document.getElementById('ciudadNombre');
const elPais = document.getElementById('paisNombre');
const elIcono = document.getElementById('icono');
const elTemp = document.getElementById('temperatura');
const elDescripcion = document.getElementById('descripcion');
const elSensacion = document.getElementById('sensacion');
const elHumedad = document.getElementById('humedad');
const elViento = document.getElementById('viento');

// Traducción rápida de códigos de país (ISO 3166-1 alpha-2) a español.
// Solo cubre los más comunes en Latinoamérica y España; se puede ampliar.
const PAISES_ES = {
  CO: 'Colombia', MX: 'México', ES: 'España', AR: 'Argentina',
  CL: 'Chile', PE: 'Perú', EC: 'Ecuador', VE: 'Venezuela',
  BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', CR: 'Costa Rica',
  PA: 'Panamá', GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador',
  NI: 'Nicaragua', CU: 'Cuba', DO: 'República Dominicana',
  US: 'Estados Unidos', BR: 'Brasil', FR: 'Francia', IT: 'Italia',
  DE: 'Alemania', GB: 'Reino Unido', PT: 'Portugal', CA: 'Canadá',
  JP: 'Japón', CN: 'China',
};

function traducirPais(codigo) {
  return PAISES_ES[codigo] || codigo;
}

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
}

function limpiarResultado() {
  resultado.classList.add('oculto');
}

// Petición a la API del clima
async function obtenerClima(ciudad) {
  const url = `${URL_BASE}?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`;
  const respuesta = await fetch(url);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    // OpenWeatherMap devuelve { cod, message } cuando hay error (ej. ciudad no encontrada)
    throw new Error(datos.message || 'No se pudo obtener el clima.');
  }

  return datos;
}

function pintarClima(datos) {
  elCiudad.textContent = datos.name;
  elPais.textContent = traducirPais(datos.sys.country);
  elIcono.src = `https://openweathermap.org/img/wn/${datos.weather[0].icon}@2x.png`;
  elIcono.alt = datos.weather[0].description;

  elTemp.textContent = `${Math.round(datos.main.temp)}°C`;
  elDescripcion.textContent = datos.weather[0].description;

  elSensacion.textContent = `${Math.round(datos.main.feels_like)}°C`;
  elHumedad.textContent = `${datos.main.humidity}%`;
  elViento.textContent = `${Math.round(datos.wind.speed * 3.6)} km/h`; // m/s -> km/h

  resultado.classList.remove('oculto');
}

async function buscarClima(evento) {
  evento.preventDefault();

  const ciudad = inputCiudad.value.trim();

  // Validación de entrada
  if (ciudad.length === 0) {
    mostrarMensaje('Escribe el nombre de una ciudad.');
    limpiarResultado();
    return;
  }

  if (API_KEY === 'TU_API_KEY_AQUI') {
    mostrarMensaje('Falta configurar tu API key de OpenWeatherMap en clima.js.');
    limpiarResultado();
    return;
  }

  btnBuscar.disabled = true;
  mostrarMensaje('Buscando…');
  limpiarResultado();

  try {
    const datos = await obtenerClima(ciudad);
    mostrarMensaje('');
    pintarClima(datos);
  } catch (error) {
    console.error('Error al obtener el clima:', error);

    // Mensajes más amigables para los errores más comunes
    if (error.message.toLowerCase().includes('city not found')) {
      mostrarMensaje(`No encontramos la ciudad "${ciudad}". Verifica que esté bien escrita.`);
    } else {
      mostrarMensaje(`Ocurrió un error: ${error.message}`);
    }
  } finally {
    btnBuscar.disabled = false;
  }
}

// El formulario ya escucha tanto el submit del botón como la tecla Enter
form.addEventListener('submit', buscarClima);
