"""Utility script to seed database with representative baseline observations."""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import SessionLocal, init_db
from app.db.seed_data import seed_mock_data

def main():
    print("Initializing database...")
    init_db()
    db = SessionLocal()
    try:
        print("Seeding baseline route quotes...")
        seed_mock_data(db)
        print("Database seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
