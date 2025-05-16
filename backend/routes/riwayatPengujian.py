from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from config.db import conn, get_db
from models.index import riwayatPengujian, settingPredict
from schemas.index import RiwayatPengujian
from middleware.index import verify_token
from sqlalchemy import select, insert, update, delete
from sqlalchemy.exc import SQLAlchemyError


# 🔹 Definisi Router
riwayat_router = APIRouter(
    prefix="/riwayat",  
    tags=["Riwayat Pengujian SVR"]    
)

#  Get all riwayat pengujian
@riwayat_router.get("/", dependencies=[Depends(verify_token)])
async def get_all_riwayat(db: Session = Depends(get_db)):
    try:
        query = select(riwayatPengujian, settingPredict.c.nama_kernel).join(
            settingPredict, riwayatPengujian.c.id_kernel == settingPredict.c.id
        ).order_by(riwayatPengujian.c.id.desc())
        result = db.execute(query).fetchall()
        return [dict(row._mapping) for row in result]
    except SQLAlchemyError as e:
        db.rollback()
        print(" ERROR Database:", str(e))
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada database: {str(e)}")
    except Exception as e:
        print(" ERROR tidak terduga:", str(e))
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")


# Get riwayat pengujian by ID
@riwayat_router.get("/{id}", dependencies=[Depends(verify_token)])
async def get_riwayat_by_id(id: int, db: Session = Depends(get_db)):
    try:
        query = select(riwayatPengujian).where(riwayatPengujian.c.id == id)
        result = db.execute(query).fetchone()
        if result:
            return dict(result._mapping)
        raise HTTPException(status_code=404, detail="Riwayat Pengujian tidak ditemukan")
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Create new riwayat pengujian
@riwayat_router.post("/", dependencies=[Depends(verify_token)])
async def create_riwayat(data: RiwayatPengujian, db: Session = Depends(get_db)):
    try:
        query = insert(riwayatPengujian).values(
            id_kernel=data.id_kernel,
            tanggal=data.tanggal,
            infoHyperparameter=data.infoHyperparameter,
            MAE=data.MAE,
            RMSE=data.RMSE,
            MAPE=data.MAPE
        )
        db.execute(query)
        db.commit()
        return {"message": "Riwayat Pengujian berhasil ditambahkan"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Update riwayat pengujian by ID
@riwayat_router.put("/{id}", dependencies=[Depends(verify_token)])
async def update_riwayat(id: int, data: RiwayatPengujian, db: Session = Depends(get_db)):
    try:
        query = update(riwayatPengujian).where(riwayatPengujian.c.id == id).values(
            id_kernel=data.id_kernel,
            tanggal=data.tanggal,
            infoHyperparameter=data.infoHyperparameter,
            MAE=data.MAE,
            RMSE=data.RMSE,
            MAPE=data.MAPE
        )
        result = db.execute(query)
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Riwayat Pengujian tidak ditemukan")
        
        return {"message": "Riwayat Pengujian berhasil diperbarui"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Delete riwayat pengujian by ID
@riwayat_router.delete("/{id}", dependencies=[Depends(verify_token)])
async def delete_riwayat(id: int, db: Session = Depends(get_db)):
    try:
        query = delete(riwayatPengujian).where(riwayatPengujian.c.id == id)
        result = db.execute(query)
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Riwayat Pengujian tidak ditemukan")
        
        return {"message": "Riwayat Pengujian berhasil dihapus"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
