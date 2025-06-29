<<<<<<< HEAD
// pdf.js - PDF parsing utilities

// PDF.js worker setup
=======
/* Milestone 3 

>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
const loadPDFJS = () => {
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }
  
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  document.head.appendChild(script);
  
  return new Promise((resolve) => {
    script.onload = () => resolve(window.pdfjsLib);
  });
};

<<<<<<< HEAD
/**
 * Extract text from PDF file using PDF.js
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
=======
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export const extractTextFromPDF = async (file) => {
  try {
    const pdfjsLib = await loadPDFJS();
    
    if (!pdfjsLib) {
      throw new Error('PDF.js not loaded');
    }
    
<<<<<<< HEAD
    // Set worker path
=======
 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into readable text
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

<<<<<<< HEAD
/**
 * Parse resume text and extract structured data
 * @param {string} text - Raw text content from resume
 * @returns {Object} - Parsed resume data
 */
=======
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export const parseResumeText = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input for parsing');
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const lowerText = text.toLowerCase();
  
  const parsedData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: [],
    experience: [],
    education: [],
    bio: ''
  };

<<<<<<< HEAD
  // Extract email (improved regex)
=======
  // Extract email 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    parsedData.email = emailMatches[0];
  }

<<<<<<< HEAD
  // Extract phone (improved regex for various formats)
=======
  // Extract phone 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+\d{1,3}[-.\s]?\d{1,14}/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    parsedData.phone = phoneMatches[0];
  }

<<<<<<< HEAD
  // Extract name (first few lines that look like names)
=======
  // Extract name 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const namePatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/m,
    /^([A-Z][A-Z\s]+)$/m,
    /([A-Z][a-z]+ [A-Z][a-z]+)/
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
    if (nameMatch && nameMatch[1] && nameMatch[1].length < 50) {
      parsedData.name = nameMatch[1].trim();
      break;
    }
  }

<<<<<<< HEAD
  // Extract location (look for common location patterns)
=======
  // Extract location 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const locationPatterns = [
    /([A-Z][a-z]+,\s*[A-Z]{2})/g,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/g,
    /(Singapore|New York|Los Angeles|Chicago|Boston|Seattle|San Francisco)/gi
  ];
  
  for (const pattern of locationPatterns) {
    const locationMatch = text.match(pattern);
    if (locationMatch && locationMatch[0]) {
      parsedData.location = locationMatch[0];
      break;
    }
  }

<<<<<<< HEAD
  // Extract skills section (enhanced)
=======
  // Extract skills section 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const skillsSectionPatterns = [
    /(?:Skills?|Technical Skills?|Programming Languages?|Technologies?)[:\s]*([^]*?)(?=\n\s*[A-Z][a-z]+|$)/i,
    /(?:Skills?|Technical Skills?)[:\s]*(.+?)(?:\n\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of skillsSectionPatterns) {
    const skillsMatch = text.match(pattern);
    if (skillsMatch && skillsMatch[1]) {
      const skillsText = skillsMatch[1];
      const skillsArray = skillsText
        .split(/[,\n•·\|]/)
        .map(skill => skill.trim())
        .filter(skill => skill && skill.length > 1 && skill.length < 30 && !/^\d+$/.test(skill))
        .map(skill => skill.replace(/[^\w\s+#.-]/g, ''));
      
      parsedData.skills = [...new Set(skillsArray)].slice(0, 15);
      break;
    }
  }

<<<<<<< HEAD
  // Extract experience section (enhanced)
=======
  // Extract experience section 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const experiencePatterns = [
    /(?:Experience|Work Experience|Professional Experience|Employment)[:\s]*([^]*?)(?=Education|Skills|Projects|$)/i,
    /(?:Experience|Work Experience)[:\s]*([^]*?)(?=\n\s*[A-Z][a-z]+:|\n\s*EDUCATION|\n\s*SKILLS|$)/i
  ];
  
  for (const pattern of experiencePatterns) {
    const expMatch = text.match(pattern);
    if (expMatch && expMatch[1]) {
      const expText = expMatch[1];
      const expEntries = expText.split(/\n\s*\n+/).filter(entry => entry.trim());
      
      parsedData.experience = expEntries.slice(0, 4).map((entry, index) => {
        const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
        
        // Try to identify job title, company, and dates
        let title = '', company = '', duration = '', description = '';
        
        if (lines.length >= 2) {
          // First line is often title or title @ company
          const firstLine = lines[0];
          if (firstLine.includes(' at ') || firstLine.includes(' @ ')) {
            const parts = firstLine.split(/ at | @ /);
            title = parts[0];
            company = parts[1];
          } else {
            title = firstLine;
            // Second line might be company
            if (lines[1] && !lines[1].match(/\d{4}/) && lines[1].length < 50) {
              company = lines[1];
            }
          }
          
          // Look for dates
          const dateRegex = /\b\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/g;
          for (const line of lines) {
            if (dateRegex.test(line)) {
              duration = line;
              break;
            }
          }
          
          // Remaining lines are description
          const descLines = lines.slice(2).filter(line => !dateRegex.test(line));
          description = descLines.join(' ').substring(0, 200);
        }
        
        return {
          id: Date.now() + index,
          title: title || 'Position',
          company: company || 'Company',
          duration: duration || 'Duration not specified',
          description: description || 'Description not available'
        };
      });
      break;
    }
  }

<<<<<<< HEAD
  // Extract education section (enhanced)
=======
  // Extract education section 
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
  const educationPatterns = [
    /(?:Education|Academic Background|University)[:\s]*([^]*?)(?=Experience|Skills|Projects|$)/i,
    /(?:Education)[:\s]*([^]*?)(?=\n\s*[A-Z][a-z]+:|\n\s*EXPERIENCE|\n\s*SKILLS|$)/i
  ];
  
  for (const pattern of educationPatterns) {
    const eduMatch = text.match(pattern);
    if (eduMatch && eduMatch[1]) {
      const eduText = eduMatch[1];
      const eduEntries = eduText.split(/\n\s*\n+/).filter(entry => entry.trim());
      
      parsedData.education = eduEntries.slice(0, 3).map((entry, index) => {
        const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
        
        let institution = '', degree = '', period = '', gpa = '';
        
        if (lines.length >= 1) {
          // First line is often institution or degree
          institution = lines[0];
          
          // Look for degree information
          const degreeKeywords = ['bachelor', 'master', 'phd', 'bs', 'ms', 'ba', 'ma', 'degree'];
          for (const line of lines) {
            if (degreeKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
              degree = line;
              break;
            }
          }
          
          // Look for dates
          const dateRegex = /\b\d{4}\b/g;
          for (const line of lines) {
            const dates = line.match(dateRegex);
            if (dates && dates.length >= 1) {
              period = line;
              break;
            }
          }
          
          // Look for GPA
          const gpaRegex = /gpa[:\s]*(\d+\.?\d*)/i;
          for (const line of lines) {
            const gpaMatch = line.match(gpaRegex);
            if (gpaMatch) {
              gpa = gpaMatch[1];
              break;
            }
          }
        }
        
        return {
          id: Date.now() + index,
          institution: institution || 'Institution',
          degree: degree || 'Degree',
          period: period || 'Period not specified',
          gpa: gpa || ''
        };
      });
      break;
    }
  }

  return parsedData;
};

<<<<<<< HEAD
/**
 * Main function to process PDF resume file
 * @param {File} file - PDF file object
 * @returns {Promise<Object>} - Parsed resume data
 */
=======
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
export const processPDFResume = async (file) => {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please provide a valid PDF file');
  }

  try {
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file);
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Could not extract text from PDF. The PDF might be image-based or encrypted.');
    }
    
    // Parse the extracted text
    const parsedData = parseResumeText(extractedText);
    
    return {
      success: true,
      data: parsedData,
      extractedText: extractedText.substring(0, 500) + '...' // First 500 chars for debugging
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

export default {
  extractTextFromPDF,
  parseResumeText,
  processPDFResume
<<<<<<< HEAD
};
=======
};

*/
>>>>>>> 1b66db2cc1277f7eef88daa3d341bc56e8aea976
