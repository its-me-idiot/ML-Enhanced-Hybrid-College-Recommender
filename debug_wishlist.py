import sqlite3

def check_wishlist():
    # Adjust the path if your instance folder is elsewhere
    db_path = 'instance/college_recommender.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("--- Checking Wishlist Table Contents ---")
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='wishlist';")
        if not cursor.fetchone():
            print("Error: 'wishlist' table does not exist!")
            return

        # Fetch all rows
        cursor.execute("SELECT * FROM wishlist;")
        rows = cursor.fetchall()
        
        # Fetch column names
        column_names = [description[0] for description in cursor.description]
        print(f"Columns: {column_names}")
        
        if not rows:
            print("The wishlist table is empty.")
        else:
            for row in rows:
                print(f"Row: {row}")
                
        conn.close()
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    check_wishlist()