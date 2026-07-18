const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
const expiresIn = (days) => new Date(Date.now() + days * 86400000).toISOString();

const catalog = {
  linkedin: [
    { id: 'li-fullstack-001', position: 'Full Stack Developer', employer: 'Orbit Labs', city: 'Bengaluru', country: 'India', mode: 'Hybrid', salary: [1200000, 1900000], currency: 'INR', experience: [3, 6], skills: ['React', 'Node.js', 'MongoDB', 'Docker'], type: 'Full-time', industry: 'Software', description: 'Build reliable SaaS products across React and Node.js services.', responsibilities: ['Develop product features', 'Review code and improve reliability'], requirements: ['Strong JavaScript fundamentals', 'Experience with REST APIs'], benefits: ['Flexible hours', 'Health insurance'], posted: daysAgo(2), expires: expiresIn(28) },
  ],
  indeed: [
    { id: 'in-backend-001', position: 'Backend Engineer', employer: 'Cloud Harbor', city: 'Remote', country: 'India', mode: 'Remote', salary: [1400000, 2200000], currency: 'INR', experience: [3, 7], skills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'], type: 'Full-time', industry: 'Cloud Services', description: 'Design scalable backend services and cloud infrastructure.', responsibilities: ['Own backend services', 'Improve API performance'], requirements: ['Production Node.js experience', 'Cloud platform knowledge'], benefits: ['Remote work', 'Learning budget'], posted: daysAgo(1), expires: expiresIn(30) },
  ],
  naukri: [
    { id: 'nk-frontend-001', position: 'React Frontend Engineer', employer: 'Pixel Works', city: 'Pune', country: 'India', mode: 'Hybrid', salary: [900000, 1500000], currency: 'INR', experience: [2, 5], skills: ['React', 'TypeScript', 'CSS', 'Jest'], type: 'Full-time', industry: 'Technology', description: 'Create accessible and responsive web experiences.', responsibilities: ['Build reusable interfaces', 'Maintain frontend tests'], requirements: ['React expertise', 'Responsive design experience'], benefits: ['Hybrid work', 'Annual bonus'], posted: daysAgo(4), expires: expiresIn(25) },
  ],
  internshala: [
    { id: 'is-web-intern-001', position: 'Web Development Intern', employer: 'Launch Pad', city: 'Remote', country: 'India', mode: 'Remote', salary: [240000, 360000], currency: 'INR', experience: [0, 1], skills: ['JavaScript', 'React', 'Git'], type: 'Internship', industry: 'Education Technology', description: 'Work with mentors to deliver web product improvements.', responsibilities: ['Implement scoped features', 'Participate in code reviews'], requirements: ['JavaScript basics', 'Portfolio or coursework'], benefits: ['Mentorship', 'Completion certificate'], posted: daysAgo(3), expires: expiresIn(20) },
  ],
  wellfound: [
    { id: 'wf-platform-001', position: 'Platform Engineer', employer: 'Seed Stack', city: 'Mumbai', country: 'India', mode: 'Hybrid', salary: [1800000, 2800000], currency: 'INR', experience: [4, 8], skills: ['Kubernetes', 'AWS', 'Terraform', 'Go'], type: 'Full-time', industry: 'FinTech', description: 'Build the platform used by product teams at a growing startup.', responsibilities: ['Operate Kubernetes', 'Automate cloud infrastructure'], requirements: ['Infrastructure as code', 'Strong operational practices'], benefits: ['Employee stock options', 'Flexible leave'], posted: daysAgo(2), expires: expiresIn(35) },
  ],
  'company-career': [
    { id: 'cc-data-001', position: 'Data Analyst', employer: 'Northstar Retail', city: 'Hyderabad', country: 'India', mode: 'Onsite', salary: [800000, 1300000], currency: 'INR', experience: [2, 5], skills: ['SQL', 'Python', 'Power BI', 'Excel'], type: 'Full-time', industry: 'Retail', description: 'Translate commercial data into clear business decisions.', responsibilities: ['Build dashboards', 'Analyze performance trends'], requirements: ['Advanced SQL', 'Clear communication'], benefits: ['Health insurance', 'Transport allowance'], posted: daysAgo(5), expires: expiresIn(22) },
  ],
};

export const getMockJobs = (source) => catalog[source].map((job) => ({ ...job, source, applyLink: `https://jobs.example.com/${source}/${job.id}`, logo: '' }));
