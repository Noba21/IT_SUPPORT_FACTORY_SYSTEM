import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import api from '../../services/api';

const schema = z.object({
  title: z.string().min(3, 'Min 3 characters'),
  description: z.string().min(10, 'Min 10 characters'),
  priority: z.enum(['urgent', 'not_urgent']),
});

export default function DepartmentRequest() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { priority: 'not_urgent' } });

  async function onSubmit(data) {
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      if (data.screenshot?.[0]) formData.append('screenshot', data.screenshot[0]);

      await api.post('/issues', formData);
      navigate('/department/history');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Request</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg shadow p-6">
        {error && (
          <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="Brief title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
            placeholder="Describe the issue..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot (optional)</label>
          <input
            {...register('screenshot')}
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border rounded file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            {...register('priority')}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-emerald-500"
          >
            <option value="not_urgent">Not Urgent</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
