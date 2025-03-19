from pydantic import BaseModel
from datetime import date

class ResultPredictSchemas(BaseModel):
    id: int
    hasil_prediksi: int