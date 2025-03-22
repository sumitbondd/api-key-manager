import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    # Ensure instance folder exists and use absolute path
    instance_path = os.path.join(basedir, 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
    
    # Set database path
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(instance_path, 'apikeys.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False