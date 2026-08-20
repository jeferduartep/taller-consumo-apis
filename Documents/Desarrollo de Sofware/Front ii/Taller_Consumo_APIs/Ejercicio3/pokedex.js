/* ===========================================================
   Ejercicio 3: Pokédex
   API usada: PokeAPI (https://pokeapi.co/) - no requiere key.
   =========================================================== */

const URL_POKEMON = 'https://pokeapi.co/api/v2/pokemon';
const URL_LISTA = 'https://pokeapi.co/api/v2/pokemon?limit=151'; // 1ra generación para las sugerencias

// Diccionario de tipos EN -> ES (la PokeAPI no trae el tipo traducido
// en el endpoint /pokemon, así que lo resolvemos localmente)
const TIPOS_ES = {
  normal: 'normal', fire: 'fuego', water: 'agua', electric: 'eléctrico',
  grass: 'planta', ice: 'hielo', fighting: 'lucha', poison: 'veneno',
  ground: 'tierra', flying: 'volador', psychic: 'psíquico', bug: 'bicho',
  rock: 'roca', ghost: 'fantasma', dragon: 'dragón', dark: 'siniestro',
  steel: 'acero', fairy: 'hada',
};

// Elementos del DOM
const form = document.getElementById('formBusqueda');
const input = document.getElementById('inputPokemon');
const datalist = document.getElementById('listaPokemon');
const mensaje = document.getElementById('mensaje');
const pantalla = document.getElementById('pantalla');

const elNombre = document.getElementById('nombre');
const elNumero = document.getElementById('numero');
const elTipos = document.getElementById('tipos');
const elSprite = document.getElementById('sprite');
const elPeso = document.getElementById('peso');
const elListaHabilidades = document.getElementById('listaHabilidades');

const barraHp = document.getElementById('barraHp');
const valorHp = document.getElementById('valorHp');
const barraAtaque = document.getElementById('barraAtaque');
const valorAtaque = document.getElementById('valorAtaque');
const barraDefensa = document.getElementById('barraDefensa');
const valorDefensa = document.getElementById('valorDefensa');

// Carga la lista de nombres para el datalist (autocompletado)
async function cargarSugerencias() {
  try {
    const respuesta = await fetch(URL_LISTA);
    const datos = await respuesta.json();

    datos.results.forEach((p) => {
      const option = document.createElement('option');
      option.value = p.name;
      datalist.appendChild(option);
    });
  } catch (error) {
    // Si falla, no es crítico: el usuario igual puede escribir el nombre manualmente
    console.warn('No se pudieron cargar las sugerencias:', error);
  }
}

// Busca el nombre en español de una habilidad usando su URL de detalle
async function obtenerNombreHabilidadEs(urlHabilidad) {
  try {
    const respuesta = await fetch(urlHabilidad);
    const datos = await respuesta.json();
    const nombreEs = datos.names.find((n) => n.language.name === 'es');
    return nombreEs ? nombreEs.name : datos.name;
  } catch {
    return null; // si falla, más adelante usamos el nombre en inglés como respaldo
  }
}

async function obtenerPokemon(busqueda) {
  const url = `${URL_POKEMON}/${busqueda}`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error('Pokémon no encontrado');
  }

  return respuesta.json();
}

function calcularAncho(valor) {
  // Las stats de la PokeAPI van de 0 a ~255; lo normalizamos a % para la barra
  return Math.min(100, Math.round((valor / 180) * 100));
}

function obtenerStat(pokemon, nombreStat) {
  const stat = pokemon.stats.find((s) => s.stat.name === nombreStat);
  return stat ? stat.base_stat : 0;
}

async function pintarPokemon(pokemon) {
  elNombre.textContent = pokemon.name;
  elNumero.textContent = `N.º ${String(pokemon.id).padStart(3, '0')}`;

  elSprite.src =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;
  elSprite.alt = pokemon.name;

  // Tipos
  elTipos.innerHTML = '';
  pokemon.types.forEach((t) => {
    const nombreEs = TIPOS_ES[t.type.name] || t.type.name;
    const pill = document.createElement('span');
    pill.className = `tipo-pill tipo-${nombreEs}`;
    pill.textContent = nombreEs;
    elTipos.appendChild(pill);
  });

  // Peso: la API lo da en hectogramos -> convertir a kg
  elPeso.textContent = (pokemon.weight / 10).toFixed(1);

  // Stats
  const hp = obtenerStat(pokemon, 'hp');
  const ataque = obtenerStat(pokemon, 'attack');
  const defensa = obtenerStat(pokemon, 'defense');

  valorHp.textContent = hp;
  barraHp.style.width = `${calcularAncho(hp)}%`;

  valorAtaque.textContent = ataque;
  barraAtaque.style.width = `${calcularAncho(ataque)}%`;

  valorDefensa.textContent = defensa;
  barraDefensa.style.width = `${calcularAncho(defensa)}%`;

  // Habilidades traducidas al español (se piden en paralelo para no bloquear)
  elListaHabilidades.innerHTML = '<li>Cargando…</li>';

  const nombresHabilidades = await Promise.all(
    pokemon.abilities.map((a) => obtenerNombreHabilidadEs(a.ability.url))
  );

  elListaHabilidades.innerHTML = '';
  pokemon.abilities.forEach((a, i) => {
    const li = document.createElement('li');
    li.textContent = nombresHabilidades[i] || a.ability.name;
    elListaHabilidades.appendChild(li);
  });

  pantalla.classList.remove('oculto');
}

async function buscarPokemon(evento) {
  evento.preventDefault();

  const busqueda = input.value.trim().toLowerCase();

  if (busqueda.length === 0) {
    mensaje.textContent = 'Escribe un nombre o número de Pokémon.';
    pantalla.classList.add('oculto');
    return;
  }

  mensaje.textContent = 'Buscando…';
  pantalla.classList.add('oculto');

  try {
    const pokemon = await obtenerPokemon(busqueda);
    mensaje.textContent = '';
    await pintarPokemon(pokemon);
  } catch (error) {
    console.error('Error al buscar el Pokémon:', error);
    mensaje.textContent = `No encontramos "${busqueda}". Verifica el nombre o número (ID).`;
  }
}

form.addEventListener('submit', buscarPokemon);
document.addEventListener('DOMContentLoaded', cargarSugerencias);
