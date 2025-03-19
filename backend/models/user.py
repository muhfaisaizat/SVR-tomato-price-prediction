from sqlalchemy import Table,Column
from sqlalchemy.sql.sqltypes import Integer, String
from config.db import meta

users = Table(
    'users',meta,
    Column('id',Integer,primary_key=True),
    Column('email',String(255)),
    Column('password',String(255)),
    Column('role',String(255)),
    
)