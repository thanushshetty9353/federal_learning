from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


# -----------------------------
# Users Table (Authentication + RBAC)
# -----------------------------
class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # role user requested
    requested_role = Column(String)

    # role assigned by admin
    role = Column(String)

    # approval status
    status = Column(String, default="PENDING")

    # hospital name stored here
    organization_name = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Datasets (metadata only)
# -----------------------------
class Dataset(Base):

    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer)

    schema_metadata = Column(String)

    sensitivity_level = Column(String, default="HIGH")


# -----------------------------
# Training Jobs
# -----------------------------
class TrainingJob(Base):

    __tablename__ = "training_jobs"

    id = Column(Integer, primary_key=True)

    model_type = Column(String)
    rounds = Column(Integer)

    privacy_budget = Column(String)

    status = Column(String, default="CREATED")

    created_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Node Participation
# -----------------------------
class NodeParticipation(Base):

    __tablename__ = "node_participation"

    id = Column(Integer, primary_key=True)

    job_id = Column(Integer)
    user_id = Column(Integer)

    status = Column(String)


# -----------------------------
# Audit Logs
# -----------------------------
class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)

    action = Column(String)
    user_id = Column(Integer)

    timestamp = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Model Registry
# -----------------------------
class ModelRegistry(Base):

    __tablename__ = "models"

    id = Column(Integer, primary_key=True)

    model_name = Column(String)
    file_path = Column(String)
    accuracy = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)