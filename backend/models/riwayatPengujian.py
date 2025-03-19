from sqlalchemy import Table,Column
from sqlalchemy.sql.sqltypes import Integer, String, Date
from config.db import meta

riwayatPengujian = Table(
    'riwayat_pengujian',meta,
    Column('id',Integer,primary_key=True),
    Column('id_kernel',Integer),
    Column('tanggal',Date),
    Column('infoHyperparameter',String(255)),
    Column('MAE',String(255)),
    Column('RMSE',String(255)),
    Column('MAPE',String(255)),
    
)