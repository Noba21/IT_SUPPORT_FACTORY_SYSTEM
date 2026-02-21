import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getUploadUrl } from '../utils/photoUrl';

const schema = z.object({
  full_name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email'),
  new_password: z.string().optional(),
  current_password: z.string().optional(),
}).refine((d) => !d.new_password || d.new_password.length >= 6, { message: 'New password min 6 characters', path: ['new_password'] });

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoKey, setPhotoKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', email: '' },
  });

  useEffect(() => {
    if (user) {
      setValue('full_name', user.full_name ?? '');
      setValue('phone', user.phone ?? '');
      setValue('email', user.email ?? '');
    }
  }, [user, setValue]);

  async function onSubmit(data) {
    setError('');
    setSuccess('');
    const changingPhone = (data.phone ?? '') !== (user?.phone ?? '');
    const changingEmail = (data.email ?? '').trim().toLowerCase() !== (user?.email ?? '').toLowerCase();
    const changingPassword = !!data.new_password?.trim();
    const needsCurrent = changingPhone || changingEmail || changingPassword;

    if (needsCurrent && !data.current_password?.trim()) {
      setError('Enter your current password to change phone, email or password.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('phone', data.phone ?? '');
      formData.append('email', data.email);
      if (data.current_password?.trim()) formData.append('current_password', data.current_password.trim());
      if (data.new_password?.trim()) formData.append('password', data.new_password.trim());
      if (data.photo?.[0]) formData.append('photo', data.photo[0]);

      await api.put('/profile', formData);
      await refreshUser();
      setPhotoKey((k) => k + 1);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  }

  if (!user) return null;

  const photoUrl = getUploadUrl(user.photo);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg shadow p-6">
        {error && <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>}
        {success && <div className="p-3 rounded bg-green-100 text-green-700 text-sm">{success}</div>}

        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img
              key={`${user.photo}-${photoKey}`}
              src={`${photoUrl}?v=${photoKey}`}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <span className="w-20 h-20 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-2xl font-medium">
              {user.full_name?.slice(0, 2)?.toUpperCase() || '?'}
            </span>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <input
              {...register('photo')}
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-600 file:text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input {...register('full_name')} className="w-full px-4 py-2 border rounded" />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input {...register('phone')} type="tel" className="w-full px-4 py-2 border rounded" placeholder="Optional" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} type="email" className="w-full px-4 py-2 border rounded" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-3">To change phone, email or password, enter your current password below.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              {...register('current_password')}
              type="password"
              className="w-full px-4 py-2 border rounded"
              placeholder="Required when changing phone, email or password"
              autoComplete="current-password"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep)</label>
            <input
              {...register('new_password')}
              type="password"
              className="w-full px-4 py-2 border rounded"
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
            {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
