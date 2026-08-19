const params = new URLSearchParams(window.location.search);
const productId = params.get('id') || 'cuadro-01';
const cart = JSON.parse(localStorage.getItem('productos-en-carrito') || '[]');
const loadProducts = fetch('http://localhost:5000/api/productos').then((response) => { if (!response.ok) throw new Error('API'); return response.json(); }).catch(() => fetch('./js/productos.json').then((response) => response.json()));
loadProducts.then((products) => {
  const product = products.find((item) => item.id === productId) || products[0];
  document.title = `${product.titulo} | MyShop`;
  document.querySelector('#producto-imagen').src = product.imagen;
  document.querySelector('#producto-imagen').alt = product.titulo;
  document.querySelector('#producto-categoria').textContent = product.categoria.nombre;
  document.querySelector('#producto-titulo').textContent = product.titulo;
  document.querySelector('#producto-descripcion').textContent = 'Una pieza seleccionada para darle presencia, textura y carácter a tu espacio.';
  document.querySelector('#producto-precio').textContent = `$${product.precio.toLocaleString('es-CO')}`;
  document.querySelector('#producto-agregar').addEventListener('click', () => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.cantidad += 1; else cart.push({ ...product, cantidad: 1 });
    localStorage.setItem('productos-en-carrito', JSON.stringify(cart));
    if (typeof Toastify === 'function') Toastify({ text: 'Pieza agregada a tu selección', duration: 2200, gravity: 'top', position: 'right', style: { background: '#FFB13C', color: '#121110' } }).showToast();
    document.querySelector('#product-cart-count').textContent = cart.reduce((total, item) => total + (item.cantidad || 0), 0);
  });
}).catch(() => { document.querySelector('#producto-titulo').textContent = 'Pieza no disponible'; });
