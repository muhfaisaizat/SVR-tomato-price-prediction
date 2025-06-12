from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, MetaData

engine = create_engine("mysql+pymysql://uupkixae2jbw2zse:1bFkfd8pfZ6EZhphAPQa@bdcaorplf9ct8apn6n5o-mysql.services.clever-cloud.com:3306/bdcaorplf9ct8apn6n5o")
# engine = create_engine("mysql+pymysql://root@localhost:3306/predict")
meta = MetaData()
conn = engine.connect()

# Buat session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fungsi untuk mendapatkan sesi database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()