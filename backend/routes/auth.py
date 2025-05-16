import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException,  Query, status
from pydantic import BaseModel
from config.db import conn
from models.index import users
from dotenv import load_dotenv
from sqlalchemy.sql import select
from sqlalchemy.exc import SQLAlchemyError, OperationalError

# Load environment variables
load_dotenv()

# Secret key untuk JWT
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token berlaku selama 1 jam

# Router
auth_router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# Schema untuk login request
class LoginRequest(BaseModel):
    email: str
    password: str

@auth_router.post("/login")
async def login(data: LoginRequest):
    try:
        # Eksekusi query untuk cek user
        query = users.select().where(users.c.email == data.email)
        user = conn.execute(query).fetchone()

        # Validasi user
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

        # Verifikasi password
        if not bcrypt.checkpw(data.password.encode("utf-8"), user.password.encode("utf-8")):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

        # Buat token JWT
        payload = {
            "sub": user.email,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            }
        }

    except OperationalError:
        # Jika koneksi DB putus, coba reconnect
        try:
            conn.close()  # tutup koneksi lama (jika masih terbuka)
            from config.db import engine  # impor ulang engine
            conn.connect()  # buka koneksi baru
            raise HTTPException(status_code=500, detail="Koneksi database sempat terputus, silakan coba lagi.")
        except Exception as reconnect_error:
            raise HTTPException(status_code=500, detail=f"Gagal reconnect ke database: {str(reconnect_error)}")

    except SQLAlchemyError as e:
        conn.rollback()  # rollback jika error transaksi
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

class ForgotPasswordRequest(BaseModel):
    email: str
    new_password: str

@auth_router.put("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    # Cek apakah user dengan email ini ada di database
    user = conn.execute(users.select().where(users.c.email == data.email)).fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan")

    # Hash password baru
    hashed_password = bcrypt.hashpw(data.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Update password di database
    conn.execute(users.update().where(users.c.email == data.email).values(password=hashed_password))
    conn.commit()

    return {"message": "Password berhasil diperbarui"}

class CekEmail(BaseModel):
    email: str


@auth_router.get("/check-email")
async def check_email(email: str = Query(..., description="Email yang akan dicek")):
    try:
        query = select(users).where(users.c.email == email)
        result = conn.execute(query).fetchone()

        if result:
            return {"message": "true"}
        else:
            raise HTTPException(status_code=400, detail="false")

    except SQLAlchemyError as e:
        try:
            conn.rollback()  # Jika sebelumnya ada transaksi yang belum selesai
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
