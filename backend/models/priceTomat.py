from sqlalchemy import Table,Column
from sqlalchemy.sql.sqltypes import Integer, Date
from config.db import meta

priceTomat = Table(
    'price_tomat',meta,
    Column('id',Integer,primary_key=True),
    Column('tanggal',Date),
    Column('pasar_bandung',Integer),
    Column('pasar_ngunut',Integer),
    Column('pasar_ngemplak',Integer),
    Column('ratarata_kemarin',Integer),
    Column('ratarata_sekarang',Integer),
    
)