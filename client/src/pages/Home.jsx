import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loc, setLoc] = useState('');
  const [token, setToken] = useState(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  // NOTE: search should be usable by visitors — only some actions require registering

  // handle search submit from hero
  const handleSearch = (e) => {
    e?.preventDefault?.();
    const q = (query || '').toString().trim();
    const l = (loc || '').toString().trim();
    if (!q) {
      // show inline error if user didn't type anything (or only whitespace)
      setSearchError('Please enter a job title, keyword, or company');
      return;
    }
    setSearchError('');
    const params = new URLSearchParams();
    params.set('q', q);
    if (l) params.set('loc', l);
    navigate(`/jobs?${params.toString()}`);
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Dream Job Today
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              <span className="block">Connect with top employers and discover opportunities</span>
              <span className="block">that match your skills and passion</span>
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto" aria-label="Job search form">
              <input
                id="heroQuery"
                name="q"
                type="text"
                placeholder="Job title, keywords..."
                autoComplete="off"
                className="flex-1 px-4 py-3 text-gray-900 rounded-md focus:outline-none"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searchError) setSearchError('');
                }}
              />
              <input
                id="heroLocation"
                name="loc"
                type="text"
                placeholder="Location"
                autoComplete="off"
                className="flex-1 px-4 py-3 text-gray-900 rounded-md focus:outline-none"
                value={loc}
                onChange={(e) => {
                  setLoc(e.target.value);
                  if (searchError) setSearchError('');
                }}
              />
              <button type="submit" aria-label="Search jobs" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </form>
            {searchError && (
              <div className="mt-2 text-sm text-white text-left max-w-2xl mx-auto">{searchError}</div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Briefcase className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Active Jobs</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Registered Users</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">5,000+</h3>
              <p className="text-gray-600">Companies Hiring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Job Openings
            </h2>
            <p className="text-lg text-gray-600">
              Explore the latest opportunities from top companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: 'Frontend Developer',
                company: 'TechCorp',
                location: 'Banglore, Karnataka',
                type: 'Full-time',
                salary: '₹80,000 - ₹120,000',
              },
              {
                title: 'Backend Developer',
                company: 'DataSystems Inc',
                location: 'Hyderabad, Telangana',
                type: 'Full-time',
                salary: '₹90,000 - ₹130,000',
              },
              {
                title: 'Full Stack Developer',
                company: 'StartupXYZ',
                location: 'Pune, Maharashtra',
                type: 'Full-time',
                salary: '₹100,000 - ₹150,000',
              },
            ].map((job, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-blue-600 font-medium mb-3">{job.company}</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>{job.location}</p>
                  <p>{job.type}</p>
                  <p className="font-semibold text-gray-900">{job.salary}</p>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                // if not registered / logged in, send to register
                if (!token) return navigate('/register');
                navigate('/jobs');
              }}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              <span>View All Jobs</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up for free and create your professional profile in minutes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Resume</h3>
              <p className="text-gray-600">
                Upload your resume and let our AI match you with relevant jobs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Apply & Get Hired</h3>
              <p className="text-gray-600">
                Apply to jobs with one click and connect with employers directly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - only show to visitors (not logged-in users) */}
      {!token && (
        <section className="py-16 bg-blue-600 text-white px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-lg mb-8 text-blue-100">
              Join thousands of job seekers who found their dream job through JobNestle
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors text-lg font-semibold"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
