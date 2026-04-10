import { useContext, useEffect, useState, useRef } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import API_BASE from '../api.js';
import Toast from '../components/Toast.jsx';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(user?.profile || {});
  const [uploading, setUploading] = useState(false);
  const [education, setEducation] = useState(user?.profile?.education || [{ school: '', degree: '', from: '', to: '' }]);
  const fileRef = useRef();
  const avatarRef = useRef();

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/applications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setApplications(data || []);
    };
    load();
  }, [token]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  useEffect(() => {
    // Load initial profile data
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data.user.profile || {});
        setEducation(data.user.profile?.education || [{ school: '', degree: '', from: '', to: '' }]);
      } catch (err) {
        console.error('Error loading profile:', err);
        setToast({ message: 'Failed to load profile data', type: 'error' });
      }
    };
    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleUpload = async (e, type = 'resume') => {
    e.preventDefault();
    if (type === 'avatar' && !e.target.files) {
      return; // Early return for avatar change cancel
    }
    
    const fileInput = type === 'resume' ? fileRef : avatarRef;
    const file = fileInput.current.files[0];
    if (!file) {
      setToast({ message: 'Please choose a file', type: 'error' });
      return;
    }

    // Validate file type
    const validTypes = type === 'resume' 
      ? ['.pdf', '.doc', '.docx']
      : ['.jpg', '.jpeg', '.png', '.gif'];
      
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(fileExt)) {
      setToast({ 
        message: `Invalid file type. Allowed: ${validTypes.join(', ')}`,
        type: 'error'
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File size must be less than 5MB', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append(type, file);
      
      const endpoint = type === 'resume' ? 'upload-resume' : 'upload-avatar';
      const apiUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'https://mern-jobnestle-backend-1.onrender.com');
      console.log('Uploading to:', `${apiUrl}/api/users/${endpoint}`); // Debug log
      
      const res = await fetch(`${apiUrl}/api/users/${endpoint}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`
        },
        body: form,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      const body = await res.json();
      console.log('Upload response:', body); // Debug log

      // Update profile state with new data
      setProfile(prevProfile => ({
        ...prevProfile,
        ...body.user.profile
      }));

      setToast({ 
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
        type: 'success'
      });

      // Clear the file input
      fileInput.current.value = '';

      // Refresh global user data
      window.dispatchEvent(new Event('authChanged'));
    } catch (err) {
      console.error('Upload error:', err);
      setToast({ 
        message: err.message || `Failed to upload ${type}`,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const [toast, setToast] = useState({ message: '', type: 'info' });

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addEducation = () => {
    setEducation([...education, { school: '', degree: '', from: '', to: '' }]);
  };

  const removeEducation = (index) => {
    const newEducation = education.filter((_, i) => i !== index);
    setEducation(newEducation);
  };

  const saveProfile = async () => {
    try {
      const updatedProfile = {
        ...profile,
        education,
        // Include other profile fields
        contact: profile.contact || '',
        address: profile.address || '',
      };
      
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updatedProfile),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Save failed');
      }
      
      const body = await res.json();
      setProfile(body.user.profile);
      setToast({ message: 'Profile saved successfully', type: 'success' });
      // Refresh user data
      window.dispatchEvent(new Event('authChanged'));
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to save profile', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name || user?.fullName || 'User'}</h1>

        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 text-center">
              <div className="mx-auto h-28 w-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center mb-4 relative group">
                {profile?.avatar ? (
                  <img src={`${API_BASE}${profile.avatar}`} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.7-9.8 5v1.5h19.6V19.4c0-3.3-6.5-5-9.8-5z" />
                  </svg>
                )}
                <label htmlFor="avatarUpload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-white text-sm">Change Photo</span>
                  <input
                    id="avatarUpload"
                    type="file"
                    ref={avatarRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, 'avatar')}
                  />
                </label>
              </div>
              <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700">Resume Upload</h3>
                </div>
                
                <form onSubmit={(e) => handleUpload(e, 'resume')} className="space-y-4">
                  <div className="relative">
                    <input 
                      id="resumeUpload" 
                      name="resume" 
                      ref={fileRef} 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        cursor-pointer" 
                      aria-describedby="resumeHelp" 
                    />
                    <div id="resumeHelp" className="mt-2 text-xs text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Accepted formats: PDF, DOC, DOCX (Max 5MB)
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={uploading} 
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-md
                      ${uploading 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'} 
                      transition-colors duration-200 ease-in-out font-medium`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        Upload Resume
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-span-2">
              <div className="space-y-3">
                <div>
                  <label htmlFor="profileFullName" className="block text-sm font-medium text-gray-700">Full name</label>
                  <input id="profileFullName" name="fullName" autoComplete="name" value={profile?.fullName || user?.name || user?.fullName || ''} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label htmlFor="profileContact" className="block text-sm font-medium text-gray-700">Contact</label>
                  <input id="profileContact" name="contact" autoComplete="tel" value={profile?.contact || ''} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label htmlFor="profileAddress" className="block text-sm font-medium text-gray-700">Address</label>
                  <input id="profileAddress" name="address" autoComplete="street-address" value={profile?.address || ''} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <button 
                      type="button" 
                      onClick={addEducation}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="p-4 border rounded-lg relative">
                        {education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            aria-label="Remove education entry"
                          >
                            ×
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">School/University</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                              className="w-full border px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Degree/Certificate</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              className="w-full border px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">From</label>
                            <input
                              type="text"
                              value={edu.from}
                              onChange={(e) => handleEducationChange(index, 'from', e.target.value)}
                              placeholder="YYYY"
                              className="w-full border px-3 py-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">To</label>
                            <input
                              type="text"
                              value={edu.to}
                              onChange={(e) => handleEducationChange(index, 'to', e.target.value)}
                              placeholder="YYYY or Present"
                              className="w-full border px-3 py-2 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={saveProfile} 
                  aria-label="Save profile" 
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors mr-4"
                >
                  Save Profile
                </button>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }} 
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
          {applications.length === 0 ? (
            <p className="text-gray-600">You haven't applied to any jobs yet.</p>
          ) : (
            <ul className="space-y-3">
              {applications.map((a) => (
                <li key={a._id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{a.job.title}</div>
                      <div className="text-sm text-gray-600">{a.job.company} • {a.job.location}</div>
                    </div>
                    <div className="text-sm">Status: {a.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />
    </div>
  );
}
