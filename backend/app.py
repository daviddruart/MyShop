from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

# Inicializar la app Flask
app = Flask(__name__)

# Configuración
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myshop.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'

# Inicializar la BD
db = SQLAlchemy(app)

# Habilitar CORS para que el frontend pueda consumir la API
CORS(app, origins=["http://localhost:8000", "http://localhost:5000", "http://127.0.0.1:8000", "http://127.0.0.1:5000"])

# ============ MODELOS ============

class Producto(db.Model):
    __tablename__ = 'productos'
    
    id = db.Column(db.String(50), primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    imagen = db.Column(db.String(255), nullable=False)
    categoria_nombre = db.Column(db.String(50), nullable=False)
    categoria_id = db.Column(db.String(50), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'imagen': self.imagen,
            'categoria': {
                'nombre': self.categoria_nombre,
                'id': self.categoria_id
            },
            'precio': self.precio
        }


class Orden(db.Model):
    __tablename__ = 'ordenes'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_nombre = db.Column(db.String(255), nullable=False)
    cliente_email = db.Column(db.String(255), nullable=False)
    total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), default='pendiente')
    fecha_creacion = db.Column(db.DateTime, default=db.func.now())
    
    detalles = db.relationship('DetalleOrden', backref='orden', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'cliente_nombre': self.cliente_nombre,
            'cliente_email': self.cliente_email,
            'total': self.total,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'detalles': [detalle.to_dict() for detalle in self.detalles]
        }


class DetalleOrden(db.Model):
    __tablename__ = 'detalles_ordenes'
    
    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'), nullable=False)
    producto_id = db.Column(db.String(50), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'cantidad': self.cantidad,
            'precio_unitario': self.precio_unitario,
            'subtotal': self.cantidad * self.precio_unitario
        }


# ============ RUTAS ============

@app.route('/', methods=['GET'])
def index():
    return jsonify({'mensaje': 'Bienvenido a la API de MyShop (Artelleria)'}), 200


@app.route('/api/productos', methods=['GET'])
def get_productos():
    """Obtiene todos los productos o filtra por categoría si se pasa ?categoria="""
    categoria = request.args.get('categoria')
    
    if categoria:
        productos = Producto.query.filter_by(categoria_id=categoria).all()
    else:
        productos = Producto.query.all()
    
    return jsonify([p.to_dict() for p in productos]), 200


@app.route('/api/productos/<producto_id>', methods=['GET'])
def get_producto(producto_id):
    """Obtiene un producto específico por ID"""
    producto = Producto.query.get(producto_id)
    
    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404
    
    return jsonify(producto.to_dict()), 200


@app.route('/api/ordenes', methods=['POST'])
def crear_orden():
    """Crea una nueva orden con los productos del carrito"""
    data = request.get_json()
    
    if not data or 'cliente_nombre' not in data or 'cliente_email' not in data or 'productos' not in data:
        return jsonify({'error': 'Datos incompletos'}), 400
    
    try:
        total = 0
        detalles = []
        
        for item in data['productos']:
            producto = Producto.query.get(item['id'])
            if not producto:
                return jsonify({'error': f'Producto {item["id"]} no encontrado'}), 404
            
            cantidad = item.get('cantidad', 1)
            subtotal = producto.precio * cantidad
            total += subtotal
            
            detalles.append({
                'producto_id': producto.id,
                'cantidad': cantidad,
                'precio_unitario': producto.precio
            })
        
        nueva_orden = Orden(
            cliente_nombre=data['cliente_nombre'],
            cliente_email=data['cliente_email'],
            total=total
        )
        
        db.session.add(nueva_orden)
        db.session.flush()  # Para obtener el ID generado
        
        for detalle_data in detalles:
            detalle = DetalleOrden(**detalle_data, orden_id=nueva_orden.id)
            db.session.add(detalle)
        
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Orden creada exitosamente',
            'orden': nueva_orden.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/ordenes/<int:orden_id>', methods=['GET'])
def get_orden(orden_id):
    """Obtiene una orden específica por ID"""
    orden = Orden.query.get(orden_id)
    
    if not orden:
        return jsonify({'error': 'Orden no encontrada'}), 404
    
    return jsonify(orden.to_dict()), 200


@app.route('/api/ordenes', methods=['GET'])
def get_ordenes():
    """Obtiene todas las órdenes (útil para administración)"""
    ordenes = Orden.query.all()
    return jsonify([o.to_dict() for o in ordenes]), 200


@app.errorhandler(404)
def no_encontrado(error):
    return jsonify({'error': 'Ruta no encontrada'}), 404


@app.errorhandler(500)
def error_interno(error):
    return jsonify({'error': 'Error interno del servidor'}), 500


# ============ INICIALIZACIÓN ============

if __name__ == '__main__':
    with app.app_context():
        # Crear las tablas si no existen
        db.create_all()
        
        # Cargar productos desde el JSON del frontend (opcional)
        # Puedes descomentar esta sección si quieres pre-llenar la BD
        # load_productos_iniciales()
    
    # Ejecutar la app en modo desarrollo
    app.run(debug=True, port=5000)
