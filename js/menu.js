// js/menu.js
// Maneja la apertura y cierre del menú lateral (aside).
// Adaptado al tema del proyecto "MyShop".

const openMenu = document.querySelector("#open-menu");
const closeMenu = document.querySelector("#close-menu");
const aside = document.querySelector("aside");
const overlay = document.querySelector('#overlay');

if (overlay) {
  overlay.addEventListener('click', (e) => {
    hideAside();
  });
  overlay.addEventListener('touchstart', (e) => {
    e.preventDefault();
    hideAside();
  }, { passive: false });
  overlay.addEventListener('pointerdown', (e) => {
    hideAside();
  });
}

// Función auxiliar: añade/quita clase de forma segura
function showAside() {
if (!aside) return;
aside.classList.add("aside-visible");
  if (overlay) overlay.classList.add('visible');
}
function hideAside() {
if (!aside) return;
aside.classList.remove("aside-visible");
  if (overlay) overlay.classList.remove('visible');
}

// Fallback visual force: aplica estilos inline si por alguna razón la clase no se muestra
function forceShowAside() {
  if (!aside) return;
  aside.style.transform = 'translateX(0)';
  aside.style.opacity = '1';
  aside.style.visibility = 'visible';
}
function forceHideAside() {
  if (!aside) return;
  aside.style.transform = 'translateX(-100%)';
  aside.style.opacity = '0';
  aside.style.visibility = 'hidden';
}

// Event listeners defensivos: solo si los elementos existen
if (openMenu) {
openMenu.addEventListener("click", (e) => {
    e.preventDefault();
    // Toggle para que funcione tanto abrir como cerrar con el mismo botón
    if (!aside) return;
    console.log('menu: click openMenu, aside before toggle:', aside.className);
  aside.classList.toggle("aside-visible");
  if (overlay) overlay.classList.toggle('visible');
    // Evitar que el listener global de document cierre inmediatamente el aside
    e.stopPropagation();
    // Si tras toggle la clase no hizo efecto visual (problemas CSS en móvil), aplicamos fallback
    setTimeout(() => {
      const visible = aside.classList.contains('aside-visible');
      console.log('menu: after toggle, visible=', visible);
      if (visible) {
        forceShowAside();
      } else {
        forceHideAside();
      }
    }, 50);
});
  // Soporte para eventos táctiles/pointer en móviles (algunos navegadores manejan touch/pointer antes que click)
openMenu.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!aside) return;
    console.log('menu: touchstart openMenu');
  aside.classList.toggle("aside-visible");
  if (overlay) overlay.classList.toggle('visible');
    e.stopPropagation();
    setTimeout(() => {
      const visible = aside.classList.contains('aside-visible');
      if (visible) forceShowAside(); else forceHideAside();
    }, 50);
}, { passive: false });
openMenu.addEventListener("pointerdown", (e) => {
    // pointer events pueden llegar en algunos dispositivos táctiles
    e.preventDefault();
    if (!aside) return;
    console.log('menu: pointerdown openMenu');
  aside.classList.toggle("aside-visible");
  if (overlay) overlay.classList.toggle('visible');
    e.stopPropagation();
    setTimeout(() => {
      const visible = aside.classList.contains('aside-visible');
      if (visible) forceShowAside(); else forceHideAside();
    }, 50);
});
}

if (closeMenu) {
closeMenu.addEventListener("click", (e) => {
    e.preventDefault();
    hideAside();
});
closeMenu.addEventListener("touchstart", (e) => {
    e.preventDefault();
    hideAside();
}, { passive: false });
closeMenu.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    hideAside();
});

// Asegurar que al esconder también se remuevan estilos inline de fallback
function clearForcedStyles() {
  if (!aside) return;
  aside.style.transform = '';
  aside.style.opacity = '';
  aside.style.visibility = '';
}

// Extender hideAside para limpiar forced styles
const _origHideAside = hideAside;
hideAside = function() {
  _origHideAside();
  clearForcedStyles();
}
}

// Cerrar con ESC
document.addEventListener("keydown", (e) => {
if (e.key === "Escape") hideAside();
});

// Cerrar al hacer clic fuera del aside (en el overlay)
document.addEventListener("click", (e) => {
if (!aside) return;
  // Si el aside no está visible, no hacemos nada
if (!aside.classList.contains("aside-visible")) return;
  // Si el clic es dentro del aside, no cerrar
if (aside.contains(e.target)) return;
  // Si el clic es en el botón de abrir, tampoco cerrar inmediatamente
if (openMenu && openMenu.contains(e.target)) return;

hideAside();
});
