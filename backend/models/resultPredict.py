from sqlalchemy import Table,Column
from sqlalchemy.sql.sqltypes import Integer, Date
from config.db import meta

resultPredict = Table(
    'result_predict',meta,
    Column('id',Integer),
    Column('hasil_prediksi',Integer),
    
)