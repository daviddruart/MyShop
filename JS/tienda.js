const menu = document.querySelector('.mobile-menu');
const openMenu = document.querySelector('#open-menu');
const closeMenu = document.querySelector('#close-menu');
const overlay = document.querySelector('#overlay');
const closeStoreMenu = () => { menu?.classList.remove('aside-visible'); };
openMenu?.addEventListener('click', () => menu?.classList.add('aside-visible'));
closeMenu?.addEventListener('click', closeStoreMenu);
overlay?.addEventListener('click', closeStoreMenu);
document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', closeStoreMenu));
const cartCount = document.querySelector('#nav-count');
if (cartCount) { const cart = JSON.parse(localStorage.getItem('productos-en-carrito') || '[]'); cartCount.textContent = cart.reduce((total, product) => total + (product.cantidad || 0), 0); }
