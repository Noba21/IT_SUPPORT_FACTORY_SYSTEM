import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TechnicianLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-6">
              <span className="font-semibold">IT Support - Technician</span>
              <NavLink
                to="/technician"
                end
                className={({ isActive }) =>
                  isActive ? 'text-amber-400' : 'hover:text-gray-200'
                }
              >
                My Issues
              </NavLink>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
