from pydantic import BaseModel
from datetime import date

class RiwayatPengujian(BaseModel):
    id_kernel:int
    tanggal:date
    infoHyperparameter:str
    MAE:str
    RMSE:str
    MAPE:str