from pydantic import BaseModel
from typing import Optional

class SettingPredict(BaseModel):
    nama_kernel: str
    nilai_c: Optional[str] = None
    nilai_gamma: Optional[str] = None
    nilai_epsilon: Optional[str] = None
    nilai_degree: Optional[str] = None
    nilai_coef: Optional[str] = None
    status: bool
    statuskedepan: bool

    class Config:
        orm_mode = True
