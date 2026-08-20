# MyShop Backend - Flask API

Sistema de backend para la tienda en línea "Artelleria" construido con Flask y SQLAlchemy.

## Requisitos

- Python 3.8+
- pip

## Instalación

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
pip install -r requirements.txt
```

## Configuración

No se requiere configuración especial. La app usa SQLite por defecto (archivo `myshop.db`).

## Ejecución

### 1. Cargar productos iniciales (primera vez)

Desde la carpeta `backend/`:
```bash
python load_productos.py
```

Esto leerá los productos desde `../js/productos.json` y los insertará en la BD.

### 2. Iniciar el servidor Flask

Desde la carpeta `backend/`:
```bash
python app.py
```

La API estará disponible en: **http://localhost:5000**

## Endpoints de la API

### Productos

- **GET** `/api/productos` — Lista todos los productos
- **GET** `/api/productos?categoria=cuadros` — Filtra productos por categoría
- **GET** `/api/productos/<id>` — Obtiene un producto específico

**Ejemplo:**
```bash
curl http://localhost:5000/api/productos
curl http://localhost:5000/api/productos?categoria=cuadros
curl http://localhost:5000/api/productos/cuadro-01
```

### Órdenes

- **POST** `/api/ordenes` — Crear una nueva orden
- **GET** `/api/ordenes` — Listar todas las órdenes
- **GET** `/api/ordenes/<id>` — Obtener una orden específica

**Ejemplo (crear orden):**
```bash
curl -X POST http://localhost:5000/api/ordenes \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Juan Pérez",
    "cliente_email": "juan@example.com",
    "productos": [
      {"id": "cuadro-01", "cantidad": 1},
      {"id": "escultura-01", "cantidad": 2}
    ]
  }'
```

## Estructura de la Base de Datos

### Tabla: productos
- `id` (string, PK)
- `titulo`
- `imagen`
- `categoria_nombre`
- `categoria_id`
- `precio` (float)

### Tabla: ordenes
- `id` (int, PK auto)
- `cliente_nombre`
- `cliente_email`
- `total` (float)
- `estado` (default: 'pendiente')
- `fecha_creacion` (timestamp)

### Tabla: detalles_ordenes
- `id` (int, PK auto)
- `orden_id` (FK a ordenes)
- `producto_id` (string)
- `cantidad`
- `precio_unitario`

## CORS

La API está configurada para aceptar solicitudes desde:
- `http://localhost:8000` (servidor del frontend)
- `http://localhost:5000`
- `http://127.0.0.1:8000`
- `http://127.0.0.1:5000`

Puedes ajustar esto en `app.py` en la línea `CORS(app, origins=[...])`.

## Notas

- La base de datos se crea automáticamente al iniciar la app.
- Para reiniciar la BD, basta con eliminar el archivo `myshop.db`.
- El servidor está en modo debug por defecto. Cambia `debug=True` a `debug=False` en producción.
- En producción, utiliza un servidor WSGI como Gunicorn: `gunicorn app:app`.

## Integración con Frontend

La portada activa (`HTML/index.html`) y la ficha de producto (`producto.html`) consumen esta API y usan `js/productos.json` como respaldo local. El carrito y los pagos mantienen su flujo en `js/carrito.js` y `js/pagos.js`.
