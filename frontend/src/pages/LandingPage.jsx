import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <span className="text-xl font-bold">Factory IT Support</span>
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium"
        >
          Login
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          IT Support Management System
        </h1>
        <p className="text-slate-300 text-lg mb-8">
          Replace WhatsApp-based IT issue communication with a professional,
          trackable support system. Submit requests, track status, and chat
          with technicians in real time.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-lg border border-amber-500 text-amber-500 hover:bg-amber-500/10 font-medium"
          >
            Register (Department)
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          Factory IT Support Management System &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
