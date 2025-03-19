from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from config.db import get_db
from models.index import resultPredict, priceTomat
from middleware.index import verify_token

resultPredict_router = APIRouter(
    prefix="/result",
    tags=["Result Predict tomat"]
)

@resultPredict_router.get("/", dependencies=[Depends(verify_token)])
async def read_data(db: Session = Depends(get_db)):
    try:
        query = (
            select(
                priceTomat.c.tanggal,
                priceTomat.c.ratarata_sekarang.label("harga_aktual"),
                resultPredict.c.hasil_prediksi.label("harga_prediksi")
            ).join(priceTomat, priceTomat.c.id == resultPredict.c.id)
        )

        result = db.execute(query).fetchall()
        return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
