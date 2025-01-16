from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Patient, Doctor, Appointment, bcrypt
from marshmallow import Schema, fields, validate
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///medease.db')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_jwt_secret')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, resources={r"/*": {"origins": "*"}})
jwt = JWTManager(app)
db.init_app(app)

# Add a root route
@app.route('/')
def index():
    return jsonify({"message": "MedEase Backend is running"}), 200

# Schemas for Validation
class AppointmentSchema(Schema):
    patient_id = fields.Integer(required=True)
    doctor_id = fields.Integer(required=True)
    date = fields.DateTime(required=True)
    status = fields.String(validate=validate.OneOf(['Scheduled', 'Completed', 'Cancelled']))

# Authentication Routes
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401

# Appointment Routes
@app.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    appointments = Appointment.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'appointments': [
            {
                'id': a.id,
                'patient': a.patient.name,
                'doctor': a.doctor.name,
                'date': a.date.isoformat(),
                'status': a.status
            } for a in appointments.items
        ],
        'total_pages': appointments.pages,
        'current_page': page
    })

@app.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    schema = AppointmentSchema()
    try:
        data = schema.load(request.json)
        
        new_appointment = Appointment(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            date=data['date'],
            status=data.get('status', 'Scheduled')
        )
        
        db.session.add(new_appointment)
        db.session.commit()
        
        return jsonify({"message": "Appointment created successfully"}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/appointments/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    
    if request.method == 'PUT':
        appointment.status = request.json.get('status', appointment.status)
        db.session.commit()
        return jsonify({"message": "Appointment updated"})
    
    elif request.method == 'DELETE':
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"message": "Appointment cancelled"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)