// js/producto.js
// Carga un producto por id desde la query string y lo muestra en la página de detalle

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const id = getQueryParam('id');

if (!id) {
  // No hay id: redirigir a index
  window.location.href = './index.html';
}

fetch('./js/productos.json')
  .then(r => r.json())
  .then(data => {
    const producto = data.find(p => p.id === id);
    if (!producto) return window.location.href = './index.html';
    renderProducto(producto);
  })
  .catch(err => console.error('Error cargando productos.json', err));

function renderProducto(producto) {
  const mainImage = document.getElementById('main-image');
  const thumbs = document.getElementById('thumbs');
  const title = document.getElementById('product-title');
  const price = document.getElementById('product-price');
  const desc = document.getElementById('product-description');
  const category = document.getElementById('product-category');
  const specList = document.getElementById('spec-list');
  const addBtn = document.getElementById('add-to-cart');
  const qtyInput = document.getElementById('qty-input');

  // Datos basicos
  mainImage.src = producto.imagen;
  mainImage.alt = producto.titulo;
  title.innerText = producto.titulo;
  price.innerText = `$${producto.precio}`;
  desc.innerText = producto.descripcion || 'Sin descripción disponible.';
  category.innerText = `Categoría: ${producto.categoria.nombre}`;

  // Thumbs: por ahora duplicamos la misma imagen (si quieres, puedes añadir más)
  thumbs.innerHTML = '';
  const imgThumb = document.createElement('img');
  imgThumb.src = producto.imagen;
  imgThumb.alt = producto.titulo;
  imgThumb.classList.add('thumb');
  imgThumb.addEventListener('click', () => mainImage.src = producto.imagen);
  thumbs.appendChild(imgThumb);

  // Especificaciones (si existen)
  if (producto.especificaciones && producto.especificaciones.length) {
    specList.innerHTML = '';
    producto.especificaciones.forEach(s => {
      const li = document.createElement('li');
      li.innerText = s;
      specList.appendChild(li);
    })
  } else {
    specList.innerHTML = '<li>Sin especificaciones</li>';
  }

  // Añadir al carrito
  addBtn.addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;

    let carrito = [];
    try { carrito = JSON.parse(localStorage.getItem('productos-en-carrito')) || []; } catch { carrito = []; }

    const existing = carrito.find(p => p.id === producto.id);
    if (existing) {
      existing.cantidad = (existing.cantidad || 0) + qty;
    } else {
      const copy = { ...producto, cantidad: qty };
      carrito.push(copy);
    }

    localStorage.setItem('productos-en-carrito', JSON.stringify(carrito));

    if (typeof Toastify === 'function') {
      Toastify({ text: 'Producto agregado', duration: 2500, gravity: 'top', position: 'right' }).showToast();
    }

    // actualizar numerito si existe
    const numerito = document.querySelector('#numerito');
    if (numerito) {
      const total = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
      numerito.innerText = total;
    }

    // después de agregar, opcionalmente redirigir al carrito o mostrar mensaje
  });
}
