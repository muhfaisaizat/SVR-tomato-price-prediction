from sqlalchemy import Table,Column
from sqlalchemy.sql.sqltypes import Integer, String, Boolean
from config.db import meta

settingPredict = Table(
    'setting_predict',meta,
    Column('id',Integer,primary_key=True),
    Column('nama_kernel',String(255), nullable=False),
    Column('nilai_c',String(255), nullable=True),
    Column('nilai_gamma',String(255), nullable=True),
    Column('nilai_epsilon',String(255), nullable=True),
    Column('nilai_degree',String(255), nullable=True),
    Column('nilai_coef',String(255), nullable=True),
    Column('status',Boolean, nullable=False, default=False),
    Column('statuskedepan',Boolean, nullable=False, default=False),
    
)