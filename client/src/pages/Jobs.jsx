import { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import API_BASE from '../api.js';
import Toast from '../components/Toast.jsx';
import AuthContext from '../context/AuthContext.jsx';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const { user, token } = useContext(AuthContext);
  const location = useLocation();

  // initialize filters from URL query params (q, loc, type)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const loc = params.get('loc') || '';
    const t = params.get('type') || '';
    if (q) setSearchTerm(q);
    if (loc) setLocationFilter(loc);
    if (t) setTypeFilter(t);
  }, [location.search]);

  useEffect(() => {
    fetchJobs();
    const onJobCreated = () => fetchJobs();
    window.addEventListener('jobCreated', onJobCreated);
    return () => window.removeEventListener('jobCreated', onJobCreated);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/jobs`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected jobs response');
      }

      const backendJobs = data;
      const sampleJobs = getSampleJobs();
      const mergedJobs = [
        ...backendJobs,
        ...sampleJobs.filter((sampleJob) => !backendJobs.some((job) => job._id === sampleJob.id)),
      ];

      setJobs(mergedJobs.length > 0 ? mergedJobs : sampleJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs(getSampleJobs());
    } finally {
      setLoading(false);
    }
  };

  const getSampleJobs = () => [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Banglore, Karnataka',
      job_type: 'Full-time',
      salary_range: '₹80,000 - ₹120,000',
      description: 'We are looking for a talented Frontend Developer to join our team.',
      requirements: ['3+ years experience', 'Strong portfolio', 'Team player'],
      skills_required: ['React', 'JavaScript', 'CSS', 'HTML'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Backend Developer',
      company: 'DataSystems Inc',
      location: 'Hyderabad, Telangana',
      job_type: 'Full-time',
      salary_range: '₹90,000 - ₹130,000',
      description: 'Join our backend team to build scalable APIs and microservices.',
      requirements: ['5+ years experience', 'Database design', 'API development'],
      skills_required: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Banglore, Karnataka',
      job_type: 'Full-time',
      salary_range: '₹100,000 - ₹150,000',
      description: 'Looking for a full stack developer to work on our innovative product.',
      requirements: ['4+ years experience', 'Startup experience preferred', 'Self-motivated'],
      skills_required: ['React', 'Node.js', 'TypeScript', 'AWS'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      location: 'Chennai, Tamil Nadu',
      job_type: 'Contract',
      salary_range: '₹60,000 - ₹90,000',
      description: 'We need a creative UI/UX designer to help us redesign our product.',
      requirements: ['Portfolio required', 'User research', 'Prototyping'],
      skills_required: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Gurugram, Haryana',
      job_type: 'Full-time',
      salary_range: '₹110,000 - ₹140,000',
      description: 'Seeking experienced DevOps engineer to manage our cloud infrastructure.',
      requirements: ['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipelines'],
      skills_required: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Data Scientist',
      company: 'AI Innovations',
      location: 'Hyderabad, Telangana',
      job_type: 'Full-time',
      salary_range: '₹120,000 - ₹160,000',
      description: 'Join our data science team to work on machine learning models.',
      requirements: ['PhD or Masters preferred', 'ML experience', 'Python expert'],
      skills_required: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '7',
      title: 'QA Engineer',
      company: 'QualityWorks',
      location: 'Hyderabad, Telangana',
      job_type: 'Full-time',
      salary_range: '₹75,000 - ₹100,000',
      description: 'Responsible for designing and executing test plans for web applications.',
      requirements: ['3+ years QA', 'Automated testing experience', 'Attention to detail'],
      skills_required: ['Selenium', 'Cypress', 'JavaScript', 'Test Automation'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '8',
      title: 'Product Manager',
      company: 'MarketLead',
      location: 'Banglore, Karnataka',
      job_type: 'Full-time',
      salary_range: '₹110,000 - ₹145,000',
      description: 'Lead cross-functional teams to build and ship product features.',
      requirements: ['3+ years PM experience', 'Roadmap planning', 'Stakeholder management'],
      skills_required: ['Product Strategy', 'User Research', 'Roadmapping', 'Communication'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '9',
      title: 'Mobile Engineer (iOS)',
      company: 'AppForge',
      location: 'Jaipur, Rajasthan',
      job_type: 'Full-time',
      salary_range: '₹95,000 - ₹130,000',
      description: 'Build and maintain high-quality iOS applications with great user experience.',
      requirements: ['3+ years iOS', 'Swift expertise', 'App Store experience'],
      skills_required: ['Swift', 'Objective-C', 'iOS SDK', 'REST APIs'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10',
      title: 'Content Writer',
      company: 'WriteRight Media',
      location: 'Kochi, Kerala',
      job_type: 'Part-time',
      salary_range: '₹35,000 - ₹55,000',
      description: 'Create compelling technical and marketing content for our audience.',
      requirements: ['Strong writing skills', 'SEO knowledge', 'Portfolio required'],
      skills_required: ['SEO', 'Copywriting', 'WordPress', 'Content Strategy'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '11',
      title: 'Sales Representative',
      company: 'GrowthWave',
      location: 'Pune, Maharashtra',
      job_type: 'Hybrid',
      salary_range: '₹45,000 - ₹70,000',
      description: 'Drive business growth with strong client relationships and sales outreach.',
      requirements: ['2+ years sales experience', 'Excellent communication', 'CRM familiarity'],
      skills_required: ['Sales', 'CRM', 'Negotiation', 'Lead Generation'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '12',
      title: 'Marketing Specialist',
      company: 'BrandPulse',
      location: 'Mumbai, Maharashtra',
      job_type: 'Full-time',
      salary_range: '₹70,000 - ₹95,000',
      description: 'Create and execute campaigns that increase brand visibility and conversions.',
      requirements: ['3+ years marketing experience', 'Analytical mindset', 'Campaign management'],
      skills_required: ['SEO', 'Google Ads', 'Content Marketing', 'Analytics'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '13',
      title: 'Cybersecurity Analyst',
      company: 'SecureNet',
      location: 'Delhi, Delhi',
      job_type: 'Full-time',
      salary_range: '₹130,000 - ₹170,000',
      description: 'Protect systems and detect security threats in a fast-paced environment.',
      requirements: ['Security certifications', 'Incident response', 'Network security'],
      skills_required: ['SIEM', 'Penetration Testing', 'Risk Assessment', 'Firewalls'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '14',
      title: 'HR Manager',
      company: 'PeopleFirst',
      location: 'Bengaluru, Karnataka',
      job_type: 'Full-time',
      salary_range: '₹100,000 - ₹130,000',
      description: 'Manage recruitment, employee relations, and HR programs for a growing team.',
      requirements: ['5+ years HR experience', 'Employee engagement', 'Policy development'],
      skills_required: ['Recruitment', 'HRIS', 'Conflict Resolution', 'Employee Relations'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '15',
      title: 'Business Analyst',
      company: 'InsightWorks',
      location: 'Chennai, Tamil Nadu',
      job_type: 'Contract',
      salary_range: '₹90,000 - ₹115,000',
      description: 'Gather business requirements and help shape data-driven solutions.',
      requirements: ['Business analysis', 'Stakeholder collaboration', 'Process improvement'],
      skills_required: ['UML', 'SQL', 'Process Mapping', 'Reporting'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '16',
      title: 'Graphic Designer',
      company: 'PixelWave',
      location: 'Kochi, Kerala',
      job_type: 'Freelance',
      salary_range: '₹40,000 - ₹65,000',
      description: 'Design marketing assets, social campaigns, and visual content for our clients.',
      requirements: ['Creative portfolio', 'Brand design', 'Adobe suite expertise'],
      skills_required: ['Photoshop', 'Illustrator', 'InDesign', 'Branding'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '17',
      title: 'Cloud Solutions Architect',
      company: 'Skyline Systems',
      location: 'Noida, Uttar Pradesh',
      job_type: 'Remote',
      salary_range: '₹150,000 - ₹190,000',
      description: 'Design scalable cloud solutions and guide implementation across the platform.',
      requirements: ['Cloud architecture experience', 'AWS/GCP/Azure', 'Solution design'],
      skills_required: ['Cloud Architecture', 'Microservices', 'IaC', 'Security'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '18',
      title: 'Technical Support Engineer',
      company: 'HelpDesk Pro',
      location: 'Lucknow, Uttar Pradesh',
      job_type: 'Part-time',
      salary_range: '₹30,000 - ₹45,000',
      description: 'Provide technical support, troubleshoot issues, and deliver exceptional customer service.',
      requirements: ['Customer support experience', 'Problem solving', 'IT fundamentals'],
      skills_required: ['Troubleshooting', 'Ticketing Systems', 'Networking', 'Communication'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '19',
      title: 'Digital Marketing Manager',
      company: 'AdLaunch',
      location: 'Gurugram, Haryana',
      job_type: 'Hybrid',
      salary_range: '₹120,000 - ₹155,000',
      description: 'Lead digital campaigns, drive performance, and optimize marketing channels.',
      requirements: ['Digital marketing strategy', 'Analytics', 'Team leadership'],
      skills_required: ['Paid Media', 'SEO', 'Analytics', 'Campaign Optimization'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '20',
      title: 'Logistics Coordinator',
      company: 'ShipSmart',
      location: 'Vadodara, Gujarat',
      job_type: 'Temporary',
      salary_range: '₹50,000 - ₹70,000',
      description: 'Coordinate shipments, manage logistics partners, and ensure timely delivery.',
      requirements: ['Logistics experience', 'Attention to detail', 'Scheduling'],
      skills_required: ['Logistics', 'Supply Chain', 'Coordination', 'MS Excel'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = locationFilter
      ? job.location.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesType = typeFilter ? job.job_type === typeFilter : true;

    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Find Your Next Job</h1>
          <p className="text-lg text-gray-600">Browse through {jobs.length} available positions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="jobsSearch"
                  name="q"
                  type="text"
                  placeholder="Job title, keywords, or company"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="jobsLocation"
                  name="loc"
                  type="text"
                  placeholder="Location"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="jobTypeFilter" className="sr-only">Job type</label>
              <select
                id="jobTypeFilter"
                name="type"
                title="Filter by job type"
                aria-label="Filter by job type"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Freelance">Freelance</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id || job.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-blue-600 font-medium">{job.company}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {job.job_type}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  {(job.salary || job.salary_range) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      {job.salary || job.salary_range}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    Posted {new Date(job.createdAt || job.created_at).toLocaleDateString()}
                  </div>
                </div>

                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills_required.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <ApplyButton jobId={job._id || job.id} token={token} user={user} onToast={(t) => setToast(t)} />
              </div>
            ))}
          </div>
        )}
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />
      </div>
    </div>
  );
}

function ApplyButton({ jobId, token, user, onToast }) {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <button onClick={handleApply} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
      Apply Now
    </button>
  );
}
// Note: Toasts for apply button are rendered at page root from state
