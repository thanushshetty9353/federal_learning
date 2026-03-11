from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Organization(Base):

    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    certificate = Column(String)


class Dataset(Base):

    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True)
    org_id = Column(Integer)
    schema_metadata = Column(String)


class TrainingJob(Base):

    __tablename__ = "training_jobs"

    id = Column(Integer, primary_key=True)
    model_type = Column(String)
    rounds = Column(Integer)