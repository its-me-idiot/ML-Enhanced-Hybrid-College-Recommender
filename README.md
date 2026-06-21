# ML-Enhanced-Hybrid-College-Recommender

Lightweight hybrid college recommender combining content-based and collaborative filtering with ML enhancements.

## Project structure
- app_enhanced.py — Flask app
- hybrid_recommender_enhanced.py — recommender logic
- frontend/ — UI
- data/ — datasets
- create_fresh_db.py, verify_schema.py — DB utilities
- requirements.txt — Python deps

## Setup
1. Create a virtualenv: python -m venv .venv
2. Activate it and install: pip install -r requirements.txt

## Run
python app_enhanced.py

## Notes
- Do NOT commit `venv/`, `node_modules/`, or `__pycache__/`. Add large files to .gitignore or use Git LFS for datasets.

License: MIT
