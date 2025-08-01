from fastapi import APIRouter, HTTPException, Query, Depends
from config.db import conn, get_db
from models.index import settingPredict
from schemas.index import SettingPredict
from sqlalchemy.sql import select, insert, update, delete, text
from middleware.index import verify_token
from sqlalchemy.orm import Session

settingPredict_router = APIRouter(
    prefix="/setpredict",
    tags=["Setting Predict"]
)

# Get All Settings
@settingPredict_router.get("/all", dependencies=[Depends(verify_token)])
def get_all_settings(db: Session = Depends(get_db)):
    try:
        raw_query = text("""
            SELECT * 
            FROM setting_predict
            WHERE nama_kernel IN ('linear', 'rbf', 'sigmoid', 'poly')
            ORDER BY FIELD(nama_kernel, 'linear', 'rbf', 'sigmoid', 'poly');
        """)
        result = db.execute(raw_query).fetchall()

        if not result:
            return {"message": "No data found"}  # Menghindari error saat data kosong

        return [dict(row._mapping) for row in result]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@settingPredict_router.get("/", dependencies=[Depends(verify_token)])
def get_all_settings(db: Session = Depends(get_db)):
    try:
        query = select(settingPredict).where(settingPredict.c.status == True)
        result = db.execute(query).fetchall()

        if not result:
            return {"message": "No data found"}  # Menghindari error saat data kosong

        return [dict(row._mapping) for row in result]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Dictionary nilai default untuk setiap kernel
DEFAULT_VALUES = [
    {"id": 1, "nama_kernel": "linear", "nilai_c": "1.0", "nilai_gamma": None, "nilai_epsilon": "0.1", "nilai_degree": None, "nilai_coef": None, "status": False},
    {"id": 2, "nama_kernel": "poly", "nilai_c": "1.0", "nilai_gamma": "0.1", "nilai_epsilon": "0.1", "nilai_degree": "3", "nilai_coef": "0.0", "status": False},
    {"id": 3, "nama_kernel": "sigmoid", "nilai_c": "1.0", "nilai_gamma": "0.1", "nilai_epsilon": "0.1", "nilai_degree": None, "nilai_coef": "0.0", "status": False},
    {"id": 4, "nama_kernel": "rbf", "nilai_c": "1.0", "nilai_gamma": "0.1", "nilai_epsilon": "0.1", "nilai_degree": None, "nilai_coef": None, "status": False}
]

@settingPredict_router.post("/seed",dependencies=[Depends(verify_token)])
async def seed_database(db: Session = Depends(get_db)):
    """Endpoint untuk menjalankan seeder secara manual via API."""
    query = select(settingPredict)
    result = db.execute(query).fetchall()

    if result:
        raise HTTPException(status_code=400, detail="Seeder sudah dijalankan, data sudah ada.")

    query = insert(settingPredict).values(DEFAULT_VALUES)
    db.execute(query)
    db.commit()
    
    return {"message": " Seeder berhasil dijalankan: Data setting_predict sudah diisi."}


# Mapping kernel ke kolom yang bisa diupdate
ALLOWED_FIELDS = {
    "linear": ["nilai_c", "nilai_epsilon", "status"],
    "poly": ["nilai_c", "nilai_gamma", "nilai_epsilon", "nilai_degree", "nilai_coef", "status"],
    "sigmoid": ["nilai_c", "nilai_gamma", "nilai_epsilon", "nilai_coef", "status"],
    "rbf": ["nilai_c", "nilai_gamma", "nilai_epsilon", "status"]
}


@settingPredict_router.put("/{setting_id}",dependencies=[Depends(verify_token)])
async def update_setting(
    setting_id: int,
    nilai_c: str = Query(None),
    nilai_gamma: str = Query(None),
    nilai_epsilon: str = Query(None),
    nilai_degree: str = Query(None),
    nilai_coef: str = Query(None),
    db: Session = Depends(get_db)
):
    # Cek apakah setting dengan ID tersebut ada
    query = select(settingPredict.c.nama_kernel).where(settingPredict.c.id == setting_id)
    result = db.execute(query).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Setting not found")

    kernel_name = result[0].lower()  # Ambil nama kernel dari database
    
    # Ambil hanya field yang diperbolehkan untuk kernel tersebut
    allowed_fields = ALLOWED_FIELDS.get(kernel_name, [])
    update_data = {
        "nilai_c": nilai_c,
        "nilai_gamma": nilai_gamma,
        "nilai_epsilon": nilai_epsilon,
        "nilai_degree": nilai_degree,
        "nilai_coef": nilai_coef,
        
    }
    
    # Filter hanya field yang diperbolehkan untuk kernel tersebut
    update_data = {key: value for key, value in update_data.items() if key in allowed_fields and value is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update for this kernel")

    # Buat query update berdasarkan field yang diperbolehkan
    query = update(settingPredict).where(settingPredict.c.id == setting_id).values(**update_data)
    result = db.execute(query)

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Failed to update setting")

    db.commit()
    return {"message": "Setting updated successfully", "updated_fields": update_data}

@settingPredict_router.put("/update-status/{setting_id}", dependencies=[Depends(verify_token)])
async def update_status_setting(
    setting_id: int,
    status: bool = Query(...),
    db: Session = Depends(get_db)
):
    # Cek apakah setting dengan ID tersebut ada
    query = select(settingPredict.c.id).where(settingPredict.c.id == setting_id)
    result = db.execute(query).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Setting not found")

    # Update hanya status
    query = update(settingPredict).where(settingPredict.c.id == setting_id).values(status=status)
    result = db.execute(query)

    if result.rowcount == 0:
        raise HTTPException(status_code=400, detail="Failed to update status")

    db.commit()
    return {"message": "Status updated successfully", "updated_status": status}

@settingPredict_router.put("/update-status-kedepan/{setting_id}", dependencies=[Depends(verify_token)])
async def update_status_setting(
    setting_id: int,
    statuskedepan: bool = Query(...),
    db: Session = Depends(get_db)
):
    # Cek apakah setting dengan ID tersebut ada
    query = select(settingPredict.c.id).where(settingPredict.c.id == setting_id)
    result = db.execute(query).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Setting not found")

    # Update hanya status
    query = update(settingPredict).where(settingPredict.c.id == setting_id).values(statuskedepan=statuskedepan)
    result = db.execute(query)

    if result.rowcount == 0:
        raise HTTPException(status_code=400, detail="Failed to update status kedepan")

    db.commit()
    return {"message": "Status updated successfully", "updated_status_kedepan": statuskedepan}
