<<<<<<< HEAD
// autofillUtils.js - Utility functions for autofilling form data from parsed resume

/**
 * Autofills form data from parsed resume data
 * @param {Object} parsedData - Parsed resume data
 * @param {Object} currentFormData - Current form data state
 * @returns {Object} Updated form data
 */
=======
/* Milestone 3
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976

export async function submitApplication(formData) {
  console.log('Submitting application data:', formData);

  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Application submitted successfully!');
      resolve({ success: true });
    }, 1500);
  });
}

export function autofillFromResumeData(parsedData, currentFormData) {
  if (!parsedData) return currentFormData;

  // Parse name into first and last name
  const nameParts = parsedData.name ? parsedData.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const updatedFormData = {
    ...currentFormData,
    personalInfo: {
      ...currentFormData.personalInfo,
      firstName,
      lastName,
      email: parsedData.email || currentFormData.personalInfo.email,
      phone: parsedData.phone || currentFormData.personalInfo.phone,
      address: parsedData.address || currentFormData.personalInfo.address,
    },
    jobInfo: {
      ...currentFormData.jobInfo,
      position: parsedData.designation || currentFormData.jobInfo.position,
    },
    education: mapEducationData(parsedData.education, currentFormData.education),
    experience: mapExperienceData(parsedData.experience, currentFormData.experience),
    skills: formatSkillsData(parsedData.skills, currentFormData.skills),
  };

  return updatedFormData;
}

<<<<<<< HEAD
/**
 * Maps parsed education data to form structure
 * @param {Array} parsedEducation - Parsed education array
 * @param {Array} currentEducation - Current education form data
 * @returns {Array} Mapped education data
 */
=======

// Maps parsed education data to form structure
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function mapEducationData(parsedEducation, currentEducation) {
  if (!parsedEducation || parsedEducation.length === 0) {
    return currentEducation;
  }

  return parsedEducation.map((edu, index) => {
    const currentEdu = currentEducation[index] || {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      graduationYear: '',
      gpa: ''
    };

    return {
      institution: edu.institution || currentEdu.institution,
      degree: edu.degree || currentEdu.degree,
      fieldOfStudy: edu.fieldOfStudy || currentEdu.fieldOfStudy,
      graduationYear: extractGraduationYear(edu.year) || currentEdu.graduationYear,
      gpa: edu.gpa || currentEdu.gpa
    };
  });
}

<<<<<<< HEAD
/**
 * Maps parsed experience data to form structure
 * @param {Array} parsedExperience - Parsed experience array
 * @param {Array} currentExperience - Current experience form data
 * @returns {Array} Mapped experience data
 */
=======

 // Maps parsed experience data to form structure

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function mapExperienceData(parsedExperience, currentExperience) {
  if (!parsedExperience || parsedExperience.length === 0) {
    return currentExperience;
  }

  return parsedExperience.map((exp, index) => {
    const currentExp = currentExperience[index] || {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      currentJob: false
    };

    // Parse experience string if it's in combined format
    let company = exp.company || '';
    let position = exp.position || '';
    let startDate = exp.startDate || '';
    let endDate = exp.endDate || '';
    let description = exp.description || '';
    let currentJob = exp.currentJob || false;

    // Handle legacy string format: "Position at Company (Start - End)"
    if (typeof exp === 'string') {
      const parsed = parseExperienceString(exp);
      company = parsed.company;
      position = parsed.position;
      startDate = parsed.startDate;
      endDate = parsed.endDate;
      description = exp;
      currentJob = parsed.currentJob;
    }

    return {
      company: company || currentExp.company,
      position: position || currentExp.position,
      startDate: formatDate(startDate) || currentExp.startDate,
      endDate: currentJob ? '' : (formatDate(endDate) || currentExp.endDate),
      description: description || currentExp.description,
      currentJob: currentJob
    };
  });
}

<<<<<<< HEAD
/**
 * Parses experience string in format "Position at Company (Start - End)"
 * @param {string} expString - Experience string
 * @returns {Object} Parsed experience components
 */
=======

 // Parses experience string in format "Position at Company (Start - End)"

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function parseExperienceString(expString) {
  const result = {
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    currentJob: false
  };

  // Match pattern: "Position at Company (Start - End)"
  const expParts = expString.split(' at ');
  const position = expParts[0] || '';
  const companyPart = expParts[1] || '';
  
  // Extract company name (before parentheses)
  const company = companyPart.split(' (')[0] || '';
  
  // Extract dates from parentheses
  const datePart = companyPart.match(/\((.*?)\)/);
  if (datePart) {
    const dates = datePart[1].split(' - ');
    result.startDate = dates[0] || '';
    result.endDate = dates[1] || '';
    result.currentJob = dates[1] === 'Present' || !dates[1];
  }

  result.company = company.trim();
  result.position = position.trim();

  return result;
}

<<<<<<< HEAD
/**
 * Formats skills data for form input
 * @param {Array} parsedSkills - Parsed skills array
 * @param {string} currentSkills - Current skills string
 * @returns {string} Formatted skills string
 */
=======

 // Formats skills data for form input

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function formatSkillsData(parsedSkills, currentSkills) {
  if (!parsedSkills || parsedSkills.length === 0) {
    return currentSkills;
  }

  // Join skills with commas and ensure proper formatting
  const skillsString = parsedSkills
    .filter(skill => skill && skill.trim())
    .map(skill => skill.trim())
    .join(', ');

  return skillsString || currentSkills;
}

<<<<<<< HEAD
/**
 * Extracts graduation year from various date formats
 * @param {string} yearString - Year string from parsed data
 * @returns {string} Formatted graduation year
 */
=======

// Extracts graduation year from various date formats

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function extractGraduationYear(yearString) {
  if (!yearString) return '';

  // Handle ranges like "2020 - 2024" or "2020-2024"
  const rangeMatch = yearString.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    return rangeMatch[2]; // Return end year
  }

  // Handle single year
  const yearMatch = yearString.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return yearMatch[0];
  }

  return yearString;
}

<<<<<<< HEAD
/**
 * Formats date string for form input (YYYY-MM-DD format)
 * @param {string} dateString - Date string from parsed data
 * @returns {string} Formatted date string
 */
=======
 // Formats date string for form input (YYYY-MM-DD format)

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function formatDate(dateString) {
  if (!dateString || dateString.toLowerCase() === 'present') {
    return '';
  }

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Handle year only (YYYY)
  if (/^\d{4}$/.test(dateString)) {
    return `${dateString}-01-01`;
  }

  // Handle month year format (MM/YYYY or Month YYYY)
  const monthYearMatch = dateString.match(/(\d{1,2})\/(\d{4})/);
  if (monthYearMatch) {
    const month = monthYearMatch[1].padStart(2, '0');
    return `${monthYearMatch[2]}-${month}-01`;
  }

  // Handle text month year (e.g., "January 2020")
  const textMonthMatch = dateString.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
  if (textMonthMatch) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.findIndex(month => 
      month.toLowerCase() === textMonthMatch[1].toLowerCase()
    );
    if (monthIndex !== -1) {
      const month = (monthIndex + 1).toString().padStart(2, '0');
      return `${textMonthMatch[2]}-${month}-01`;
    }
  }

  return '';
}

<<<<<<< HEAD
/**
 * Validates autofilled data and provides feedback
 * @param {Object} updatedFormData - Updated form data after autofill
 * @param {Object} parsedData - Original parsed resume data
 * @returns {Object} Validation results and suggestions
 */
=======

 // Validates autofilled data and provides feedback
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export function validateAutofillData(updatedFormData, parsedData) {
  const validation = {
    isValid: true,
    warnings: [],
    suggestions: [],
    fillRate: 0
  };

  let totalFields = 0;
  let filledFields = 0;

  // Check personal info completeness
  Object.entries(updatedFormData.personalInfo).forEach(([key, value]) => {
    totalFields++;
    if (value && value.trim()) {
      filledFields++;
    } else if (['firstName', 'lastName', 'email', 'phone'].includes(key)) {
      validation.warnings.push(`${key} could not be extracted from resume`);
    }
  });

  // Check job info
  totalFields++;
  if (updatedFormData.jobInfo.position) {
    filledFields++;
  } else {
    validation.suggestions.push('Consider adding a target position based on your experience');
  }

  // Check education
  if (updatedFormData.education.length > 0) {
    updatedFormData.education.forEach(edu => {
      totalFields += 3; // institution, degree, year
      if (edu.institution) filledFields++;
      if (edu.degree) filledFields++;
      if (edu.graduationYear) filledFields++;
    });
  }

  // Check experience
  if (updatedFormData.experience.length > 0) {
    updatedFormData.experience.forEach(exp => {
      totalFields += 4; // company, position, startDate, description
      if (exp.company) filledFields++;
      if (exp.position) filledFields++;
      if (exp.startDate) filledFields++;
      if (exp.description) filledFields++;
    });
  }

  // Check skills
  totalFields++;
  if (updatedFormData.skills && updatedFormData.skills.trim()) {
    filledFields++;
  } else {
    validation.suggestions.push('Skills section appears to be empty - consider adding relevant skills');
  }

  // Calculate fill rate
  validation.fillRate = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  // Overall validation
  if (validation.fillRate < 50) {
    validation.isValid = false;
    validation.warnings.push('Low data extraction rate - manual review recommended');
  }

  // Additional suggestions based on parsed data
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    validation.suggestions.push('Certifications detected in resume - consider adding a certifications section');
  }

  if (parsedData.projects && parsedData.projects.length > 0) {
    validation.suggestions.push('Projects found in resume - consider highlighting key projects');
  }

  return validation;
}

<<<<<<< HEAD
/**
 * Merges autofilled data with existing form data intelligently
 * @param {Object} existingData - Current form data
 * @param {Object} newData - New autofilled data
 * @param {Object} options - Merge options
 * @returns {Object} Merged form data
 */
=======
 // Merges autofilled data with existing form data

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export function mergeFormData(existingData, newData, options = {}) {
  const {
    overwriteExisting = false,
    preserveArrays = false,
    skipEmptyValues = true
  } = options;

  const mergedData = { ...existingData };

  // Helper function to check if value should be skipped
  const shouldSkipValue = (value) => {
    if (!skipEmptyValues) return false;
    return !value || (typeof value === 'string' && !value.trim());
  };

  // Merge personal info
  if (newData.personalInfo) {
    mergedData.personalInfo = { ...mergedData.personalInfo };
    Object.entries(newData.personalInfo).forEach(([key, value]) => {
      if (shouldSkipValue(value)) return;
      if (overwriteExisting || !mergedData.personalInfo[key]) {
        mergedData.personalInfo[key] = value;
      }
    });
  }

  // Merge job info
  if (newData.jobInfo) {
    mergedData.jobInfo = { ...mergedData.jobInfo };
    Object.entries(newData.jobInfo).forEach(([key, value]) => {
      if (shouldSkipValue(value)) return;
      if (overwriteExisting || !mergedData.jobInfo[key]) {
        mergedData.jobInfo[key] = value;
      }
    });
  }

  // Merge arrays (education, experience)
  ['education', 'experience'].forEach(section => {
    if (newData[section] && Array.isArray(newData[section])) {
      if (preserveArrays && mergedData[section] && mergedData[section].length > 0) {
        // Append new items to existing array
        mergedData[section] = [...mergedData[section], ...newData[section]];
      } else {
        // Replace existing array
        mergedData[section] = newData[section];
      }
    }
  });

  // Merge skills
  if (newData.skills && !shouldSkipValue(newData.skills)) {
    if (overwriteExisting || !mergedData.skills) {
      mergedData.skills = newData.skills;
    } else if (mergedData.skills && !preserveArrays) {
      // Combine skills if both exist
      const existingSkills = mergedData.skills.split(',').map(s => s.trim());
      const newSkills = newData.skills.split(',').map(s => s.trim());
      const combinedSkills = [...new Set([...existingSkills, ...newSkills])];
      mergedData.skills = combinedSkills.join(', ');
    }
  }

  return mergedData;
}

<<<<<<< HEAD
/**
 * Generates a summary of autofill results
 * @param {Object} originalData - Original form data
 * @param {Object} updatedData - Updated form data after autofill
 * @param {Object} validation - Validation results
 * @returns {Object} Autofill summary
 */
=======
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export function generateAutofillSummary(originalData, updatedData, validation) {
  const summary = {
    fieldsUpdated: [],
    newSections: [],
    fillRate: validation.fillRate,
    recommendations: validation.suggestions,
    warnings: validation.warnings
  };

  // Track updated fields
  const compareAndTrack = (original, updated, section) => {
    if (typeof updated === 'object' && !Array.isArray(updated)) {
      Object.entries(updated).forEach(([key, value]) => {
        if (original[key] !== value && value) {
          summary.fieldsUpdated.push(`${section}.${key}`);
        }
      });
    }
  };

  // Check personal info updates
  compareAndTrack(originalData.personalInfo, updatedData.personalInfo, 'personalInfo');
  
  // Check job info updates
  compareAndTrack(originalData.jobInfo, updatedData.jobInfo, 'jobInfo');

  // Check new sections
  if (updatedData.education.length > originalData.education.length) {
    summary.newSections.push('education');
  }
  
  if (updatedData.experience.length > originalData.experience.length) {
    summary.newSections.push('experience');
  }

  if (originalData.skills !== updatedData.skills && updatedData.skills) {
    summary.fieldsUpdated.push('skills');
  }

  return summary;
}

<<<<<<< HEAD
/**
 * Cleans and normalizes parsed resume data
 * @param {Object} rawParsedData - Raw parsed data from resume parser
 * @returns {Object} Cleaned and normalized data
 */
=======

 // Cleans and normalizes parsed resume data

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export function cleanParsedData(rawParsedData) {
  if (!rawParsedData) return null;

  const cleaned = {
    name: cleanText(rawParsedData.name),
    email: cleanEmail(rawParsedData.email),
    phone: cleanPhone(rawParsedData.phone),
    address: cleanText(rawParsedData.address),
    designation: cleanText(rawParsedData.designation),
    education: cleanEducationArray(rawParsedData.education),
    experience: cleanExperienceArray(rawParsedData.experience),
    skills: cleanSkillsArray(rawParsedData.skills),
    certifications: cleanArray(rawParsedData.certifications),
    projects: cleanArray(rawParsedData.projects)
  };

  return cleaned;
}

<<<<<<< HEAD
/**
 * Helper function to clean text data
 */
=======
// Helper function to clean text data

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function cleanText(text) {
  if (!text) return '';
  return text.toString().trim().replace(/\s+/g, ' ');
}

<<<<<<< HEAD
/**
 * Helper function to clean email
 */
=======
// Helper function to clean email

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function cleanEmail(email) {
  if (!email) return '';
  const cleanedEmail = email.toString().trim().toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleanedEmail) ? cleanedEmail : '';
}

<<<<<<< HEAD
/**
 * Helper function to clean phone number
 */
=======

// Helper function to clean phone number
 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function cleanPhone(phone) {
  if (!phone) return '';
  // Remove all non-digit characters except + and spaces
  return phone.toString().replace(/[^\d+\s()-]/g, '').trim();
}

<<<<<<< HEAD
/**
 * Helper function to clean education array
 */
=======
// Helper function to clean education array
 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function cleanEducationArray(education) {
  if (!Array.isArray(education)) return [];
  return education.map(edu => ({
    institution: cleanText(edu.institution),
    degree: cleanText(edu.degree),
    fieldOfStudy: cleanText(edu.fieldOfStudy),
    year: cleanText(edu.year),
    gpa: cleanText(edu.gpa)
  })).filter(edu => edu.institution || edu.degree);
}

<<<<<<< HEAD
/**
 * Helper function to clean experience array
 */
=======
// Helper function to clean experience array
 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function cleanExperienceArray(experience) {
  if (!Array.isArray(experience)) return [];
  return experience.map(exp => {
    if (typeof exp === 'string') {
      return cleanText(exp);
    }
    return {
      company: cleanText(exp.company),
      position: cleanText(exp.position),
      startDate: cleanText(exp.startDate),
      endDate: cleanText(exp.endDate),
      description: cleanText(exp.description),
      currentJob: !!exp.currentJob
    };
  }).filter(exp => exp && (typeof exp === 'string' || exp.company || exp.position));
}

<<<<<<< HEAD
/**
 * Helper function to clean skills array
 */
=======
// Helper function to clean skills array
 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
function cleanSkillsArray(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map(skill => cleanText(skill))
    .filter(skill => skill && skill.length > 1)
    .map(skill => skill.replace(/[,;]+/g, '').trim());
}

<<<<<<< HEAD
/**
 * Helper function to clean generic arrays
 */
function cleanArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => cleanText(item)).filter(item => item);
}
=======
// Helper function to clean generic arrays
 
function cleanArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => cleanText(item)).filter(item => item);
}
*/
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
