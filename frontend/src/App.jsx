import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ApprovalPending from './pages/auth/ApprovalPending';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OrganizationDashboard from './pages/dashboard/OrganizationDashboard';
import ResearcherDashboard from './pages/dashboard/ResearcherDashboard';
import AuditorDashboard from './pages/dashboard/AuditorDashboard';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/approval-pending" element={<ApprovalPending />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/org-dashboard"
        element={
          <ProtectedRoute allowedRoles={['ORG_NODE']}>
            <OrganizationDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher-dashboard"
        element={
          <ProtectedRoute allowedRoles={['RESEARCHER']}>
            <ResearcherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['AUDITOR']}>
            <AuditorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'ADMIN' ? <Navigate to="/admin-dashboard" /> :
             user?.role === 'ORG_NODE' ? <Navigate to="/org-dashboard" /> :
             user?.role === 'RESEARCHER' ? <Navigate to="/researcher-dashboard" /> :
             user?.role === 'AUDITOR' ? <Navigate to="/auditor-dashboard" /> :
             <Navigate to="/login" />}
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
