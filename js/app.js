var perfumes = [];
var usuarioActual = null;
var favoritos = new Set();

/* LocalStorage */
function claveFavoritos(usuario) {
  return "favoritos_" + usuario;
}

function obtenerFavoritos(usuario) {
  var clave = claveFavoritos(usuario);
  var datos = localStorage.getItem(clave);
  if (datos === null) {
    return new Set();
  }
  var arregloFavoritos = JSON.parse(datos);
  return new Set(arregloFavoritos);
}

function guardarFavoritos(usuario, favs) {
  const clave = claveFavoritos(usuario);
  const arregloFavoritos = Array.from(favs);
  const texto = JSON.stringify(arregloFavoritos);
  localStorage.setItem(clave, texto);
}


const vistaLogin = document.getElementById("vistaLogin");
const vistaApp = document.getElementById("vistaApp");

const formLogin = document.getElementById("formLogin");
const entradaUsuario = document.getElementById("entradaUsuario");
const mensajeLogin = document.getElementById("mensajeLogin");
const barraUsuario = document.getElementById("barraUsuario");

const selectorOrden = document.getElementById("selectorOrden");
const selectorVista = document.getElementById("selectorVista");

const listaPerfumes = document.getElementById("listaPerfumes");
const estadoVacio = document.getElementById("estadoVacio");

/* login */
formLogin.addEventListener("submit", function (e) {
  e.preventDefault();

  const usuario = entradaUsuario.value.trim();
  if (usuario === "") {
    mensajeLogin.textContent = "Escribe un usuario";
    return;
  }

  mensajeLogin.textContent = "";
  usuarioActual = usuario;
  localStorage.setItem("usuarioSesion", usuarioActual);

  favoritos = obtenerFavoritos(usuarioActual);
  mostrarApp();
});

function mostrarUsuario() {
  barraUsuario.innerHTML =
    "<strong>Usuario:</strong> " + usuarioActual +
    ' <button class="btn" style="margin-left:10px; padding:8px 10px;" onclick="cerrarSesion()">Salir</button>';
}

function ordenar(lista) {
  var resultado = lista.slice();

  if (selectorVista.value === "soloFavoritos") {
    resultado = resultado.filter(p => favoritos.has(p.id));
  }

  if (selectorOrden.value === "precioMenor") {
    resultado.sort((a, b) => a.precio - b.precio);
  } else if (selectorOrden.value === "precioMayor") {
    resultado.sort((a, b) => b.precio - a.precio);
  } else if (selectorOrden.value === "nombreAZ") {
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  } else if (selectorOrden.value === "nombreZA") {
    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre, "es"));
  } else if (selectorOrden.value === "favoritosPrimero") {
    resultado.sort((a, b) => (favoritos.has(b.id) - favoritos.has(a.id)));
  }

  return resultado;
}

function renderizar() {
  const lista = ordenar(perfumes);

  listaPerfumes.innerHTML = "";

  if (lista.length === 0) {
    estadoVacio.classList.remove("oculto");
    return;
  }
  estadoVacio.classList.add("oculto");

  lista.forEach(p => {
    const art = document.createElement("article");
    art.className = "producto";

    if (favoritos.has(p.id)) {
      art.classList.add("favorito");
    }

    art.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="meta">${p.marca} • ${p.tamano} • ${p.tipo}</p>
      <p class="desc">${p.descripcion}</p>

      <div class="pie">
        <span class="precio">$${p.precio.toLocaleString("es-MX")} MXN</span>
        <button class="btn-fav" onclick="alternarFavorito('${p.id}')">
          ${favoritos.has(p.id) ? "Quitar" : "Favorito"}
        </button>
      </div>
    `;

    listaPerfumes.appendChild(art);
  });
}

function alternarFavorito(id) {
  if (favoritos.has(id)) {
    favoritos.delete(id);
  } else {
    favoritos.add(id);
  }

  guardarFavoritos(usuarioActual, favoritos);
  renderizar();
}

function cerrarSesion() {
  localStorage.removeItem("usuarioSesion");
  location.reload();
}

function mostrarApp() {
  vistaLogin.classList.add("oculto");
  vistaApp.classList.remove("oculto");
  mostrarUsuario();
  renderizar();
}

selectorOrden.addEventListener("change", renderizar);
selectorVista.addEventListener("change", renderizar);

async function iniciar() {
  const res = await fetch("perfumes.json");
  perfumes = await res.json();

  const usuarioGuardado = localStorage.getItem("usuarioSesion");
  if (usuarioGuardado) {
    usuarioActual = usuarioGuardado;
    favoritos = obtenerFavoritos(usuarioActual);
    mostrarApp();
  }
}

iniciar();
