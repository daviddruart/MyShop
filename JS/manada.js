let productos = [];
const API_URL = 'http://localhost:5000';
const contenedorProductos = document.querySelector('#contenedor-productos');
const botonesCategorias = document.querySelectorAll('.boton-categoria');
const tituloPrincipal = document.querySelector('#titulo-principal');
const numerito = document.querySelector('#numerito');
const mobileNumerito = document.querySelector('#mobile-numerito');

const productosEnCarrito = JSON.parse(localStorage.getItem('productos-en-carrito') || '[]');

function actualizarNumeritos() {
  const cantidad = productosEnCarrito.reduce((total, producto) => total + (producto.cantidad || 0), 0);
  if (numerito) numerito.textContent = cantidad;
  if (mobileNumerito) mobileNumerito.textContent = cantidad;
}

function mostrarProductos(productosElegidos) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = productosElegidos.map((producto, index) => `
    <article class="product-card reveal" style="--delay:${index * 60}ms">
      <div class="product-img"><img src="../${producto.imagen}" alt="${producto.titulo}" loading="lazy"><div class="glint"></div>${index < 2 ? '<span class="tag-new">Destacado</span>' : ''}</div>
      <div class="product-info"><span class="cat">${producto.categoria.nombre}</span><h3>${producto.titulo}</h3><span class="price">$${producto.precio}</span><button class="producto-agregar" id="${producto.id}" type="button">Agregar al carrito</button></div>
    </article>`).join('');
  contenedorProductos.querySelectorAll('.reveal').forEach((elemento) => elemento.classList.add('in'));
  contenedorProductos.querySelectorAll('.producto-agregar').forEach((boton) => boton.addEventListener('click', agregarAlCarrito));
}

function agregarAlCarrito(evento) {
  const producto = productos.find((item) => item.id === evento.currentTarget.id);
  if (!producto) return;
  const existente = productosEnCarrito.find((item) => item.id === producto.id);
  if (existente) existente.cantidad += 1;
  else productosEnCarrito.push({ ...producto, cantidad: 1 });
  localStorage.setItem('productos-en-carrito', JSON.stringify(productosEnCarrito));
  actualizarNumeritos();
  if (typeof Toastify === 'function') Toastify({ text: 'Producto agregado', duration: 2200, gravity: 'top', position: 'right', style: { background: '#FFB13C', color: '#121110' } }).showToast();
}

botonesCategorias.forEach((boton) => boton.addEventListener('click', () => {
  botonesCategorias.forEach((item) => item.classList.remove('active'));
  boton.classList.add('active');
  const categoria = boton.id;
  const filtrados = categoria === 'todos' ? productos : productos.filter((producto) => producto.categoria.id === categoria);
  if (tituloPrincipal) tituloPrincipal.textContent = categoria === 'todos' ? 'Todos los productos' : boton.querySelector('span').textContent;
  mostrarProductos(filtrados);
  document.querySelector('#tendencia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

document.querySelector('#nform')?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  document.querySelector('#nform-msg').textContent = 'Listo. Bienvenido al archivo.';
  evento.currentTarget.reset();
});

const menu = document.querySelector('.mobile-menu');
document.querySelector('#open-menu')?.addEventListener('click', () => { menu?.classList.add('aside-visible'); document.querySelector('#open-menu').setAttribute('aria-expanded', 'true'); });
document.querySelector('#close-menu')?.addEventListener('click', () => { menu?.classList.remove('aside-visible'); document.querySelector('#open-menu')?.setAttribute('aria-expanded', 'false'); });
document.querySelector('#overlay')?.addEventListener('click', () => { menu?.classList.remove('aside-visible'); document.querySelector('#open-menu')?.setAttribute('aria-expanded', 'false'); });

document.querySelectorAll('a[href^="#"]').forEach((enlace) => enlace.addEventListener('click', () => menu?.classList.remove('aside-visible')));

const observer = new IntersectionObserver((entradas) => entradas.forEach((entrada) => {
  if (entrada.isIntersecting) { entrada.target.classList.add('in'); observer.unobserve(entrada.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((elemento) => observer.observe(elemento));

fetch(`${API_URL}/api/productos`).then((respuesta) => {
  if (!respuesta.ok) throw new Error('API no disponible');
  return respuesta.json();
}).catch(() => fetch('../js/productos.json').then((respuesta) => respuesta.json())).then((datos) => {
  productos = datos;
  mostrarProductos(productos);
}).catch(() => {
  if (contenedorProductos) contenedorProductos.innerHTML = '<p class="empty-products">No pudimos cargar la colección. Intenta nuevamente.</p>';
});

actualizarNumeritos();


const catCards = document.querySelectorAll('.cat-card');
const catTimers = new Map();

function obtenerImagenesCategoria(categoriaId) {
  const lista = categoriaId === 'todos'
    ? productos
    : productos.filter((producto) => producto.categoria.id === categoriaId);
  return lista.map((producto) => `../${producto.imagen}`);
}

function iniciarPreview(card) {
  if (!productos.length) return;
  const imagenes = obtenerImagenesCategoria(card.id);
  if (!imagenes.length) return;

  const [imgA, imgB] = card.querySelectorAll('.preview-img');
  let indice = 0;
  imgA.src = imagenes[indice];
  imgA.classList.add('active');

  const timer = setInterval(() => {
    indice = (indice + 1) % imagenes.length;
    const activo = card.querySelector('.preview-img.active');
    const siguiente = activo === imgA ? imgB : imgA;
    siguiente.src = imagenes[indice];
    siguiente.classList.add('active');
    activo.classList.remove('active');
  }, 1500);

  catTimers.set(card, timer);
}

function detenerPreview(card) {
  clearInterval(catTimers.get(card));
  catTimers.delete(card);
  card.querySelectorAll('.preview-img').forEach((img) => img.classList.remove('active'));
}

catCards.forEach((card) => {
  card.addEventListener('mouseenter', () => iniciarPreview(card));
  card.addEventListener('mouseleave', () => detenerPreview(card));
});