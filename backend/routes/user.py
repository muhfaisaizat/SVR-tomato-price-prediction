import bcrypt
from fastapi import APIRouter, HTTPException, Depends
from config.db import conn
from models.index import users
from schemas.index import User
from middleware.index import verify_token

# # 🔹 Seeder untuk Admin
# def seed_admin():
#     admin_email = "admin@gmail.com"
#     admin_password = "Admin123"
#     admin_role = "admin"

#     # Hash password dengan bcrypt
#     hashed_password = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

#     # Cek apakah user admin sudah ada
#     existing_admin = conn.execute(users.select().where(users.c.email == admin_email)).fetchone()

#     if existing_admin is None:
#         # Jika tidak ada, tambahkan admin
#         conn.execute(users.insert().values(
#             email=admin_email,
#             password=hashed_password,
#             role=admin_role
#         ))
#         conn.commit()
#         print("✅ Admin user berhasil ditambahkan!")
#     else:
#         print("⚠️ Admin user sudah ada, tidak perlu ditambahkan.")

# # Panggil Seeder saat file dijalankan
# seed_admin()

# 🔹 Definisi Router
user_router = APIRouter(
    prefix="/users",  
    tags=["Users"]    
)

# 🔹 READ ALL USERS
@user_router.get("/",dependencies=[Depends(verify_token)])
async def read_data():
    try:
        result = conn.execute(users.select()).fetchall()
        return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 READ USER BY ID
@user_router.get("/{id}",dependencies=[Depends(verify_token)])
async def read_data(id: int):
    try:
        result = conn.execute(users.select().where(users.c.id == id)).fetchone()
        if result is None:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(result._mapping)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 CREATE USER
@user_router.post("/",dependencies=[Depends(verify_token)])
async def write_data(user: User):
    try:
        new_user = {"email": user.email, "password": user.password}
        conn.execute(users.insert().values(new_user))
        conn.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 UPDATE USER
@user_router.put("/{id}",dependencies=[Depends(verify_token)])
async def update_data(id: int, user: User):
    try:
        result = conn.execute(users.select().where(users.c.id == id)).fetchone()
        if result is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        conn.execute(users.update().where(users.c.id == id).values(
            email=user.email,
            password=user.password
        ))
        conn.commit()
        return {"message": "User updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 DELETE USER
@user_router.delete("/{id}",dependencies=[Depends(verify_token)])
async def delete_data(id: int):
    try:
        result = conn.execute(users.select().where(users.c.id == id)).fetchone()
        if result is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        conn.execute(users.delete().where(users.c.id == id))
        conn.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
