import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Login
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-slate-300 text-sm mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@factory.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-center text-slate-400 text-sm">
            Department user?{' '}
            <Link to="/register" className="text-amber-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
        <Link to="/" className="block text-center text-slate-400 text-sm mt-4 hover:text-white">
          Back to home
        </Link>
      </div>
    </div>
  );
}
