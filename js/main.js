let productos = [];

// Configuración de la API
const API_URL = 'http://localhost:5000';

// Cargar productos desde la API Flask
fetch(`${API_URL}/api/productos`)
	.then(response => {
		if (!response.ok) throw new Error(`Error: ${response.status}`);
		return response.json();
	})
	.then(data => {
		productos = data;
		cargarProductos(productos);
	})
	.catch(err => {
		console.error('No se pudo cargar productos de la API:', err);
		// Fallback al JSON local si la API falla
		fetch("./js/productos.json")
			.then(response => response.json())
			.then(data => {
				productos = data;
				cargarProductos(productos);
				console.warn('Usando productos.json local como fallback');
			})
			.catch(err2 => console.error('Ambas fuentes fallaron:', err2));
	});


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
			// Obtener categoría seleccionada
			const categoriaId = e.currentTarget.id;
			
			// Buscar nombre de categoría en los productos cargados (fallback)
			const productoCategoria = productos.find(producto => producto.categoria.id === categoriaId);
			if (productoCategoria && tituloPrincipal) {
				tituloPrincipal.innerText = productoCategoria.categoria.nombre;
			}
			
			// Filtrar productos en memoria (rápido) o desde API
			const productosBoton = productos.filter(producto => producto.categoria.id === categoriaId);
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

