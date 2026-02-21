import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminLayout from './layouts/AdminLayout';
import DepartmentLayout from './layouts/DepartmentLayout';
import TechnicianLayout from './layouts/TechnicianLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminIssueDetail from './pages/admin/AdminIssueDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminChat from './pages/admin/AdminChat';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import DepartmentRequest from './pages/department/DepartmentRequest';
import DepartmentHistory from './pages/department/DepartmentHistory';
import DepartmentHistoryDetail from './pages/department/DepartmentHistoryDetail';
import ProfilePage from './pages/ProfilePage';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianIssueDetail from './pages/technician/TechnicianIssueDetail';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'department') return <Navigate to="/department" replace />;
  if (user.role === 'technician') return <Navigate to="/technician" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="issues" element={<AdminIssues />} />
        <Route path="issues/:id" element={<AdminIssueDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/department" element={<ProtectedRoute roles={['department']}><DepartmentLayout /></ProtectedRoute>}>
        <Route index element={<DepartmentDashboard />} />
        <Route path="request" element={<DepartmentRequest />} />
        <Route path="history" element={<DepartmentHistory />} />
        <Route path="history/:id" element={<DepartmentHistoryDetail />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/technician" element={<ProtectedRoute roles={['technician']}><TechnicianLayout /></ProtectedRoute>}>
        <Route index element={<TechnicianDashboard />} />
        <Route path="issues/:id" element={<TechnicianIssueDetail />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
