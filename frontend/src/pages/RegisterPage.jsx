import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  department_id: z.coerce.number().min(1, 'Select department'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Min 6 characters'),
});

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.departments || []));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setError('');
    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('department_id', data.department_id);
      formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      formData.append('password', data.password);
      if (data.photo?.[0]) formData.append('photo', data.photo[0]);

      await authRegister(formData);
      navigate('/department');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Register (Department User)
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-slate-300 text-sm mb-1">Full Name</label>
              <input
                {...register('full_name')}
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500"
                placeholder="John Doe"
              />
              {errors.full_name && (
                <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Department</label>
              <select
                {...register('department_id')}
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-red-400 text-sm mt-1">{errors.department_id.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500"
                placeholder="you@factory.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Phone</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Profile Photo</label>
              <input
                {...register('photo')}
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-amber-500 file:text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-amber-500"
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
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:underline">
              Login
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
