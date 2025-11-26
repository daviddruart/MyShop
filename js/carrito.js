// Configuración de la API
const API_URL = 'http://localhost:5000';

// Recuperar carrito desde localStorage con comprobaciones
let productosEnCarrito = [];
const productosEnCarritoLS = localStorage.getItem("productos-en-carrito");
if (productosEnCarritoLS) {
  try {
	productosEnCarrito = JSON.parse(productosEnCarritoLS) || [];
  } catch {
	productosEnCarrito = [];
  }
}

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");


function cargarProductosCarrito() {
	if (productosEnCarrito && productosEnCarrito.length > 0) {

		if (contenedorCarritoVacio) contenedorCarritoVacio.classList.add("disabled");
		if (contenedorCarritoProductos) contenedorCarritoProductos.classList.remove("disabled");
		if (contenedorCarritoAcciones) contenedorCarritoAcciones.classList.remove("disabled");
		if (contenedorCarritoComprado) contenedorCarritoComprado.classList.add("disabled");
    
		if (contenedorCarritoProductos) contenedorCarritoProductos.innerHTML = "";
    
		productosEnCarrito.forEach(producto => {

			const div = document.createElement("div");
			div.classList.add("carrito-producto");
			div.innerHTML = `
				<img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
				<div class="carrito-producto-titulo">
					<small>Título</small>
					<h3>${producto.titulo}</h3>
				</div>
				<div class="carrito-producto-cantidad">
					<small>Cantidad</small>
					<p>${producto.cantidad}</p>
				</div>
				<div class="carrito-producto-precio">
					<small>Precio</small>
					<p>$${producto.precio}</p>
				</div>
				<div class="carrito-producto-subtotal">
					<small>Subtotal</small>
					<p>$${producto.precio * producto.cantidad}</p>
				</div>
				<button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
			`;

			if (contenedorCarritoProductos) contenedorCarritoProductos.append(div);
		})

		actualizarBotonesEliminar();
		actualizarTotal();
    
	} else {
		if (contenedorCarritoVacio) contenedorCarritoVacio.classList.remove("disabled");
		if (contenedorCarritoProductos) contenedorCarritoProductos.classList.add("disabled");
		if (contenedorCarritoAcciones) contenedorCarritoAcciones.classList.add("disabled");
		if (contenedorCarritoComprado) contenedorCarritoComprado.classList.add("disabled");
	}

}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
	botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

	botonesEliminar.forEach(boton => {
		boton.addEventListener("click", eliminarDelCarrito);
	});
}

function eliminarDelCarrito(e) {
	if (typeof Toastify === 'function') {
		Toastify({
			text: "Producto eliminado",
			duration: 3000,
			close: true,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
			style: {
			  background: "linear-gradient(to right, #4b33a8, #785ce9)",
			  borderRadius: "2rem",
			  textTransform: "uppercase",
			  fontSize: ".75rem"
			},
			offset: { x: '1.5rem', y: '1.5rem' },
			onClick: function(){}
		  }).showToast();
	}

	const idBoton = e.currentTarget.id;
	const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
	if (index > -1) productosEnCarrito.splice(index, 1);
	cargarProductosCarrito();

	localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

}

if (botonVaciar) botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {

	const totalItems = productosEnCarrito.reduce((acc, producto) => acc + (producto.cantidad || 0), 0);

	if (typeof Swal === 'function') {
		Swal.fire({
			title: '¿Estás seguro?',
			icon: 'question',
			html: `Se van a borrar ${totalItems} productos.`,
			showCancelButton: true,
			focusConfirm: false,
			confirmButtonText: 'Sí',
			cancelButtonText: 'No'
		}).then((result) => 
            {
			if (result.isConfirmed) {
				productosEnCarrito.length = 0;
				localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
				cargarProductosCarrito();
			}
		    })
	} else {
		// Fallback sin Swal
		if (confirm(`Se van a borrar ${totalItems} productos. ¿Continuar?`)) {
			productosEnCarrito.length = 0;
			localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
			cargarProductosCarrito();
		}
	}
}


function actualizarTotal() {
	const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + ((producto.precio || 0) * (producto.cantidad || 0)), 0);
	if (contenedorTotal) contenedorTotal.innerText = `$${totalCalculado}`;
}

if (botonComprar) botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
	// Validar que haya productos
	if (!productosEnCarrito || productosEnCarrito.length === 0) {
		if (typeof Swal === 'function') {
			Swal.fire({
				title: 'Carrito vacío',
				icon: 'warning',
				text: 'Agrega productos antes de continuar con la compra.'
			});
		} else {
			alert('El carrito está vacío. Agrega productos antes de comprar.');
		}
		return;
	}

	// Redirigir a la página de pagos
	window.location.href = './pagos.html';
}
