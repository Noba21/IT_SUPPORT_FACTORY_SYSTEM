import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
