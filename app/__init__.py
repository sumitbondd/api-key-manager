from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)
    
    # Ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)
    
    db.init_app(app)
    
    from app.routes import auth, api_keys, home
    app.register_blueprint(auth.bp)
    app.register_blueprint(api_keys.bp)
    app.register_blueprint(home.bp)
    
    with app.app_context():
        db.create_all()
    
    return app