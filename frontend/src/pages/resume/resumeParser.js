<<<<<<< HEAD
// resumeParser.js - Utility for parsing resume data

/**
 * Parses resume text/data and extracts structured information
 * @param {string} resumeText - Raw resume text
 * @param {Object} resumeFile - Optional file object with metadata
 * @returns {Object} Parsed resume data
 */
=======
/* Milestone 3 

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export function parseResumeText(resumeText, resumeFile = null) {
  const parsedData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    designation: '',
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    languages: []
  };

  if (!resumeText) return parsedData;

  try {
    // Extract name (usually first line or after "Name:")
    const nameMatch = resumeText.match(/(?:Name[:\s]+)?([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (nameMatch) {
      parsedData.name = nameMatch[1].trim();
    }

    // Extract email
    const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      parsedData.email = emailMatch[1];
    }

    // Extract phone number
    const phoneMatch = resumeText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      parsedData.phone = phoneMatch[1];
    }

<<<<<<< HEAD
    // Extract address (basic pattern)
=======
    // Extract address 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
    const addressMatch = resumeText.match(/(?:Address[:\s]+)?([0-9]+\s+[A-Za-z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)[A-Za-z\s,0-9]*)/i);
    if (addressMatch) {
      parsedData.address = addressMatch[1].trim();
    }

    // Extract designation/title
    const designationMatch = resumeText.match(/(?:Title|Position|Role)[:\s]+([A-Za-z\s]+)(?:\n|$)/i) ||
                             resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Developer|Engineer|Manager|Analyst|Designer|Specialist)))/m);
    if (designationMatch) {
      parsedData.designation = designationMatch[1].trim();
    }

    // Extract education
    const educationSection = extractSection(resumeText, 'education');
    if (educationSection) {
      parsedData.education = parseEducation(educationSection);
    }

    // Extract experience
    const experienceSection = extractSection(resumeText, 'experience') || 
                             extractSection(resumeText, 'work history') ||
                             extractSection(resumeText, 'employment');
    if (experienceSection) {
      parsedData.experience = parseExperience(experienceSection);
    }

    // Extract skills
    const skillsSection = extractSection(resumeText, 'skills') ||
                         extractSection(resumeText, 'technical skills') ||
                         extractSection(resumeText, 'competencies');
    if (skillsSection) {
      parsedData.skills = parseSkills(skillsSection);
    }

    // Extract certifications
    const certSection = extractSection(resumeText, 'certifications') ||
                       extractSection(resumeText, 'certificates');
    if (certSection) {
      parsedData.certifications = parseCertifications(certSection);
    }

    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    return parsedData;
  }
}

<<<<<<< HEAD
/**
 * Extracts a specific section from resume text
 * @param {string} text - Resume text
 * @param {string} sectionName - Section to extract
 * @returns {string|null} Section content
 */
=======
//Extracts a specific section from resume text

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function extractSection(text, sectionName) {
  const regex = new RegExp(`(?:^|\\n)\\s*${sectionName}[:\n]([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Za-z\\s]+:|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

<<<<<<< HEAD
/**
 * Parses education section
 * @param {string} educationText - Education section text
 * @returns {Array} Array of education objects
 */
=======

 //Parses education section
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function parseEducation(educationText) {
  const education = [];
  const lines = educationText.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const eduItem = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      year: '',
      gpa: ''
    };

    // Extract degree and institution
    const degreeMatch = line.match(/(Bachelor|Master|PhD|Associate|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)[^,\n]*(?:,\s*([^,\n]+))?/i);
    if (degreeMatch) {
      eduItem.degree = degreeMatch[0].trim();
      if (degreeMatch[2]) {
        eduItem.institution = degreeMatch[2].trim();
      }
    }

    // Extract year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      eduItem.year = yearMatch[0];
    }

    // Extract GPA
    const gpaMatch = line.match(/GPA[:\s]*([0-9.]+)/i);
    if (gpaMatch) {
      eduItem.gpa = gpaMatch[1];
    }

    if (eduItem.degree || eduItem.institution) {
      education.push(eduItem);
    }
  }

  return education.length > 0 ? education : [{
    institution: '',
    degree: '',
    fieldOfStudy: '',
    year: '',
    gpa: ''
  }];
}

<<<<<<< HEAD
/**
 * Parses experience section
 * @param {string} experienceText - Experience section text
 * @returns {Array} Array of experience objects
 */
=======

 //Parses experience section

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function parseExperience(experienceText) {
  const experience = [];
  const jobBlocks = experienceText.split(/\n\s*\n/).filter(block => block.trim());

  for (const block of jobBlocks) {
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;

    const expItem = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      currentJob: false
    };

    // First line usually contains position and company
    const firstLine = lines[0];
    const positionCompanyMatch = firstLine.match(/^([^,\n]+)(?:,\s*|\s+at\s+)([^,\n]+)/i);
    
    if (positionCompanyMatch) {
      expItem.position = positionCompanyMatch[1].trim();
      expItem.company = positionCompanyMatch[2].trim();
    } else {
      expItem.position = firstLine.trim();
    }

    // Look for dates
    const dateMatch = block.match(/(\d{4}|\w+\s+\d{4})\s*[-–]\s*(\d{4}|\w+\s+\d{4}|Present)/i);
    if (dateMatch) {
      expItem.startDate = dateMatch[1];
      expItem.endDate = dateMatch[2];
      expItem.currentJob = dateMatch[2].toLowerCase() === 'present';
    }

    // Description (remaining lines)
    if (lines.length > 1) {
      expItem.description = lines.slice(1).join(' ').trim();
    }

    if (expItem.position || expItem.company) {
      experience.push(expItem);
    }
  }

  return experience.length > 0 ? experience : [{
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    currentJob: false
  }];
}

<<<<<<< HEAD
/**
 * Parses skills section
 * @param {string} skillsText - Skills section text
 * @returns {Array} Array of skills
 */
=======

 //Parses skills section

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function parseSkills(skillsText) {
  const skills = [];
  
  // Split by common delimiters
  const skillItems = skillsText
    .split(/[,\n•·\-\*]/)
    .map(skill => skill.trim())
    .filter(skill => skill && skill.length > 1);

  return skillItems.length > 0 ? skillItems : [];
}

<<<<<<< HEAD
/**
 * Parses certifications section
 * @param {string} certText - Certifications section text
 * @returns {Array} Array of certifications
 */
=======

// Parses certifications section

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function parseCertifications(certText) {
  const certifications = [];
  const lines = certText.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const cert = {
      name: '',
      issuer: '',
      year: ''
    };

    // Extract certification name and issuer
    const certMatch = line.match(/^([^,\n]+)(?:,\s*([^,\n]+))?/);
    if (certMatch) {
      cert.name = certMatch[1].trim();
      if (certMatch[2]) {
        cert.issuer = certMatch[2].trim();
      }
    }

    // Extract year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      cert.year = yearMatch[0];
    }

    if (cert.name) {
      certifications.push(cert);
    }
  }

  return certifications;
}

<<<<<<< HEAD
/**
 * Validates parsed resume data
 * @param {Object} parsedData - Parsed resume data
 * @returns {Object} Validation results
 */
=======
// Validates parsed resume data

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export function validateResumeData(parsedData) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check required fields
  if (!parsedData.name) {
    validation.warnings.push('Name not found in resume');
  }

  if (!parsedData.email) {
    validation.errors.push('Email address not found');
    validation.isValid = false;
  }

  if (!parsedData.phone) {
    validation.warnings.push('Phone number not found');
  }

  if (!parsedData.experience || parsedData.experience.length === 0) {
    validation.warnings.push('No work experience found');
  }

  if (!parsedData.education || parsedData.education.length === 0) {
    validation.warnings.push('No education information found');
  }

  return validation;
}

<<<<<<< HEAD
/**
 * Processes uploaded resume file
 * @param {File} file - Resume file
 * @returns {Promise<Object>} Parsed resume data
 */
=======

 // Processes uploaded resume file
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export async function processResumeFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const allowedTypes = [
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.');
  }

  try {
    let text = '';
    
    if (file.type === 'text/plain') {
      text = await file.text();
    } else {
<<<<<<< HEAD
      // For PDF and DOC files, you would need additional libraries
      // This is a placeholder for actual file processing
=======
      // placeholder for actual file processing
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
      text = await extractTextFromFile(file);
    }

    return parseResumeText(text, file);
  } catch (error) {
    console.error('Error processing resume file:', error);
    throw new Error('Failed to process resume file');
  }
}

<<<<<<< HEAD
/**
 * Placeholder for actual file text extraction
 * In a real implementation, you would use libraries like:
 * - pdf-parse for PDFs
 * - mammoth for DOCX files
 * @param {File} file - File to extract text from
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromFile(file) {
  // This is a placeholder - actual implementation would depend on file type
  // and chosen libraries for text extraction
=======
async function extractTextFromFile(file) {
  //  placeholder 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Sample extracted text from ' + file.name);
    }, 1000);
  });
<<<<<<< HEAD
}
=======
}

*/
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
