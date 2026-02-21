import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const schema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().optional(),
  new_password: z.string().optional(),
}).refine((d) => !d.new_password || d.new_password.length >= 6, { message: 'Min 6 characters', path: ['new_password'] });

export default function DepartmentProfile() {
  const { user, refreshUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_name: user?.full_name, phone: user?.phone },
  });

  useEffect(() => {
    setValue('full_name', user?.full_name);
    setValue('phone', user?.phone);
  }, [user, setValue]);

  useEffect(() => {
    api.get('/departments').then(({ data }) => setDepartments(data.departments || []));
  }, []);

  async function onSubmit(data) {
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('phone', data.phone || '');
      if (data.photo?.[0]) formData.append('photo', data.photo[0]);
      if (data.new_password?.trim()) formData.append('password', data.new_password.trim());
      await api.put('/profile', formData);
      await refreshUser();
      setSuccess('Profile updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg shadow p-6">
        {error && <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>}
        {success && <div className="p-3 rounded bg-green-100 text-green-700 text-sm">{success}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input {...register('full_name')} className="w-full px-4 py-2 border rounded" />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={user?.email} disabled className="w-full px-4 py-2 border rounded bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input {...register('phone')} className="w-full px-4 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
          <input {...register('photo')} type="file" accept="image/*" className="w-full px-4 py-2 border rounded file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep)</label>
          <input {...register('new_password')} type="password" className="w-full px-4 py-2 border rounded" />
          {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
