from pydantic import BaseModel
from datetime import date

class PriceTomatSchemas(BaseModel):
    tanggal: date
    pasar_bandung: int
    pasar_ngunut: int
    pasar_ngemplak: int
    ratarata_kemarin: int
    ratarata_sekarang: int

