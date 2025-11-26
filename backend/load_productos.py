"""
Script para cargar productos iniciales desde el JSON del frontend
a la base de datos SQLite.

Uso: python load_productos.py
"""

import json
import os
import sys

# Agregar la carpeta backend al path
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db, Producto


def load_productos_iniciales():
    """Carga productos desde el archivo productos.json del frontend"""
    
    # Ruta al archivo JSON del frontend
    json_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'productos.json')
    
    if not os.path.exists(json_path):
        print(f"Error: archivo {json_path} no encontrado")
        return False
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            productos_data = json.load(f)
        
        with app.app_context():
            # Limpiar productos existentes (opcional)
            # Producto.query.delete()
            # db.session.commit()
            
            for prod_data in productos_data:
                # Verificar si el producto ya existe
                existe = Producto.query.get(prod_data['id'])
                
                if not existe:
                    producto = Producto(
                        id=prod_data['id'],
                        titulo=prod_data['titulo'],
                        imagen=prod_data['imagen'],
                        categoria_nombre=prod_data['categoria']['nombre'],
                        categoria_id=prod_data['categoria']['id'],
                        precio=prod_data['precio']
                    )
                    db.session.add(producto)
            
            db.session.commit()
            print(f"✓ Cargados {len(productos_data)} productos exitosamente")
            return True
    
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON: {e}")
        return False
    except Exception as e:
        print(f"Error al cargar productos: {e}")
        db.session.rollback()
        return False


if __name__ == '__main__':
    print("Cargando productos desde productos.json...")
    load_productos_iniciales()
