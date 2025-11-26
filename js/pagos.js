// Configuración de la API
const API_URL = 'http://localhost:5000';

// Costo de envío
const COSTO_ENVIO = 15000; // En pesos (ajustable)

// Elementos del DOM
const formPagos = document.querySelector('#form-pagos');
const resumenProductos = document.querySelector('#pagos-resumen-productos');
const subtotalEl = document.querySelector('#pagos-subtotal');
const envioEl = document.querySelector('#pagos-envio');
const totalEl = document.querySelector('#pagos-grand-total');
const imagenesContainer = document.querySelector('#pagos-imagenes-container');

// Recuperar carrito desde localStorage
let productosEnCarrito = [];
const productosEnCarritoLS = localStorage.getItem("productos-en-carrito");
if (productosEnCarritoLS) 
    {
    try 
    {
        productosEnCarrito = JSON.parse(productosEnCarritoLS) || [];
    } 
    catch 
    {
        productosEnCarrito = [];
    }
}

// Cargar resumen del carrito al iniciar
window.addEventListener('DOMContentLoaded', () => 
    {
        cargarResumenCarrito();
    });

function cargarResumenCarrito() 
{
    if (!productosEnCarrito || productosEnCarrito.length === 0) 
        {
            resumenProductos.innerHTML = '<p style="color: #999;">Tu carrito está vacío.</p>';
            subtotalEl.innerText = '$0';
            envioEl.innerText = '$0';
            totalEl.innerText = '$0';
            if (imagenesContainer) imagenesContainer.innerHTML = '<p style="color: #999;">No hay imágenes</p>';
            if (formPagos) formPagos.querySelector('button[type="submit"]').disabled = true;
            return;
        }

  // Limpiar resumen anterior
resumenProductos.innerHTML = '';
    if (imagenesContainer) imagenesContainer.innerHTML = '';

    let subtotal = 0;

productosEnCarrito.forEach(producto => 
    {
        const precioProducto = producto.precio * producto.cantidad;
        subtotal += precioProducto;

        const div = document.createElement('div');
        div.classList.add('pagos-producto-item');
        div.innerHTML = `
        <span class="pagos-producto-nombre">${producto.titulo}</span>
        <span class="pagos-producto-cantidad">x${producto.cantidad}</span>
        <span class="pagos-producto-precio">$${precioProducto.toLocaleString('es-CO')}</span>
        `;
        resumenProductos.appendChild(div);

        // Agregar imagen al contenedor de imágenes (una sola vez por producto)
        if (imagenesContainer) 
            {
                const imagenDiv = document.createElement('div');
                imagenDiv.classList.add('pagos-imagen-item');
                imagenDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.titulo}" title="${producto.titulo}">
                `;
                imagenesContainer.appendChild(imagenDiv);
            }
    });

  // Calcular total con envío
const total = subtotal + COSTO_ENVIO;

  // Actualizar totales
subtotalEl.innerText = `$${subtotal.toLocaleString('es-CO')}`;
envioEl.innerText = `$${COSTO_ENVIO.toLocaleString('es-CO')}`;
totalEl.innerText = `$${total.toLocaleString('es-CO')}`;

  // Habilitar botón de envío
if (formPagos) formPagos.querySelector('button[type="submit"]').disabled = false;

// Agregar eventos a las imágenes
agregarEventosAImagenes();
}

// Manejar envío del formulario
if (formPagos) 
    {
        formPagos.addEventListener('submit', async (e) => 
            {
                e.preventDefault();

    // Validar que haya productos
    if (!productosEnCarrito || productosEnCarrito.length === 0) 
        {
            if (typeof Swal === 'function') 
            {
                Swal.fire
                ({
                    title: 'Carrito vacío',
                    icon: 'warning',
                    text: 'No hay productos para comprar.'
                });
            } 
            else 
            {
                alert('No hay productos para comprar.');
            }
            return;
        }

    // Obtener datos del formulario
    const clienteNombre = document.querySelector('#cliente-nombre').value.trim();
    const clienteEmail = document.querySelector('#cliente-email').value.trim();
    const clienteTelefono = document.querySelector('#cliente-telefono').value.trim();
    const clienteDireccion = document.querySelector('#cliente-direccion').value.trim();
    const clienteCiudad = document.querySelector('#cliente-ciudad').value.trim();
    const clienteCodigoPostal = document.querySelector('#cliente-codigo-postal').value.trim();
    const clienteNotas = document.querySelector('#cliente-notas').value.trim();

    // Validaciones básicas
    if (!clienteNombre || !clienteEmail || !clienteDireccion || !clienteCiudad) 
        {
            if (typeof Swal === 'function') 
                {
                    Swal.fire
                    ({
                        title: 'Campos requeridos',
                        icon: 'warning',
                        text: 'Por favor completa todos los campos marcados con *'
                    });
                } 
                else 
                {
                    alert('Por favor completa todos los campos requeridos.');
                }
                return;
        }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clienteEmail)) 
        {
        if (typeof Swal === 'function') 
            {
                Swal.fire
                ({
                    title: 'Email inválido',
                    icon: 'warning',
                    text: 'Por favor ingresa un email válido.'
                });
            } 
            else 
            {
                alert('Email inválido.');
            }
            return;
        }

    // Preparar datos de la orden
    const subtotalOrden = productosEnCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const totalOrden = subtotalOrden + COSTO_ENVIO;

    const ordenData = 
        {
            cliente_nombre: clienteNombre,
            cliente_email: clienteEmail,
            cliente_telefono: clienteTelefono,
            cliente_direccion: clienteDireccion,
            cliente_ciudad: clienteCiudad,
            cliente_codigo_postal: clienteCodigoPostal,
            cliente_notas: clienteNotas,
            costo_envio: COSTO_ENVIO,
            total: totalOrden,
            productos: productosEnCarrito.map(p => ({ id: p.id, cantidad: p.cantidad }))
        };

    // Deshabilitar botón mientras se procesa
    const botonEnviar = formPagos.querySelector('button[type="submit"]');
    const textoOriginal = botonEnviar.innerHTML;
    botonEnviar.disabled = true;
    botonEnviar.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';

    // Enviar orden a la API
    try {
        const response = await fetch(`${API_URL}/api/ordenes`, 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ordenData)
        });

    if (!response.ok) 
        {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

    const data = await response.json();
    console.log('Orden creada:', data);

      // Éxito: mostrar mensaje y limpiar carrito
    if (typeof Swal === 'function') {
        Swal.fire
        ({
            title: '¡Compra completada!',
            icon: 'success',
            html: `
            <p><strong>Gracias por tu compra, ${clienteNombre}.</strong></p>
            <p style="margin-top: 1rem;">
                <strong>Número de orden:</strong> <span style="color: #871810; font-size: 1.2rem;">#${data.orden.id}</span>
            </p>
            <p>
                <strong>Total:</strong> $${data.orden.total.toLocaleString('es-CO')}
            </p>
            <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">
                Se ha enviado un correo de confirmación a ${clienteEmail}
            </p>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#871810'
        })
        .then(() => 
        {
            // Limpiar carrito y redirigir
            limpiarYRedirigir();
        });
        } 
        else 
        {
            alert(`¡Compra completada!\nNúmero de orden: ${data.orden.id}\nTotal: $${data.orden.total}`);
            limpiarYRedirigir();
        }
    } 
    catch (err) 
    {
        console.error('Error al crear la orden:', err);

        botonEnviar.disabled = false;
        botonEnviar.innerHTML = textoOriginal;

        if (typeof Swal === 'function') 
            {
                Swal.fire
                ({
                    title: 'Error',
                    icon: 'error',
                    html: `
                        <p><strong>No se pudo procesar tu compra.</strong></p>
                        <p style="font-size: 0.9rem; margin-top: 1rem;">${err.message}</p>
                        <p style="font-size: 0.85rem; color: #999;">
                        Verifica que el servidor Flask esté corriendo en <code>http://localhost:5000</code>
                        </p>
                    `,
                    confirmButtonText: 'Reintentar',
                    confirmButtonColor: '#871810'
                });
            } 
            else 
            {
                alert(`Error al procesar la compra:\n${err.message}\n\nVerifica que el servidor Flask esté corriendo.`);
            }
    }
    });

}

function limpiarYRedirigir() {
  // Limpiar carrito
    productosEnCarrito = [];
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

  // Redirigir a carrito (o a index)
    setTimeout(() => {
        window.location.href = './carrito.html';
    }, 2000);
}

/* ============ MODAL PARA IMAGEN AMPLIADA ============ */

const imagenModal = document.querySelector('#imagen-modal');
const imagenModalImg = document.querySelector('#imagen-modal-img');
const imagenModalClose = document.querySelector('.imagen-modal-close');

// Función para abrir modal
function abrirModalImagen(src) {
    if (imagenModal && imagenModalImg) {
        imagenModalImg.src = src;
        imagenModal.classList.add('active');
        resetearPosicionImagen();
    }
}

// Función para cerrar modal
function cerrarModalImagen() {
    if (imagenModal) {
        imagenModal.classList.remove('active');
    }
}

// Cerrar modal al hacer click en la X
if (imagenModalClose) {
    imagenModalClose.addEventListener('click', cerrarModalImagen);
}

// Cerrar modal al hacer click fuera de la imagen
if (imagenModal) {
    imagenModal.addEventListener('click', (e) => {
        if (e.target === imagenModal) {
            cerrarModalImagen();
        }
    });
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModalImagen();
    }
});

// Agregar evento click a las imágenes después de cargarlas
function agregarEventosAImagenes() {
    const imagenes = document.querySelectorAll('.pagos-imagen-item img');
    imagenes.forEach(img => {
        img.addEventListener('click', () => {
            abrirModalImagen(img.src);
        });
        img.style.cursor = 'pointer';
    });
}

/* ============ FUNCIONALIDAD DE ZOOM CON RUEDA DEL MOUSE ============ */

let zoomLevel = 1; // Nivel de zoom inicial
let offsetX = 0;   // Desplazamiento X
let offsetY = 0;   // Desplazamiento Y
let isDragging = false;
let startX = 0;
let startY = 0;

const MIN_ZOOM = 1;      // Zoom mínimo (imagen normal)
const MAX_ZOOM = 3;      // Zoom máximo (3x)
const ZOOM_SPEED = 0.2;  // Velocidad de zoom

function resetearPosicionImagen() {
    if (imagenModalImg) {
        zoomLevel = 1;
        offsetX = 0;
        offsetY = 0;
        imagenModalImg.style.transform = `scale(1) translate(0, 0)`;
    }
}

function actualizarTransform() {
    if (imagenModalImg) {
        imagenModalImg.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
    }
}

function limitarDesplazamiento() {
    // Calcular el rango de desplazamiento permitido
    const maxOffset = (zoomLevel - 1) * 50;
    offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
    offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));
}

if (imagenModalImg && imagenModal) {
    // Zoom con rueda del mouse
    imagenModal.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (!imagenModal.classList.contains('active')) return;

        // Determinar dirección del scroll
        const zoomDirection = e.deltaY > 0 ? -1 : 1;
        const newZoom = zoomLevel + (zoomDirection * ZOOM_SPEED);

        // Limitar zoom
        if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
            zoomLevel = newZoom;
        }

        limitarDesplazamiento();
        actualizarTransform();
    }, { passive: false });

    // Arrastrar para desplazar cuando está zoomed
    imagenModalImg.addEventListener('mousedown', (e) => {
        if (!imagenModal.classList.contains('active')) return;
        
        // Solo permitir arrastrar si está zoomed
        if (zoomLevel === 1) return;
        
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        imagenModalImg.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !imagenModal.classList.contains('active')) return;

        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;

        limitarDesplazamiento();
        actualizarTransform();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            imagenModalImg.style.cursor = 'move';
        }
    });

    // Resetear al cerrar modal
    imagenModal.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}
