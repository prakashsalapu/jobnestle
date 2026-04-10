import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api.js';
import { Trash2, Plus } from 'lucide-react';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs/mine`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (response.ok) {
        setJobs(data);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== jobId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete');
      }
    } catch (err) {
      setError('Error deleting job');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My posted jobs</h1>
        <Link
          to="/jobs/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
          Post a job
        </Link>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job._id}>
                <td className="px-6 py-4">
                  <Link to={`/jobs/${job._id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {job.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{job.company}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{job.location}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link to="/applications/received" className="text-blue-600 hover:underline text-sm">
                    {job.applicationCount || 0} applications
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(job._id)}
                    className="text-red-600 hover:text-red-900"
                    aria-label="Delete job"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
