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
**1. Start the Backend:**
Open a terminal in the project root:

```powershell
python app_enhanced.py

```

**2. Start the Frontend:**
Open a **new terminal** window, navigate to the frontend folder, and start the application:

```powershell
cd frontend
npm install
npm start

```

## Notes

* Do NOT commit `venv/`, `node_modules/`, or `__pycache__/` to Git.
* Ensure your `.gitignore` is properly configured to ignore these folders.

## License

MIT
"@ | Out-File -FilePath README.md -Encoding utf8
