# 🏥 Privacy-Preserving Federated Healthcare Platform

A state-of-the-art platform designed for collaborative medical AI training without ever compromising patient data privacy. By leveraging **Federated Learning** and **Differential Privacy**, multiple healthcare institutions can train a shared global model while keeping their sensitive datasets local and secure.

---

## 🌟 Key Concepts

### 1. Federated Learning (FL)
Unlike traditional AI training which requires data to be centralized in one server, Federated Learning brings the model to the data. 
- **Local Training**: Each hospital/organization trains the model on its own private hardware.
- **Secure Aggregation**: Only model updates (weights) are sent to the central server, never the raw data.
- **Global Model**: The central server merges these updates to create a smarter, more generalized model.

### 2. Differential Privacy (DP)
We implement a **Privacy Budget (ε)**. This mathematical framework adds controlled noise to the training updates, ensuring that the final model cannot be "reversed" to reveal information about any specific individual in the dataset.

---

## 🏗️ Project Architecture

The system is built with a decoupled, modular architecture:

### **Backend (FastAPI)**
- **API Engine**: Manages user authentication, job scheduling, and auditing.
- **RBAC**: Robust Role-Based Access Control (Admin, Organization, Auditor, Researcher).
- **Database**: SQLite with SQLAlchemy for tracking jobs, models, and audit logs.

### **Federated Core (Flower)**
- **FL Server**: Orchestrates the training rounds using the `flwr` framework.
- **Custom Strategies**: Implements `SaveModelStrategy` for real-time model versioning and metrics logging.
- **Model Registry**: Automatically tracks global model updates and associates them with training jobs.

### **Frontend (React + Vite)**
- **Live Dashboard**: Real-time visualization of training progress (Accuracy/Loss charts).
- **Interactive Management**: UI for creating jobs, approving users, and downloading trained models.
- **Glassmorphic Design**: Modern, premium aesthetic with dark/light mode support.

---

## 📊 System Flow

1. **User Registration**: Users sign up as Organizations or Auditors. Admins must manually approve them.
2. **Setup Datasets**: Organization Nodes upload dataset metadata and prepare local CSV files for training.
3. **Initiate Training**:
   - **Admin** creates a "Training Job" (e.g., Logistic Regression for 10 rounds).
   - This starts the central **Flower Server**.
4. **Collaboration**:
   - Approved **Organizations** browse active jobs and "Join" them.
   - They click "Start Training" to launch local **FL Clients**.
5. **Real-time Monitoring**:
   - As training proceeds, the backend captures round-wise accuracy and loss.
   - The **Admin Dashboard** displays these metrics live using interactive charts.
6. **Model Delivery**:
   - Once training completes, the final model is saved to the **Model Registry**.
   - Admins can download the `.pt` model file directly from the "Load Models" section.

---

## 🛠️ Setup & Installation

### Backend
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `.\venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `python -m uvicorn backend.main:app --reload`

### Frontend
1. Navigate to the frontend folder: `cd frontend`
2. Install packages: `npm install`
3. Run dev server: `npm run dev`

---

## 🛡️ Security & Auditing
- **JWT Authentication**: All API requests are secured with signed JSON Web Tokens.
- **Audit Logs**: Every critical action (Job creation, user approval, model download) is logged with a timestamp and user ID for legal and compliance tracking.
- **Data Locality**: Raw healthcare data nunca leaves the organization's premises.
