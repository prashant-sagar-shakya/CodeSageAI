from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
with engine.begin() as conn:
    try:
        conn.execute(text('ALTER TABLE "user" ADD COLUMN subscription_expires_at TIMESTAMP WITHOUT TIME ZONE;'))
        print("Column subscription_expires_at added successfully!")
    except Exception as e:
        print(f"Error (might already exist): {e}")

    try:
        conn.execute(text('ALTER TABLE "user" ADD COLUMN subscription_tier VARCHAR DEFAULT \'free\';'))
        print("Column subscription_tier added successfully!")
    except Exception as e:
        print(f"Error (might already exist): {e}")
