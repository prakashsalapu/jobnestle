import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, ArrowLeft } from 'lucide-react';
import API_BASE from '../api.js';
import AuthContext from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { sampleJobs } from '../data/sampleJobs.js';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchJob();
    if (token) checkApplication();
  }, [id, token]);

  const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

  const fetchJob = async () => {
    const fallback = sampleJobs.find((job) => job.id === id || job._id === id);
    if (fallback && !isValidObjectId(id)) {
      setJob(fallback);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/jobs/${id}`);
      if (!res.ok) throw new Error('Job not found');
      const data = await res.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      if (fallback) {
        setJob(fallback);
      } else {
        setToast({ message: 'Job not found', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const apps = await res.json();
        const hasApplied = apps.some(app => app.job._id === id);
        setApplied(hasApplied);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const isSampleJob = job && !job._id;

  const posterId =
    job?.recruiter && typeof job.recruiter === 'object' && job.recruiter._id
      ? job.recruiter._id
      : job?.recruiter;
  const isOwnJob = Boolean(user && posterId && String(posterId) === String(user.id));

  const handleApply = async () => {
    if (!token) {
      setToast({ message: 'Please log in to apply', type: 'error' });
      return;
    }
    setApplying(true);
    try {
      if (isSampleJob) {
        setApplied(true);
        setShowDialog(true);
        return;
      }

      const res = await fetch(`${API_BASE}/api/applications/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobId: id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.message || 'Failed to apply', type: 'error' });
        return;
      }
      setApplied(true);
      setShowDialog(true);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to apply. Please try again later.', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link to="/jobs" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Jobs
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-blue-600 font-medium text-xl mb-4">{job.company}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                {job.job_type}
              </div>
              {(job.salary || job.salary_range) && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  {job.salary || job.salary_range}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                Posted {new Date(job.createdAt || job.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.skills_required && job.skills_required.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {isOwnJob ? (
              <p className="text-gray-600 text-center">This is your job listing.</p>
            ) : applied ? (
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-md font-medium">
                You have already applied to this job
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        {showDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Application Submitted</h3>
              <p className="text-gray-700 mb-4">
                You have successfully applied for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company}</span>.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Close
                </button>
                <Link
                  to="/jobs"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Back to jobs
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}