
export const internshipPlatforms = [
  { name: 'LinkedIn Jobs', source: 'linkedin' },
  { name: 'Indeed Singapore', source: 'indeed' },
  { name: 'JobsBank Singapore', source: 'jobsbank' },
  { name: 'MyCareersFuture', source: 'mycareersfuture' },
  { name: 'Glassdoor', source: 'glassdoor' },
  { name: 'Company Websites', source: 'direct' }
];

export const dummyInternships = [
  {//software intern
    id: 1,
    title: 'Software Engineering Intern',
    company: 'TechCorp Singapore',
    location: 'Singapore',
    stipend: 'S$1,200/month',
    duration: '3 months',
    category: 'technology',
    match: 92,
    logo: '💻',
    description: 'Build innovative web applications using React and Node.js. Work with senior developers on real-world projects that impact thousands of users.',
    deadline: '15/08/2025',
    postedDate: '01/05/2025',
    skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Git'],
    requirements: [
      'Currently pursuing Computer Science or related field',
      'Experience with JavaScript and modern web frameworks',
      'Strong problem-solving skills',
      'Team collaboration experience'
    ],
    benefits: [
      'Mentorship from senior engineers',
      'Flexible working hours',
      'Learning budget for courses',
      'Free meals and snacks'
    ],
    source: 'linkedin',
    applicationCount: 45,
    companySize: '201-500 employees',
    industry: 'Technology'
  },
  {//backend developer
    id: 2,
    title: 'Backend Developer Intern',
    company: 'CloudTech Solutions',
    location: 'Singapore',
    stipend: 'S$1,300/month',
    duration: '4 months',
    category: 'technology',
    match: 89,
    logo: '⚙️',
    description: 'Develop scalable backend systems and APIs using Python and cloud technologies. Gain hands-on experience with microservices architecture.',
    deadline: '18/08/2025',
    postedDate: '02/05/2025',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    requirements: [
      'Knowledge of Python programming',
      'Understanding of databases and SQL',
      'Interest in cloud computing',
      'Good communication skills'
    ],
    benefits: [
      'AWS certification support',
      'Remote work options',
      'Healthcare coverage',
      'Professional development workshops'
    ],
    source: 'indeed',
    applicationCount: 67,
    companySize: '51-200 employees',
    industry: 'Cloud Services'
  },
  {//frontend developer
    id: 3,
    title: 'Frontend Developer Intern',
    company: 'Digital Innovations Lab',
    location: 'Singapore',
    stipend: 'S$1,100/month',
    duration: '3 months',
    category: 'technology',
    match: 85,
    logo: '🎨',
    description: 'Create engaging and responsive user interfaces using modern frontend technologies. Work on cutting-edge web applications.',
    deadline: '22/08/2025',
    postedDate: '08/05/2025',
    skills: ['Vue.js', 'TypeScript', 'CSS3', 'HTML5', 'Figma'],
    requirements: [
      'Experience with JavaScript frameworks',
      'Understanding of responsive design',
      'Eye for design and user experience',
      'Portfolio of web projects'
    ],
    benefits: [
      'Design software licenses',
      'Flexible schedule',
      'Mentorship program',
      'Team building events'
    ],
    source: 'jobsbank',
    applicationCount: 38,
    companySize: '11-50 employees',
    industry: 'Digital Agency'
  },
  {//mobile app developer
    id: 4,
    title: 'Mobile App Developer Intern',
    company: 'MobileTech Singapore',
    location: 'Singapore',
    stipend: 'S$1,150/month',
    duration: '3 months',
    category: 'technology',
    match: 83,
    logo: '📱',
    description: 'Develop cross-platform mobile applications using React Native. Contribute to apps used by millions of users across Southeast Asia.',
    deadline: '28/08/2025',
    postedDate: '12/05/2025',
    skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Firebase'],
    requirements: [
      'Experience with React or React Native',
      'Understanding of mobile development concepts',
      'Published app on App Store or Play Store (preferred)',
      'Creative problem-solving abilities'
    ],
    benefits: [
      'Latest mobile devices for testing',
      'App Store developer accounts',
      'Agile development experience',
      'Networking opportunities'
    ],
    source: 'mycareersfuture',
    applicationCount: 52,
    companySize: '101-200 employees',
    industry: 'Mobile Technology'
  },

  {//data science 
    id: 5,
    title: 'Data Science Intern',
    company: 'Analytics Plus',
    location: 'Singapore',
    stipend: 'S$1,100/month',
    duration: '6 months',
    category: 'data',
    match: 87,
    logo: '📊',
    description: 'Analyze large datasets and create machine learning models to drive business insights. Work with real customer data and advanced analytics tools.',
    deadline: '20/8/2025',
    postedDate: '03/05/2025',
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Tableau'],
    requirements: [
      'Strong background in statistics or mathematics',
      'Experience with Python and data libraries',
      'Knowledge of machine learning concepts',
      'Analytical thinking and attention to detail'
    ],
    benefits: [
      'Access to premium data tools',
      'Machine learning courses',
      'Conference attendance',
      'Data science community access'
    ],
    source: 'glassdoor',
    applicationCount: 73,
    companySize: '201-500 employees',
    industry: 'Data Analytics'
  },
  {//ai research
    id: 6,
    title: 'AI Research Intern',
    company: 'NUS AI Lab',
    location: 'Singapore',
    stipend: 'S$800/month',
    duration: '4 months',
    category: 'data',
    match: 91,
    logo: '🤖',
    description: 'Conduct research in artificial intelligence and machine learning. Contribute to cutting-edge research papers and innovative AI solutions.',
    deadline: '25/08/2025',
    postedDate: '06/05/2025',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Research', 'Deep Learning'],
    requirements: [
      'Pursuing PhD or Masters in AI/ML related field',
      'Strong mathematical background',
      'Research experience preferred',
      'Publication record is a plus'
    ],
    benefits: [
      'Research publication opportunities',
      'Conference presentation chances',
      'Access to high-performance computing',
      'Academic networking'
    ],
    source: 'direct',
    applicationCount: 29,
    companySize: '1000+ employees',
    industry: 'Research & Education'
  },

  {//ux design
    id: 7,
    title: 'UX Design Intern',
    company: 'Design Studio',
    location: 'Singapore',
    stipend: 'S$1,100/month',
    duration: '3 months',
    category: 'design',
    match: 81,
    logo: '🎨',
    description: 'Design user experiences for mobile and web applications. Work with product teams to create intuitive and beautiful interfaces.',
    deadline: '25/08/2025',
    postedDate: '05/05/2025',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Adobe Creative Suite'],
    requirements: [
      'Portfolio showcasing design projects',
      'Experience with design tools (Figma, Sketch)',
      'Understanding of user-centered design',
      'Strong visual communication skills'
    ],
    benefits: [
      'Design software subscriptions',
      'Portfolio development support',
      'Design conference tickets',
      'Creative workspace environment'
    ],
    source: 'linkedin',
    applicationCount: 41,
    companySize: '11-50 employees',
    industry: 'Design Agency'
  },
  {//graphic design
    id: 8,
    title: 'Graphic Design Intern',
    company: 'Creative Minds Agency',
    location: 'Singapore',
    stipend: 'S$900/month',
    duration: '3 months',
    category: 'design',
    match: 76,
    logo: '🖼️',
    description: 'Create visual content for digital and print media. Work on branding projects for diverse clients across various industries.',
    deadline: '30/08/2025',
    postedDate: '09/05/2025',
    skills: ['Adobe Photoshop', 'Adobe Illustrator', 'InDesign', 'Branding', 'Typography'],
    requirements: [
      'Proficiency in Adobe Creative Suite',
      'Strong portfolio of graphic design work',
      'Understanding of typography and color theory',
      'Creativity and attention to detail'
    ],
    benefits: [
      'Adobe Creative Cloud license',
      'Print production experience',
      'Client interaction opportunities',
      'Creative team collaboration'
    ],
    source: 'indeed',
    applicationCount: 34,
    companySize: '11-50 employees',
    industry: 'Creative Agency'
  },

  {//digital marketing
    id: 9,
    title: 'Digital Marketing Intern',
    company: 'Marketing Innovations',
    location: 'Singapore',
    stipend: 'S$1,000/month',
    duration: '4 months',
    category: 'marketing',
    match: 78,
    logo: '📈',
    description: 'Execute digital marketing campaigns across social media, email, and web platforms. Analyze campaign performance and optimize for better results.',
    deadline: '15/07/2025',
    postedDate: '15/05/2025',
    skills: ['Social Media Marketing', 'Google Analytics', 'Content Creation', 'SEO', 'Email Marketing'],
    requirements: [
      'Knowledge of social media platforms',
      'Basic understanding of digital marketing',
      'Strong writing and communication skills',
      'Analytical mindset'
    ],
    benefits: [
      'Google Ads certification',
      'Social media management tools',
      'Marketing conference access',
      'Campaign management experience'
    ],
    source: 'jobsbank',
    applicationCount: 56,
    companySize: '51-200 employees',
    industry: 'Marketing & Advertising'
  },
  {//content marketing
    id: 10,
    title: 'Content Marketing Intern',
    company: 'Content Creators Hub',
    location: 'Singapore',
    stipend: 'S$950/month',
    duration: '3 months',
    category: 'marketing',
    match: 72,
    logo: '✍️',
    description: 'Create engaging content for blogs, social media, and marketing materials. Develop content strategies that drive audience engagement.',
    deadline: '20/07/2025',
    postedDate: '18/05/2025',
    skills: ['Content Writing', 'SEO', 'Social Media', 'WordPress', 'Canva'],
    requirements: [
      'Excellent writing skills in English',
      'Experience with content management systems',
      'Understanding of SEO principles',
      'Creative storytelling abilities'
    ],
    benefits: [
      'Content creation tools access',
      'Writing workshop participation',
      'Published portfolio building',
      'Editorial process learning'
    ],
    source: 'mycareersfuture',
    applicationCount: 42,
    companySize: '11-50 employees',
    industry: 'Content & Media'
  },

  {//biz development
    id: 11,
    title: 'Business Development Intern',
    company: 'Growth Ventures',
    location: 'Singapore',
    stipend: 'S$1,200/month',
    duration: '4 months',
    category: 'business',
    match: 79,
    logo: '📊',
    description: 'Support business development initiatives and market research. Analyze market trends and identify new business opportunities.',
    deadline: '10/07/2025',
    postedDate: '20/05/2025',
    skills: ['Business Analysis', 'Market Research', 'Excel', 'PowerPoint', 'Communication'],
    requirements: [
      'Pursuing business or related degree',
      'Strong analytical and research skills',
      'Excellent presentation abilities',
      'Interest in startup environment'
    ],
    benefits: [
      'Startup ecosystem exposure',
      'Business strategy learning',
      'Networking events access',
      'Mentorship from executives'
    ],
    source: 'glassdoor',
    applicationCount: 38,
    companySize: '11-50 employees',
    industry: 'Business Development'
  },
  {//product management
    id: 12,
    title: 'Product Management Intern',
    company: 'Innovation Labs',
    location: 'Singapore',
    stipend: 'S$1,300/month',
    duration: '5 months',
    category: 'business',
    match: 82,
    logo: '📋',
    description: 'Work with product teams to define and launch new features. Conduct user research and analyze product metrics to drive decisions.',
    deadline: '05/07/2025',
    postedDate: '22/05/2025',
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Wireframing', 'Agile'],
    requirements: [
      'Interest in product management',
      'Analytical thinking skills',
      'Experience with user research methods',
      'Strong communication and collaboration'
    ],
    benefits: [
      'Product management mentorship',
      'User research training',
      'Product launch experience',
      'Cross-functional team exposure'
    ],
    source: 'direct',
    applicationCount: 49,
    companySize: '101-200 employees',
    industry: 'Product Development'
  },

  {//finance analyst
    id: 13,
    title: 'Financial Analyst Intern',
    company: 'InvestCorp Singapore',
    location: 'Singapore',
    stipend: 'S$1,400/month',
    duration: '6 months',
    category: 'finance',
    match: 84,
    logo: '💰',
    description: 'Conduct financial analysis and support investment decisions. Work with senior analysts on market research and financial modeling.',
    deadline: '12/08/2025',
    postedDate: '15/04/2025',
    skills: ['Financial Modeling', 'Excel', 'Bloomberg Terminal', 'Research', 'PowerPoint'],
    requirements: [
      'Pursuing finance or economics degree',
      'Strong Excel and analytical skills',
      'Interest in financial markets',
      'Attention to detail and accuracy'
    ],
    benefits: [
      'Bloomberg terminal access',
      'Financial modeling training',
      'Industry networking events',
      'Potential full-time offer'
    ],
    source: 'linkedin',
    applicationCount: 87,
    companySize: '501-1000 employees',
    industry: 'Financial Services'
  },
  {//investment banker
    id: 14,
    title: 'Investment Banking Intern',
    company: 'Asia Capital Partners',
    location: 'Singapore',
    stipend: 'S$1,600/month',
    duration: '3 months',
    category: 'finance',
    match: 86,
    logo: '🏦',
    description: 'Support deal execution and financial analysis for M&A transactions. Gain exposure to investment banking operations in Asia.',
    deadline: '08/08/2025',
    postedDate: '10/04/2025',
    skills: ['Financial Analysis', 'Valuation', 'Excel', 'PowerPoint', 'Capital Markets'],
    requirements: [
      'Top-tier university with high GPA',
      'Strong quantitative and analytical skills',
      'Previous finance internship preferred',
      'Ability to work long hours'
    ],
    benefits: [
      'High-profile deal exposure',
      'Senior banker mentorship',
      'Financial markets training',
      'Competitive compensation'
    ],
    source: 'glassdoor',
    applicationCount: 156,
    companySize: '201-500 employees',
    industry: 'Investment Banking'
  },

  {//engineering
    id: 15,
    title: 'Mechanical Engineering Intern',
    company: 'Engineering Solutions',
    location: 'Singapore',
    stipend: 'S$1,100/month',
    duration: '4 months',
    category: 'engineering',
    match: 77,
    logo: '⚙️',
    description: 'Work on mechanical design projects and assist with product development. Gain hands-on experience with CAD software and manufacturing processes.',
    deadline: '30/08/2025',
    postedDate: '25/05/2025',
    skills: ['CAD', 'SolidWorks', 'Manufacturing', 'Project Management', 'Problem Solving'],
    requirements: [
      'Pursuing mechanical engineering degree',
      'Experience with CAD software',
      'Strong problem-solving skills',
      'Interest in manufacturing processes'
    ],
    benefits: [
      'CAD software training',
      'Manufacturing facility tours',
      'Professional engineer mentorship',
      'Project portfolio development'
    ],
    source: 'jobsbank',
    applicationCount: 31,
    companySize: '101-200 employees',
    industry: 'Engineering & Manufacturing'
  }
];

//simulated API response structure
export const simulateAPIResponse = (platform, category = null, searchTerm = null) => {
  let filteredInternships = dummyInternships.filter(internship => 
    internship.source === platform
  );

  if (category && category !== 'all') {
    filteredInternships = filteredInternships.filter(internship => 
      internship.category === category
    );
  }

  if (searchTerm) {
    filteredInternships = filteredInternships.filter(internship =>
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  return {
    success: true,
    platform: platform,
    totalResults: filteredInternships.length,
    data: filteredInternships,
    lastUpdated: new Date().toISOString(),
    searchQuery: searchTerm || null,
    category: category || 'all'
  };
};

//simulate web scraping results from multiple platforms
export const simulateWebScrapingResults = () => {
  const platforms = ['linkedin', 'indeed', 'jobsbank', 'mycareersfuture'];
  const results = {};

  platforms.forEach(platform => {
    results[platform] = simulateAPIResponse(platform);
  });

  return {
    success: true,
    scrapedAt: new Date().toISOString(),
    totalInternships: dummyInternships.length,
    platforms: platforms,
    results: results
  };
};

//categories for filtering
export const internshipCategories = [
  { id: 'all', name: 'All Categories', icon: '🌟', count: dummyInternships.length },
  { id: 'technology', name: 'Technology', icon: '💻', count: dummyInternships.filter(i => i.category === 'technology').length },
  { id: 'data', name: 'Data Science', icon: '📊', count: dummyInternships.filter(i => i.category === 'data').length },
  { id: 'design', name: 'Design', icon: '🎨', count: dummyInternships.filter(i => i.category === 'design').length },
  { id: 'marketing', name: 'Marketing', icon: '📈', count: dummyInternships.filter(i => i.category === 'marketing').length },
  { id: 'business', name: 'Business', icon: '📋', count: dummyInternships.filter(i => i.category === 'business').length },
  { id: 'finance', name: 'Finance', icon: '💰', count: dummyInternships.filter(i => i.category === 'finance').length },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', count: dummyInternships.filter(i => i.category === 'engineering').length }
];

export const calculateMatchScore = (userProfile, internship) => {
  let score = 0;
  
  // Skill matching (40% weight)
  const userSkills = userProfile.skills || [];
  const internshipSkills = internship.skills || [];
  const skillMatches = userSkills.filter(skill => 
    internshipSkills.some(intSkill => 
      intSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(intSkill.toLowerCase())
    )
  );
  score += (skillMatches.length / Math.max(internshipSkills.length, 1)) * 40;

  // Category preference (30% weight)
  if (userProfile.preferredCategories && userProfile.preferredCategories.includes(internship.category)) {
    score += 30;
  }

  // Location preference (20% weight)
  if (userProfile.location === internship.location) {
    score += 20;
  }

  // Experience level (10% weight)
  if (userProfile.experienceLevel === 'beginner' && internship.requirements.some(req => 
    req.toLowerCase().includes('entry') || req.toLowerCase().includes('beginner')
  )) {
    score += 10;
  }

  return Math.min(Math.round(score), 100);
};

export default dummyInternships;

//ms2 final