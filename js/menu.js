// js/menu.js
// Maneja la apertura y cierre del menú lateral (aside).
// Adaptado al tema del proyecto "MyShop".

const openMenu = document.querySelector("#open-menu");
const closeMenu = document.querySelector("#close-menu");
const aside = document.querySelector("aside");

// Función auxiliar: añade/quita clase de forma segura
function showAside() {
  if (!aside) return;
  aside.classList.add("aside-visible");
}
function hideAside() {
  if (!aside) return;
  aside.classList.remove("aside-visible");
}

// Event listeners defensivos: solo si los elementos existen
if (openMenu) {
  openMenu.addEventListener("click", (e) => {
    e.preventDefault();
    showAside();
  });
}

if (closeMenu) {
  closeMenu.addEventListener("click", (e) => {
    e.preventDefault();
    hideAside();
  });
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
