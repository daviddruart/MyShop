let productos = [];

fetch("./js/productos.json")
	.then(response => response.json())
	.then(data => {
		productos = data;
		// Si hay una categoría en la URL, seleccionarla
		const url = new URL(window.location.href);
		const category = url.searchParams.get('category');
		if (category) {
			// Buscar si existe un boton con ese id y disparar su click
			const boton = Array.from(botonesCategorias).find(b => b.id === category);
			if (boton) {
				boton.click();
			} else {
				cargarProductos(productos);
			}
		} else {
			cargarProductos(productos);
		}
	})
	.catch(err => console.error('No se pudo cargar productos.json', err));


const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");
const aside = document.querySelector('aside');


botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
	if (aside) aside.classList.remove("aside-visible");
}))


function cargarProductos(productosElegidos) {

	if (!contenedorProductos) return;

	contenedorProductos.innerHTML = "";

	productosElegidos.forEach(producto => {

		const div = document.createElement("div");
		div.classList.add("producto");
		div.innerHTML = `
			<img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
			<div class="producto-detalles">
				<h3 class="producto-titulo">${producto.titulo}</h3>
				<p class="producto-precio">$${producto.precio}</p>
				<button class="producto-agregar" id="${producto.id}">Agregar</button>
			</div>
		`;

		contenedorProductos.append(div);
	})

	actualizarBotonesAgregar();
}


botonesCategorias.forEach(boton => {
	boton.addEventListener("click", (e) => {

		botonesCategorias.forEach(boton => boton.classList.remove("active"));
		e.currentTarget.classList.add("active");

		if (e.currentTarget.id != "todos") {
			const productoCategoria = productos.find(producto => producto.categoria.id === e.currentTarget.id);
			if (productoCategoria) tituloPrincipal.innerText = productoCategoria.categoria.nombre;
			const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
			cargarProductos(productosBoton);
		} else {
			if (tituloPrincipal) tituloPrincipal.innerText = "Todos los productos";
			cargarProductos(productos);
		}

	})
});

function actualizarBotonesAgregar() {
	botonesAgregar = document.querySelectorAll(".producto-agregar");

	botonesAgregar.forEach(boton => {
		boton.addEventListener("click", agregarAlCarrito);
	});
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
	try {
		productosEnCarrito = JSON.parse(productosEnCarritoLS);
	} catch {
		productosEnCarrito = [];
	}
	actualizarNumerito();
} else {
	productosEnCarrito = [];
}

function agregarAlCarrito(e) {

	if (typeof Toastify === 'function') {
		Toastify({
			text: "Producto agregado",
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
			offset: {
				x: '1.5rem',
				y: '1.5rem'
			  },
			onClick: function(){}
		  }).showToast();
	}

	const idBoton = e.currentTarget.id;
	const productoAgregado = productos.find(producto => producto.id === idBoton);

	if(!productoAgregado) return;

	if(productosEnCarrito.some(producto => producto.id === idBoton)) {
		const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
		productosEnCarrito[index].cantidad++;
	} else {
		productoAgregado.cantidad = 1;
		productosEnCarrito.push(productoAgregado);
	}

	actualizarNumerito();

	localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
	if (!numerito) return;
	let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + (producto.cantidad || 0), 0);
	numerito.innerText = nuevoNumerito;
}

