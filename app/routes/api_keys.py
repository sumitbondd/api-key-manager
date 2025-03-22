from flask import Blueprint, jsonify
from app.models import APIKey
from app import db
from app.utils.decorators import token_required
import secrets

bp = Blueprint('api_keys', __name__, url_prefix='/api')

@bp.route('/generate-key', methods=['POST'])
@token_required
def generate_api_key(current_user):
    try:
        api_key = secrets.token_urlsafe(32)
        new_key = APIKey(key=api_key, user_id=current_user.id)
        
        db.session.add(new_key)
        db.session.commit()
        
        return jsonify({'api_key': api_key})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error generating API key: {str(e)}'}), 500
    finally:
        db.session.close()

@bp.route('/keys', methods=['GET'])
@token_required
def list_api_keys(current_user):
    try:
        keys = APIKey.query.filter_by(user_id=current_user.id, is_active=True).all()
        return jsonify({
            'api_keys': [
                {
                    'key': key.key,
                    'created_at': key.created_at.isoformat(),
                    'is_active': key.is_active
                } for key in keys
            ]
        })
    except Exception as e:
        return jsonify({'message': 'Error listing API keys'}), 500
    finally:
        db.session.close()

@bp.route('/revoke/<key>', methods=['POST'])
@token_required
def revoke_api_key(current_user, key):
    try:
        api_key = APIKey.query.filter_by(key=key, user_id=current_user.id).first()
        
        if not api_key:
            return jsonify({'message': 'API key not found'}), 404
        
        api_key.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'API key revoked successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error revoking API key'}), 500
    finally:
        db.session.close()