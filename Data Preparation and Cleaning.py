# preprocess.py - FIXED VERSION

import pandas as pd

# Define expected columns in ORIGINAL case (as they appear in CSV)
EXPECTED_COLS = [
    "College Name",
    "City", 
    "State",
    "Branch",
    "College Type",  # Added
    "Average Fees",
    "Rating",
    "Facilities",
    "Genders Accepted",
    "Established Year",
    "Campus Size",
    "Student Count",  # Added
    "Faculty Count"   # Added
]

def load_and_preprocess_colleges(path: str) -> pd.DataFrame:
    """
    Load and preprocess college data from cutoff_final.csv using the given column names.
    """
    df = pd.read_csv(path)
    
    # Clean column names but keep original case
    df.columns = [col.strip() for col in df.columns]
    
    # Ensure 'College Name' column exists
    if "College Name" not in df.columns:
        raise ValueError("The CSV must have a 'College Name' column.")
    
    # Keep only the expected columns that exist
    keep_cols = [col for col in EXPECTED_COLS if col in df.columns]
    df = df[keep_cols].copy()
    
    # Fill missing string columns with proper defaults
    string_cols = ["College Name", "City", "State", "Branch", "College Type", 
                   "Facilities", "Genders Accepted"]
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].fillna("Not specified").astype(str).str.strip()
            # Replace empty strings with "Not specified"
            df[col] = df[col].replace("", "Not specified")
    
    # Convert numeric columns with better default handling
    numeric_cols = ["Average Fees", "Rating", "Established Year", "Campus Size", 
                    "Student Count", "Faculty Count"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    
    # Add normalized fields for filtering (lowercase for internal use)
    df["city_norm"] = df["City"].str.lower() if "City" in df.columns else ""
    df["branch_norm"] = df["Branch"].str.lower() if "Branch" in df.columns else ""
    df["college_type_norm"] = df["College Type"].str.lower() if "College Type" in df.columns else ""
    
    # Add lowercase column mapping for recommender system
    df["college name"] = df["College Name"]  # Map for recommender compatibility
    df["city"] = df["City"]
    df["state"] = df["State"] 
    df["branch"] = df["Branch"]
    df["college type"] = df["College Type"] if "College Type" in df.columns else "Not specified"
    df["average fees"] = df["Average Fees"] if "Average Fees" in df.columns else 0
    df["rating"] = df["Rating"] if "Rating" in df.columns else 0
    df["facilities"] = df["Facilities"] if "Facilities" in df.columns else "Not specified"
    df["genders accepted"] = df["Genders Accepted"] if "Genders Accepted" in df.columns else "Not specified"
    df["established year"] = df["Established Year"] if "Established Year" in df.columns else 0
    df["campus size"] = df["Campus Size"] if "Campus Size" in df.columns else 0
    df["student count"] = df["Student Count"] if "Student Count" in df.columns else 0
    df["faculty count"] = df["Faculty Count"] if "Faculty Count" in df.columns else 0
    
    return df