import sys
sys.path.insert(0, '.')
from app.core.database import engine
from sqlmodel import Session, text

with Session(engine) as s:
    s.exec(text('UPDATE repository SET health_score = 0 WHERE health_score = 100'))
    s.commit()
    print('Done: reset health_score to 0 for all existing repos')
