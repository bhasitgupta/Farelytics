"""Utility to output database DDL schema."""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.models import Base
from sqlalchemy.schema import CreateTable
from sqlalchemy import create_mock_engine

def dump_sql():
    def dump(sql, *multiparams, **params):
        print(str(sql.compile(dialect=engine.dialect)).strip() + ";")
    engine = create_mock_engine("postgresql://", dump)
    for table in Base.metadata.sorted_tables:
        print(CreateTable(table).compile(engine))

if __name__ == "__main__":
    dump_sql()
