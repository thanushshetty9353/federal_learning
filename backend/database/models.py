from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from backend.database.db import Base


# -----------------------------
# Users Table
# -----------------------------
class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    requested_role = Column(String)
    role = Column(String)

    status = Column(String, default="PENDING")

    organization_name = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Dataset Metadata
# -----------------------------
class Dataset(Base):

    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer)

    schema_metadata = Column(String)

    sensitivity_level = Column(String, default="HIGH")


# -----------------------------
# Training Jobs
# -----------------------------
class TrainingJob(Base):

    __tablename__ = "training_jobs"

    id = Column(Integer, primary_key=True, index=True)

    model_type = Column(String)
    rounds = Column(Integer)

    privacy_budget = Column(String)

    status = Column(String, default="CREATED")

    created_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Job Participation
# -----------------------------
class TrainingJobParticipant(Base):

    __tablename__ = "training_job_participants"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(Integer, ForeignKey("training_jobs.id"))

    organization_id = Column(Integer, ForeignKey("users.id"))

    status = Column(String, default="JOINED")


# -----------------------------
# Audit Logs
# -----------------------------
class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    action = Column(String)

    user_id = Column(Integer)

    timestamp = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Model Registry
# -----------------------------
class ModelRegistry(Base):

    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)

    model_name = Column(String)

    file_path = Column(String)

    accuracy = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)