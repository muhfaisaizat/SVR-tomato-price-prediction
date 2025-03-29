from io import BytesIO
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from config.db import conn, get_db
from models.index import priceTomat
from schemas.index import PriceTomatSchemas
from sqlalchemy.sql import select, insert, update, delete, text
from middleware.index import verify_token
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

priceTomat_router = APIRouter(
    prefix="/prices",  
    tags=["Price Tomat"]  
)

# 🔹 GET: Ambil semua data harga tomat
@priceTomat_router.get("/", dependencies=[Depends(verify_token)])
def get_prices(db=Depends(get_db)):
    try:
        query = select(priceTomat).order_by(priceTomat.c.tanggal.desc())
        result = db.execute(query).mappings().all()
        return result if result else []
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada database: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@priceTomat_router.get("/count", dependencies=[Depends(verify_token)])
def get_price_count(db=Depends(get_db)):
    try:
        query = select(func.count()).select_from(priceTomat)
        count = db.execute(query).scalar()
        return {"total_data": count}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada database: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@priceTomat_router.get("/{id}", response_model=PriceTomatSchemas, dependencies=[Depends(verify_token)])
def get_price(id: int, db=Depends(get_db)):
    query = select(priceTomat).where(priceTomat.c.id == id)
    result = db.execute(query).mappings().fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    return result

@priceTomat_router.post("/", dependencies=[Depends(verify_token)])
def create_price(price: PriceTomatSchemas, db=Depends(get_db)):
    try:
        existing_query = select(priceTomat).where(priceTomat.c.tanggal == price.tanggal)
        existing_result = db.execute(existing_query).scalar()
        if existing_result:
            raise HTTPException(status_code=400, detail="Tanggal sudah ada, data tidak dapat disimpan")
        query = insert(priceTomat).values(
            tanggal=price.tanggal,
            pasar_bandung=price.pasar_bandung,
            pasar_ngunut=price.pasar_ngunut,
            pasar_ngemplak=price.pasar_ngemplak,
            ratarata_kemarin=price.ratarata_kemarin,
            ratarata_sekarang=price.ratarata_sekarang
        )
        db.execute(query)
        db.commit()
        return {"message": "Data berhasil disimpan", "data": price.dict()}
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@priceTomat_router.post("/upload-file/")
async def upload_file(file: UploadFile = File(...), db=Depends(get_db)):
    try:
        file_bytes = await file.read()
        file_stream = BytesIO(file_bytes)
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension == "csv":
            df = pd.read_csv(file_stream, dtype=str)
        elif file_extension in ["xls", "xlsx"]:
            df = pd.read_excel(file_stream, engine="openpyxl", dtype=str)
        else:
            raise HTTPException(status_code=400, detail="Format file tidak didukung!")
        df.columns = df.columns.str.strip().str.lower()
        required_columns = {"tanggal", "pasar_bandung", "pasar_ngunut", "pasar_ngemplak", "ratarata_kemarin", "ratarata_sekarang"}
        if not required_columns.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"Kolom wajib: {required_columns}")
        df["tanggal"] = pd.to_datetime(df["tanggal"], format="%Y-%m-%d", errors="coerce").dt.strftime("%Y-%m-%d")
        df.dropna(subset=["tanggal"], inplace=True)
        df.replace(["N/A", "NA", "null", "None", "-", ""], 0, inplace=True)  # Ganti yang tidak valid jadi 0
        df.fillna(0, inplace=True)  # Ubah semua NaN jadi 0

        def clean_price(value):
            if pd.isna(value) or value == "":
                return None
            return int(str(value).strip().replace(".", "").replace(",", "").replace(" ", "").replace("Rp", "").replace("IDR", ""))
        df[["pasar_bandung", "pasar_ngunut", "pasar_ngemplak", "ratarata_kemarin", "ratarata_sekarang"]] = df[["pasar_bandung", "pasar_ngunut", "pasar_ngemplak", "ratarata_kemarin", "ratarata_sekarang"]].applymap(clean_price)
        if "id" in df.columns:
            df.drop(columns=["id"], inplace=True)
        data_to_insert = df.to_dict(orient="records")
        insert_query = insert(priceTomat)
        db.execute(insert_query, data_to_insert)
        db.commit()
        return {"message": "Data berhasil diunggah dan disimpan"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@priceTomat_router.put("/{id}", dependencies=[Depends(verify_token)])
def update_price(id: int, price: PriceTomatSchemas, db=Depends(get_db)):
    try:
        existing_query = select(priceTomat).where(priceTomat.c.id == id)
        existing_price = db.execute(existing_query).fetchone()
        if not existing_price:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        check_date_query = select(priceTomat).where(
            (priceTomat.c.tanggal == price.tanggal) & (priceTomat.c.id != id)
        )
        existing_date = db.execute(check_date_query).fetchone()
        if existing_date:
            raise HTTPException(status_code=400, detail="Tanggal sudah ada, data tidak dapat diperbarui")
        update_query = update(priceTomat).where(priceTomat.c.id == id).values(
            tanggal=price.tanggal,
            pasar_bandung=price.pasar_bandung,
            pasar_ngunut=price.pasar_ngunut,
            pasar_ngemplak=price.pasar_ngemplak,
            ratarata_kemarin=price.ratarata_kemarin,
            ratarata_sekarang=price.ratarata_sekarang
        )
        db.execute(update_query)
        db.commit()
        return {"message": "Data berhasil diperbarui"}
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@priceTomat_router.delete("/{id}", dependencies=[Depends(verify_token)])
def delete_price(id: int, db=Depends(get_db)):
    query = select(priceTomat).where(priceTomat.c.id == id)
    existing_price = db.execute(query).fetchone()
    if not existing_price:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    delete_query = delete(priceTomat).where(priceTomat.c.id == id)
    db.execute(delete_query)
    db.commit()
    return {"message": "Data berhasil dihapus"}
