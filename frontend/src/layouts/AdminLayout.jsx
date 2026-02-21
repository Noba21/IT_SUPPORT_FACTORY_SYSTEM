import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUploadUrl } from '../utils/photoUrl';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const nav = [
    { to: '/admin', end: true, label: 'Dashboard' },
    { to: '/admin/issues', label: 'Issues' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/chat', label: 'Chat' },
    { to: '/admin/profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-6">
              <span className="font-semibold">IT Support - Admin</span>
              {nav.map(({ to, end, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'text-amber-400' : 'hover:text-gray-200'
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {user?.photo ? (
                <img src={getUploadUrl(user.photo)} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-600" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium">
                  {user?.full_name?.slice(0, 2)?.toUpperCase() || 'A'}
                </span>
              )}
              <span className="text-sm">{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
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
