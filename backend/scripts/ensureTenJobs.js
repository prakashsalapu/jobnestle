const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../src/models/Job');

dotenv.config();

const moreJobs = [
  {
    title: 'QA Engineer',
    company: 'QualityWorks',
    location: 'Hyderabad, Telangana',
    job_type: 'Full-time',
    salary_range: '₹75,000 - ₹100,000',
    description: 'Responsible for designing and executing test plans for web applications.',
    requirements: ['3+ years QA', 'Automated testing experience', 'Attention to detail'],
    skills_required: ['Selenium', 'Cypress', 'JavaScript', 'Test Automation'],
    is_active: true,
  },
  {
    title: 'Product Manager',
    company: 'MarketLead',
    location: 'Banglore, Karnataka',
    job_type: 'Full-time',
    salary_range: '₹110,000 - ₹145,000',
    description: 'Lead cross-functional teams to build and ship product features.',
    requirements: ['3+ years PM experience', 'Roadmap planning', 'Stakeholder management'],
    skills_required: ['Product Strategy', 'User Research', 'Roadmapping', 'Communication'],
    is_active: true,
  },
  {
    title: 'Mobile Engineer (iOS)',
    company: 'AppForge',
    location: 'Jaipur, Rajasthan',
    job_type: 'Full-time',
    salary_range: '₹95,000 - ₹130,000',
    description: 'Build and maintain high-quality iOS applications with great user experience.',
    requirements: ['3+ years iOS', 'Swift expertise', 'App Store experience'],
    skills_required: ['Swift', 'Objective-C', 'iOS SDK', 'REST APIs'],
    is_active: true,
  },
  {
    title: 'Content Writer',
    company: 'WriteRight Media',
    location: 'Kochi, Kerala',
    job_type: 'Part-time',
    salary_range: '₹35,000 - ₹55,000',
    description: 'Create compelling technical and marketing content for our audience.',
    requirements: ['Strong writing skills', 'SEO knowledge', 'Portfolio required'],
    skills_required: ['SEO', 'Copywriting', 'WordPress', 'Content Strategy'],
    is_active: true,
  },
  {
    title: 'System Administrator',
    company: 'EnterpriseOps',
    location: 'Mumbai, Maharashtra',
    job_type: 'Full-time',
    salary_range: '₹65,000 - ₹95,000',
    description: 'Maintain and monitor server infrastructure and networking.',
    requirements: ['Linux experience', 'Networking', 'Shell scripting'],
    skills_required: ['Linux', 'Bash', 'Networking', 'Monitoring'],
    is_active: true,
  },
];

async function ensure() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
  const count = await Job.countDocuments({ is_active: true });
  console.log('active jobs count:', count);
  if (count >= 10) {
    console.log('Already have 10 or more jobs.');
    process.exit(0);
  }
  const need = 10 - count;
  console.log('Inserting', need, 'jobs');
  await Job.insertMany(moreJobs.slice(0, need));
  console.log('Inserted additional jobs');
  process.exit(0);
}

ensure().catch((e) => { console.error(e); process.exit(1); });
