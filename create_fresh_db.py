# create_fresh_db.py - Create fresh database with correct schema

import sqlite3
import os
from datetime import datetime

def create_fresh_database(db_path='instance/college_recommender.db', backup_old=True):
    """Create a fresh database with the correct schema"""
    
    # Backup old database if it exists
    if os.path.exists(db_path):
        if backup_old:
            backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            print(f"📦 Backing up existing database to: {backup_path}")
            os.rename(db_path, backup_path)
        else:
            print(f"🗑️  Deleting existing database: {db_path}")
            os.remove(db_path)
    
    print(f"\n🔨 Creating fresh database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("CREATING DATABASE SCHEMA")
    print("=" * 80)
    
    # ========================================================================
    # TABLE 1: users
    # ========================================================================
    print("\n📋 Creating table: users")
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(120) NOT NULL UNIQUE,
            password_hash VARCHAR(256) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(15),
            city VARCHAR(50),
            state VARCHAR(50),
            preferred_branch VARCHAR(100),
            max_budget REAL,
            min_rating_preference REAL DEFAULT 0.0,
            is_active INTEGER DEFAULT 1,
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """)
    
    # Create index on email
    cursor.execute("CREATE UNIQUE INDEX idx_users_email ON users(email)")
    print("   ✅ Table 'users' created with 14 columns")
    print("   ✅ Index created on email")
    
    # ========================================================================
    # TABLE 2: wishlist
    # ========================================================================
    print("\n📋 Creating table: wishlist")
    cursor.execute("""
        CREATE TABLE wishlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            college_name VARCHAR(200) NOT NULL,
            branch VARCHAR(100) NOT NULL,
            city VARCHAR(50),
            state VARCHAR(50),
            college_type VARCHAR(50),
            average_fees REAL,
            rating REAL,
            facilities TEXT,
            university VARCHAR(200),
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_id, college_name, branch)
        )
    """)
    
    # Create index on user_id
    cursor.execute("CREATE INDEX idx_wishlist_user_id ON wishlist(user_id)")
    print("   ✅ Table 'wishlist' created with 13 columns")
    print("   ✅ Index created on user_id")
    print("   ✅ Unique constraint on (user_id, college_name, branch)")
    
    # ========================================================================
    # TABLE 3: college_ratings
    # ========================================================================
    print("\n📋 Creating table: college_ratings")
    cursor.execute("""
        CREATE TABLE college_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            college_name VARCHAR(200) NOT NULL,
            rating REAL NOT NULL,
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_id, college_name),
            CHECK (rating >= 1.0 AND rating <= 5.0)
        )
    """)
    
    # Create index on user_id
    cursor.execute("CREATE INDEX idx_college_ratings_user_id ON college_ratings(user_id)")
    print("   ✅ Table 'college_ratings' created with 6 columns")
    print("   ✅ Index created on user_id")
    print("   ✅ Unique constraint on (user_id, college_name)")
    print("   ✅ Check constraint on rating (1.0-5.0)")
    
    # Commit changes
    conn.commit()
    
    # Verify creation
    print("\n" + "=" * 80)
    print("VERIFYING DATABASE CREATION")
    print("=" * 80)
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    print(f"\n✅ Tables created: {[t[0] for t in tables]}")
    
    # Display table info
    for table_name in ['users', 'wishlist', 'college_ratings']:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print(f"\n📋 {table_name}: {len(columns)} columns")
        for col in columns:
            print(f"   {col[0]:2}. {col[1]:<30} {col[2]:<15}")
    
    conn.close()
    
    print("\n" + "=" * 80)
    print("✅ DATABASE CREATED SUCCESSFULLY")
    print("=" * 80)
    print(f"\n📍 Database location: {os.path.abspath(db_path)}")
    print("\n🎯 Next steps:")
    print("   1. Run: python app.py")
    print("   2. Navigate to: http://localhost:3000")
    print("   3. Register a new user")
    print("   4. Test login functionality")
    print("=" * 80)

if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    backup = True
    if len(sys.argv) > 1 and sys.argv[1] == '--no-backup':
        backup = False
    
    # FIXED: Explicitly force the target directory path right inside the execution call
    create_fresh_database(db_path='instance/college_recommender.db', backup_old=backup)
