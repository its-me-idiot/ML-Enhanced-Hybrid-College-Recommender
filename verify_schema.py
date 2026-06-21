# verify_schema.py - Verify existing database schema

import sqlite3
import os

def verify_database_schema(db_path='instance/college_recommender.db'):
    """Verify the database schema matches expected structure"""
    
    if not os.path.exists(db_path):
        print(f"❌ Database file '{db_path}' does not exist")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("=" * 80)
    print(f"VERIFYING DATABASE: {db_path}")
    print("=" * 80)
    
    # Expected schema
    expected_tables = {
        'users': [
            'id', 'email', 'password_hash', 'full_name', 'phone', 
            'city', 'state', 'preferred_branch', 'max_budget', 
            'min_rating_preference', 'is_active', 'is_admin', 
            'created_at', 'last_login'
        ],
        'wishlist': [
            'id', 'user_id', 'college_name', 'branch', 'city', 
            'state', 'college_type', 'average_fees', 'rating', 
            'facilities', 'university', 'added_at', 'notes'
        ],
        'college_ratings': [
            'id', 'user_id', 'college_name', 'rating', 'review', 'created_at'
        ]
    }
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    actual_tables = [row[0] for row in cursor.fetchall()]
    
    print(f"\n📋 Tables found: {actual_tables}")
    
    all_correct = True
    
    for table_name, expected_columns in expected_tables.items():
        print(f"\n{'=' * 80}")
        print(f"TABLE: {table_name}")
        print('=' * 80)
        
        if table_name not in actual_tables:
            print(f"❌ Table '{table_name}' is MISSING")
            all_correct = False
            continue
        
        # Get table info
        cursor.execute(f"PRAGMA table_info({table_name})")
        table_info = cursor.fetchall()
        actual_columns = [col[1] for col in table_info]
        
        print(f"\n Expected columns: {len(expected_columns)}")
        print(f" Actual columns:   {len(actual_columns)}")
        
        # Check for missing columns
        missing_columns = set(expected_columns) - set(actual_columns)
        if missing_columns:
            print(f"\n❌ MISSING COLUMNS: {missing_columns}")
            all_correct = False
        
        # Check for extra columns
        extra_columns = set(actual_columns) - set(expected_columns)
        if extra_columns:
            print(f"\n⚠️  EXTRA COLUMNS: {extra_columns}")
        
        # Display column details
        print(f"\n{'#':<4} {'Column Name':<30} {'Type':<15} {'NotNull':<10} {'Default':<15} {'PK':<5}")
        print('-' * 80)
        for col in table_info:
            cid, name, dtype, notnull, default_val, pk = col
            status = "✅" if name in expected_columns else "⚠️"
            print(f"{status} {cid:<2} {name:<30} {dtype:<15} {bool(notnull)!s:<10} {str(default_val):<15} {bool(pk)!s:<5}")
    
    conn.close()
    
    print(f"\n{'=' * 80}")
    if all_correct:
        print("✅ DATABASE SCHEMA IS CORRECT")
    else:
        print("❌ DATABASE SCHEMA HAS ISSUES - NEEDS RECREATION")
    print('=' * 80)
    
    return all_correct

if __name__ == "__main__":
    verify_database_schema()
