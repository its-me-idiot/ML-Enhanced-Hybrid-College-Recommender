# app_enhanced.py - COMPLETE MERGED SYSTEM
# Authentication + Database + ML Recommendations

import os
import pandas as pd
import logging
from datetime import datetime
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import re

# Import our enhanced ML recommender
from hybrid_recommender_enhanced import EnhancedHybridRecommender

# ============================================================================
# LOGGING SETUP
# ============================================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

# ============================================================================
# DATA PATHS
# ============================================================================
DATA_DIR = "data"
COLLEGES_PATH = os.path.join(DATA_DIR, "cutoff_final.csv")
COLLEGE_SPECIFIC_PATH = os.path.join(DATA_DIR, "college_specific_final99.csv")
RATINGS_PATH = os.path.join(DATA_DIR, "ratings.csv")

# ============================================================================
# DATA LOADING
# ============================================================================
def load_data_safely():
    """Load and merge college data with intelligent column handling"""
    logger.info("🔄 Loading college data...")
    
    try:
        cutoff_df = pd.read_csv(COLLEGES_PATH)
        logger.info(f"✅ Cutoff data: {len(cutoff_df)} rows")
        
        specific_df = pd.read_csv(COLLEGE_SPECIFIC_PATH)
        logger.info(f"✅ Specific data: {len(specific_df)} rows")
        
        # Smart merge - use suffixes to track source
        merged = pd.merge(
            cutoff_df,
            specific_df,
            on='College Name',
            how='left',
            suffixes=('_cutoff', '_specific')
        )
        
        logger.info(f"✅ After merge: {len(merged)} rows")
        
        # Intelligently combine duplicate columns - prefer specific, fallback to cutoff
        columns_to_merge = [
            'Rating', 'Average Fees', 'College Type', 'University', 'Facilities',
            'Total Faculty', 'Total Student Enrollments', 'Campus Size', 
            'Genders Accepted', 'Established Year', 'City', 'State', 'Country'
        ]
        
        for col in columns_to_merge:
            cutoff_col = f'{col}_cutoff'
            specific_col = f'{col}_specific'
            
            # If both exist after merge, combine them
            if cutoff_col in merged.columns and specific_col in merged.columns:
                # Use specific data first, fallback to cutoff data
                merged[col] = merged[specific_col].combine_first(merged[cutoff_col])
                # Drop the suffixed columns
                merged = merged.drop(columns=[cutoff_col, specific_col])
                logger.info(f"   ✅ Combined {col}: {merged[col].notna().sum()} values")
            elif cutoff_col in merged.columns:
                # Only cutoff exists, rename it
                merged[col] = merged[cutoff_col]
                merged = merged.drop(columns=[cutoff_col])
            elif specific_col in merged.columns:
                # Only specific exists, rename it
                merged[col] = merged[specific_col]
                merged = merged.drop(columns=[specific_col])
        
        # Clean and validate data types
        logger.info("🧹 Cleaning data types...")
        
       # Rating: Convert to numeric with intelligent defaults
        merged['Rating'] = pd.to_numeric(merged['Rating'], errors='coerce')
        rating_before = merged['Rating'].notna().sum()

        # Calculate city and branch averages for better defaults
        logger.info(f"   📊 Calculating intelligent rating defaults...")
        city_avg_rating = merged.groupby('City')['Rating'].transform('mean')
        branch_avg_rating = merged.groupby('branch')['Rating'].transform('mean')
        overall_avg = merged['Rating'].mean()

        # Fill missing ratings: city avg → branch avg → overall avg → 3.0
        merged['Rating'] = (merged['Rating']
                        .fillna(city_avg_rating)
                        .fillna(branch_avg_rating)
                        .fillna(overall_avg)
                        .fillna(3.0))

        logger.info(f"   Rating: {rating_before} original, filled {len(merged) - rating_before} missing")
        logger.info(f"      - With city average: {(merged['Rating'] == city_avg_rating).sum()}")
        logger.info(f"      - With branch average: {(merged['Rating'] == branch_avg_rating).sum()}")
        logger.info(f"      - Rating distribution: min={merged['Rating'].min():.2f}, mean={merged['Rating'].mean():.2f}, max={merged['Rating'].max():.2f}")
        logger.info(f"      - Colleges with rating ≥4.0: {(merged['Rating'] >= 4.0).sum()}")
        logger.info(f"      - Colleges with rating ≥3.5: {(merged['Rating'] >= 3.5).sum()}")
        logger.info(f"      - Colleges with rating ≥3.0: {(merged['Rating'] >= 3.0).sum()}")

        # Average Fees: Convert to numeric, keep actual values, default to 150000
        merged['Average Fees'] = pd.to_numeric(merged['Average Fees'], errors='coerce')
        fees_before = merged['Average Fees'].notna().sum()
        merged['Average Fees'] = merged['Average Fees'].fillna(150000)
        logger.info(f"   Fees: {fees_before} original, filled {len(merged) - fees_before} missing with 150000")
        
        # College Type: Default to 'Engineering College'
        if 'College Type' not in merged.columns:
            merged['College Type'] = 'Engineering College'
        else:
            merged['College Type'] = merged['College Type'].fillna('Engineering College')
        
        # University: Default to 'Autonomous'
        if 'University' not in merged.columns:
            merged['University'] = 'Autonomous'
        else:
            merged['University'] = merged['University'].fillna('Autonomous')
        
        # Facilities: Default description
        if 'Facilities' not in merged.columns:
            merged['Facilities'] = 'Standard facilities'
        else:
            merged['Facilities'] = merged['Facilities'].fillna('Standard facilities')
        
        # Total Faculty: Numeric, default 80
        if 'Total Faculty' not in merged.columns:
            merged['Total Faculty'] = 80
        else:
            merged['Total Faculty'] = pd.to_numeric(merged['Total Faculty'], errors='coerce').fillna(80)
        
        # Total Student Enrollments: Numeric, default 800
        if 'Total Student Enrollments' not in merged.columns:
            merged['Total Student Enrollments'] = 800
        else:
            merged['Total Student Enrollments'] = pd.to_numeric(merged['Total Student Enrollments'], errors='coerce').fillna(800)
        
        # Campus Size: Keep as string
        if 'Campus Size' not in merged.columns:
            merged['Campus Size'] = 'Medium'
        else:
            merged['Campus Size'] = merged['Campus Size'].fillna('Medium')
        
        # Genders Accepted: Keep as string
        if 'Genders Accepted' not in merged.columns:
            merged['Genders Accepted'] = 'Co-Ed'
        else:
            merged['Genders Accepted'] = merged['Genders Accepted'].fillna('Co-Ed')
        
        # Established Year: Numeric, default 2000
        if 'Established Year' not in merged.columns:
            merged['Established Year'] = 2000
        else:
            merged['Established Year'] = pd.to_numeric(merged['Established Year'], errors='coerce').fillna(2000)
        
        logger.info(f"✅ Loaded {len(merged)} colleges with complete data")
        logger.info(f"   📊 Data quality summary:")
        logger.info(f"      - Colleges with real ratings: {(merged['Rating'] != 3.0).sum()}")
        logger.info(f"      - Colleges with real fees: {(merged['Average Fees'] != 150000).sum()}")
        logger.info(f"      - Colleges with facilities: {(merged['Facilities'] != 'Standard facilities').sum()}")
        
        return merged
        
    except Exception as e:
        logger.error(f"❌ Data loading failed: {e}")
        import traceback
        traceback.print_exc()
        raise


# Load data globally
college_data = load_data_safely()

# ============================================================================
# FLASK APP INITIALIZATION
# ============================================================================
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///collegerecommender.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ============================================================================
# DATABASE & LOGIN MANAGER
# ============================================================================
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
logger.info("🔧 Configuring CORS...")
CORS(
    app,
    origins=["http://localhost:3000"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# ============================================================================
# OPTIONS PREFLIGHT HANDLER
# ============================================================================
@app.before_request
def handle_preflight():
    """Handle OPTIONS preflight requests for all routes"""
    if request.method == "OPTIONS":
        response = make_response("", 200)
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

# ============================================================================
# DATABASE MODELS
# ============================================================================
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    preferred_branch = db.Column(db.String(100))
    max_budget = db.Column(db.Float)
    min_rating_preference = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'city': self.city,
            'state': self.state,
            'preferred_branch': self.preferred_branch,
            'max_budget': self.max_budget,
            'min_rating_preference': self.min_rating_preference,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Wishlist(db.Model):
    __tablename__ = 'wishlist'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    college_name = db.Column(db.String(500), nullable=False)
    branch = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    average_fees = db.Column(db.Float)
    rating = db.Column(db.Float)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

class CollegeRating(db.Model):
    __tablename__ = 'college_ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    college_name = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ============================================================================
# CREATE DATABASE TABLES
# ============================================================================
with app.app_context():
    try:
        db.create_all()
        logger.info("✅ Database tables created successfully")
        
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        logger.info(f"📋 Database tables: {tables}")
        
    except Exception as e:
        logger.error(f"❌ Database creation failed: {e}")
        raise

# ============================================================================
# INITIALIZE ML RECOMMENDER
# ============================================================================
logger.info("🚀 Initializing ML Recommender System...")

# Ensure ratings file exists
if not os.path.exists(RATINGS_PATH):
    logger.info("⚠️  No ratings.csv found - creating empty file")
    pd.DataFrame(columns=['user_id', 'college_name', 'rating']).to_csv(RATINGS_PATH, index=False)

# Initialize recommender
try:
    ml_recommender = EnhancedHybridRecommender(
        college_data=college_data,
        ratings_path=RATINGS_PATH,
        alpha=0.6  # 60% Collaborative, 40% Content
    )
    logger.info("✅ ML Recommender initialized successfully!")
except Exception as e:
    logger.error(f"❌ ML Recommender initialization failed: {e}")
    ml_recommender = None

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    """User registration endpoint"""
    logger.info(f"📝 Registration request: {request.method} from {request.remote_addr}")
    
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        full_name = data['full_name'].strip()
        
        logger.info(f"📝 Attempting registration for: {email}")
        
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        user = User(
            email=email,
            full_name=full_name,
            phone=data.get('phone'),
            city=data.get('city'),
            state=data.get('state'),
            preferred_branch=data.get('preferred_branch'),
            max_budget=data.get('max_budget'),
            min_rating_preference=data.get('min_rating_preference', 0.0)
        )
        
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"✅ User registered successfully: {email}")
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Registration error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    """User login endpoint"""
    logger.info(f"🔐 Login request: {request.method} from {request.remote_addr}")
    
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403
            
            login_user(user, remember=True)
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"✅ User logged in successfully: {email}")
            
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
            
    except Exception as e:
        logger.error(f"❌ Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    """User logout endpoint"""
    email = current_user.email
    logout_user()
    logger.info(f"👋 User logged out: {email}")
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route("/api/profile", methods=["GET"])
@login_required
def get_profile():
    """Get current user profile"""
    return jsonify(current_user.to_dict()), 200

# ============================================================================
# ML-POWERED SEARCH & RECOMMENDATIONS
# ============================================================================

@app.route("/api/enhanced-search", methods=["POST", "OPTIONS"])
def enhanced_search():
    """ML-Enhanced search with collaborative filtering + content-based"""
    logger.info(f"🔍 Enhanced search request from {request.remote_addr}")
    
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        # Get request data
        if request.is_json:
            data = request.get_json()
        elif request.form:
            data = request.form.to_dict()
        else:
            data = {}
        
        # Extract preferences
        preferences = {
            'branch': data.get('branch', ''),
            'city': data.get('city', ''),
            'state': data.get('state', ''),
            'max_fees': float(data.get('max_fees', 999999999)),
            'min_rating': float(data.get('min_rating', 0))
        }
        
        limit = int(data.get('limit', 50))
        
        logger.info(f"📊 Search preferences: {preferences}")
        
        # Get user ID if logged in
        user_id = current_user.id if current_user.is_authenticated else None
        
        # Use ML recommender if available
        if ml_recommender:
            logger.info(f"🤖 Using ML Recommender (user_id: {user_id})")
            recommendations = ml_recommender.recommend(user_id, preferences, limit)
            
            # Add wishlist status for logged-in users
            if user_id:
                wishlist_colleges = {w.college_name for w in Wishlist.query.filter_by(user_id=user_id).all()}
                for rec in recommendations:
                    rec['in_wishlist'] = rec['College Name'] in wishlist_colleges
            
            response = {
                'success': True,
                'total_results': len(recommendations),
                'recommendations': recommendations,
                'ml_enabled': True,
                'recommendation_type': recommendations[0]['recommendation_type'] if recommendations else 'none',
                'user_authenticated': current_user.is_authenticated
            }
            
        else:
            # Fallback to simple filtering
            logger.warning("⚠️  ML Recommender not available - using fallback")
            response = _fallback_search(preferences, limit, user_id)
        
        logger.info(f"✅ Returning {response['total_results']} results")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"❌ Search error: {e}", exc_info=True)
        return jsonify({'error': 'Search failed', 'details': str(e)}), 500

def _fallback_search(preferences, limit, user_id):
    """Fallback simple search if ML fails"""
    filtered = college_data.copy()
    
    # Safely detect branch column casing
    branch_col = 'branch' if 'branch' in filtered.columns else 'Branch' if 'Branch' in filtered.columns else None
    
    if preferences.get('branch') and branch_col:
        filtered = filtered[filtered[branch_col].astype(str).str.contains(preferences['branch'], case=False, na=False)]
    if preferences.get('city'):
        filtered = filtered[filtered['City'].astype(str).str.contains(preferences['city'], case=False, na=False)]
    if preferences.get('max_fees') and preferences['max_fees'] < 999999999:
        filtered = filtered[pd.to_numeric(filtered['Average Fees'], errors='coerce') <= preferences['max_fees']]
    if preferences.get('min_rating') and preferences['min_rating'] > 0:
        filtered = filtered[pd.to_numeric(filtered['Rating'], errors='coerce') >= preferences['min_rating']]
    
    filtered = filtered.sort_values('Rating', ascending=False)
    
    # Safe Deduplication handling missing branch columns gracefully
    if branch_col:
        filtered = filtered.drop_duplicates(subset=['College Name', branch_col], keep='first')
    else:
        filtered = filtered.drop_duplicates(subset=['College Name'], keep='first')
        
    filtered = filtered.head(limit)
    
    results = []
    wishlist_colleges = set()
    if user_id:
        wishlist_colleges = {w.college_name for w in Wishlist.query.filter_by(user_id=user_id).all()}
        
    for _, row in filtered.iterrows():
        name = row.get('College Name')
        rec = {
            'college_name': name,
            'city': row.get('City'),
            'state': row.get('State'),
            'branch': row.get(branch_col) if branch_col else 'General',
            'rating': float(row.get('Rating', 0)) if pd.notna(row.get('Rating')) else 0.0,
            'average_fees': float(row.get('Average Fees', 0)) if pd.notna(row.get('Average Fees')) else 0.0,
            'university': row.get('University'),
            'facilities': row.get('Facilities'),
            'total_faculty': int(row.get('Total Faculty', 0)) if pd.notna(row.get('Total Faculty')) else 0,
            'total_students': int(row.get('Total Student Enrollments', 0)) if pd.notna(row.get('Total Student Enrollments')) else 0,
            'ml_score': 0.0,
            'recommendation_type': 'simple_filter',
            'is_in_wishlist': name in wishlist_colleges
        }
        results.append(rec)
    
    return {
        'success': True,
        'total_results': len(results),
        'recommendations': results,
        'ml_enabled': False,
        'recommendation_type': 'simple_filter'
    }

# ============================================================================
# RATING SYSTEM (Feeds ML Algorithm)
# ============================================================================

@app.route("/api/rate-college", methods=["POST"])
@login_required
def rate_college():
    """Rate a college - feeds into ML system"""
    try:
        data = request.get_json()
        college_name = data.get('college_name')
        rating = float(data.get('rating'))
        review = data.get('review', '')
        
        if not college_name or rating < 0 or rating > 5:
            return jsonify({'error': 'Invalid rating data'}), 400
        
        # Save to database
        db_rating = CollegeRating(
            user_id=current_user.id,
            college_name=college_name,
            rating=rating,
            review=review
        )
        db.session.add(db_rating)
        db.session.commit()
        
        # Update ML system
        if ml_recommender:
            ml_recommender.add_rating(current_user.id, college_name, rating)
            logger.info(f"✅ ML system updated with new rating")
        
        logger.info(f"✅ Rating saved: {current_user.email} rated {college_name}: {rating}⭐")
        
        return jsonify({
            'message': 'Rating saved successfully',
            'rating': {
                'college_name': college_name,
                'rating': rating,
                'review': review
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Rating error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to save rating'}), 500

# ============================================================================
# WISHLIST ROUTES
# ============================================================================

@app.route("/api/wishlist", methods=["GET"])
@login_required
def get_wishlist():
    """Get user's wishlist"""
    wishlist = Wishlist.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'wishlist': [{
            'id': w.id,
            'college_name': w.college_name,
            'branch': w.branch,
            'city': w.city,
            'state': w.state,
            'average_fees': w.average_fees,
            'rating': w.rating,
            'added_at': w.added_at.isoformat()
        } for w in wishlist]
    }), 200

@app.route("/api/wishlist/add", methods=["POST"])
@login_required
def add_to_wishlist():
    """Add college to wishlist (Fixed: Returns item payload for React state)"""
    try:
        data = request.get_json()
        
        # Check existing using BOTH college name and branch
        existing = Wishlist.query.filter_by(
            user_id=current_user.id,
            college_name=data.get('college_name'),
            branch=data.get('branch')
        ).first()
        
        if existing:
            return jsonify({'message': 'Already in wishlist'}), 200
        
        wishlist_item = Wishlist(
            user_id=current_user.id,
            college_name=data.get('college_name'),
            branch=data.get('branch', 'General'),
            city=data.get('city'),
            state=data.get('state'),
            average_fees=data.get('average_fees'),
            rating=data.get('rating')
        )
        
        db.session.add(wishlist_item)
        db.session.commit()
        
        # CRITICAL FIX: Return the 'item' object so React can update the UI instantly
        return jsonify({
            'message': 'Added to wishlist',
            'item': {
                'id': wishlist_item.id,
                'college_name': wishlist_item.college_name,
                'branch': wishlist_item.branch,
                'city': wishlist_item.city,
                'state': wishlist_item.state,
                'average_fees': wishlist_item.average_fees,
                'rating': wishlist_item.rating
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Wishlist add error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to add to wishlist'}), 500

@app.route("/api/wishlist/remove/<int:wishlist_id>", methods=["DELETE"])
@login_required
def remove_from_wishlist(wishlist_id):
    """Remove from wishlist"""
    try:
        item = Wishlist.query.filter_by(id=wishlist_id, user_id=current_user.id).first()
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Removed from wishlist'}), 200
        
    except Exception as e:
        logger.error(f"❌ Wishlist remove error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to remove from wishlist'}), 500

# ============================================================================
# UTILITY ROUTES
# ============================================================================

@app.route("/")
def index():
    """System status"""
    return jsonify({
        "status": "✅ ML-Enhanced College Recommendation System",
        "version": "3.0",
        "total_colleges": len(college_data),
        "ml_enabled": ml_recommender is not None,
        "authenticated": current_user.is_authenticated,
        "database_tables": db.inspect(db.engine).get_table_names()
    })

@app.route("/api/all-cities", methods=["GET"])
def get_all_cities():
    """Get list of all cities"""
    cities = sorted(college_data['City'].dropna().unique().tolist())
    return jsonify({'cities': cities})

@app.route("/api/all-branches", methods=["GET"])
def get_all_branches():
    """Get list of all branches"""
    branches = sorted(college_data['branch'].dropna().unique().tolist())
    return jsonify({'branches': branches})

@app.route("/api/all-states", methods=["GET"])
def get_all_states():
    """Get list of all states"""
    states = sorted(college_data['State'].dropna().unique().tolist())
    return jsonify({'states': states})

# ============================================================================
# START SERVER
# ============================================================================

if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("🚀 Starting ML-Enhanced College Recommendation System")
    logger.info(f"✅ College data loaded: {len(college_data)} colleges")
    logger.info(f"🤖 ML Recommender: {'Enabled' if ml_recommender else 'Disabled'}")
    logger.info(f"🌐 CORS configured for: http://localhost:3000")
    logger.info(f"🔧 Debug mode: True")
    logger.info(f"🏠 Server starting on: http://0.0.0.0:5000")
    logger.info("=" * 80)
    
    app.run(host="0.0.0.0", port=5000, debug=True)
