import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api.js';
import { Download, FileText } from 'lucide-react';

export default function ReceivedApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/applications/received`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (response.ok) {
        setApplications(data);
      } else {
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setApplications((apps) =>
          apps.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
        );
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Applications to your jobs</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((application) => {
              const applicant = application.user;
              return (
                <tr key={application._id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {applicant?.name || applicant?.fullName || '—'}
                    </div>
                    <div className="text-sm text-gray-500">{applicant?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/jobs/${application.job?._id}`} className="text-blue-600 hover:underline text-sm">
                      {application.job?.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={application.status || 'pending'}
                      onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                      <option value="Applied">Applied (legacy)</option>
                      <option value="Rejected">Rejected (legacy)</option>
                      <option value="Accepted">Accepted (legacy)</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {application.resume ? (
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 inline-flex"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    ) : (
                      <FileText className="h-5 w-5 text-gray-300" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
