const loadPDFJS = async () => {
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to load properly'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
};

/**
 * Clean text extraction that preserves structure
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Clean extracted text
 */
export const extractTextFromPDF = async (file) => {
  let pdfjsLib;
  
  try {
    console.log('🔄 Starting PDF text extraction...');
    pdfjsLib = await loadPDFJS();
    
    if (!pdfjsLib) {
      throw new Error('PDF.js library not available');
    }
    
    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('PDF file appears to be empty or corrupted');
    }
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0  // Reduce console noise
    }).promise;
    
    if (!pdf || pdf.numPages === 0) {
      throw new Error('PDF contains no readable pages');
    }
    
    let allTextItems = [];
    
    // Extract text items from each page with position data
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        if (textContent && textContent.items && textContent.items.length > 0) {
          // Add page context to each text item
          const pageItems = textContent.items.map(item => ({
            text: item.str || '',
            x: item.transform ? item.transform[4] : 0,
            y: item.transform ? item.transform[5] : 0,
            width: item.width || 0,
            height: item.height || 0,
            page: pageNum
          }));
          
          allTextItems.push(...pageItems);
        }
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError.message);
      }
    }
    
    if (allTextItems.length === 0) {
      throw new Error('No text could be extracted from PDF');
    }
    
    // Sort items by page, then by Y position (top to bottom), then by X position (left to right)
    allTextItems.sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      if (Math.abs(a.y - b.y) > 5) return b.y - a.y; 
      return a.x - b.x; 
    });
    
    // Reconstruct text with proper line breaks
    let reconstructedText = '';
    let currentLine = '';
    let lastY = null;
    let lastX = null;
    
    for (let i = 0; i < allTextItems.length; i++) {
      const item = allTextItems[i];
      const text = item.text.trim();
      
      if (!text) continue;
      
      // Check if this is a new line (significant Y difference)
      const isNewLine = lastY !== null && Math.abs(item.y - lastY) > 5;
      
      // Check if there should be a space (horizontal gap)
      const needsSpace = lastX !== null && !isNewLine && (item.x - lastX) > 10;
      
      if (isNewLine) {
        // Add current line to text and start new line
        if (currentLine.trim()) {
          reconstructedText += currentLine.trim() + '\n';
        }
        currentLine = text;
      } else {
        // Continue on same line
        if (currentLine && needsSpace && !currentLine.endsWith(' ')) {
          currentLine += ' ';
        }
        currentLine += text;
      }
      
      lastY = item.y;
      lastX = item.x + item.width;
    }
    
    // Add final line
    if (currentLine.trim()) {
      reconstructedText += currentLine.trim();
    }
    
    // Clean up the text
    const cleanText = cleanExtractedText(reconstructedText);
    
    if (!cleanText || cleanText.length < 20) {
      throw new Error('PDF appears to contain no readable text. It may be image-based or encrypted.');
    }
    
    console.log('✅ Successfully extracted clean text:', cleanText.length, 'characters');
    return cleanText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};


function cleanExtractedText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[^\x20-\x7E\n\r]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}


export const parseResumeText = (text) => {
  console.log('🔍 Starting custom parsing for TAN JIE YING resume...');
  console.log('📄 Text length:', text?.length || 0);
  
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input for parsing');
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  console.log('📄 Total lines:', lines.length);
  console.log('📄 First 10 lines:', lines.slice(0, 10));
  
  const parsedData = {
    name: '',
    email: '',
    phone: '',
    location: 'Singapore',
    skills: [],
    experience: [],
    education: [],
    bio: '',
    major: '',      // Add these to avoid ESLint errors
    university: ''
  };

  // Track processed sections to avoid duplicates
  const processedSections = {
    education: false,
    experience: false,
    skills: false,
    summary: false
  };

  // Parse line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`📄 Processing line ${i}: "${line}"`);
    
    // Line 0: Extract name (TAN JIE YING)
    if (i === 0 && line.match(/^[A-Z][A-Z\s]+$/)) {
      parsedData.name = line;
      console.log('✅ Found name:', parsedData.name);
      continue;
    }
    
    // Line 1: Extract phone and email
    if (line.includes('@') && line.includes('.com')) {
      const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        parsedData.email = emailMatch[1];
        console.log('✅ Found email:', parsedData.email);
      }
      
      const phoneMatch = line.match(/(\d{8,})/);
      if (phoneMatch) {
        parsedData.phone = phoneMatch[1];
        console.log('✅ Found phone:', parsedData.phone);
      }
      continue;
    }
    
    // Extract bio from SUMMARY section (only once)
    if (line === 'SUMMARY' && !processedSections.summary) {
      console.log('🔍 Found SUMMARY section at line', i);
      processedSections.summary = true;
      let bio = '';
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.match(/^(WORK EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)$/)) {
          break;
        }
        bio += nextLine + ' ';
        j++;
      }
      
      parsedData.bio = bio.trim();
      console.log('✅ Found bio:', parsedData.bio);
      i = j - 1;
      continue;
    }
    
    // Parse WORK EXPERIENCE section (only once)
    if (line === 'WORK EXPERIENCE' && !processedSections.experience) {
      console.log('🔍 Found WORK EXPERIENCE section at line', i);
      processedSections.experience = true;
      let j = i + 1;
      let currentExp = null;
      
      while (j < lines.length) {
        const expLine = lines[j];
        console.log(`💼 Checking experience line ${j}: "${expLine}"`);
        
        if (expLine.match(/^(EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|REFERENCES)$/)) {
          console.log('🔍 Hit next section:', expLine);
          break;
        }
        
        const expPattern = /^(.+?),\s*(.+?)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s+to\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|Present|\d{4}\s*-\s*\d{4})$/i;
        const expMatch = expLine.match(expPattern);
        
        if (expMatch) {
          if (currentExp) {
            currentExp.description = currentExp.description.trim();
            parsedData.experience.push(currentExp);
            console.log('✅ Added experience:', currentExp);
          }
          
          currentExp = {
            id: Date.now() + parsedData.experience.length,
            company: expMatch[1].trim(),
            position: expMatch[2].trim(),
            duration: expMatch[3].trim(),
            description: '',
            currentJob: expMatch[3].toLowerCase().includes('present')
          };
          console.log('💼 Started new experience:', currentExp);
        } else if (currentExp && expLine.length > 10) {
          currentExp.description += expLine + ' ';
          console.log('📝 Added to description:', expLine.substring(0, 50) + '...');
        }
        
        j++;
      }
      
      if (currentExp) {
        currentExp.description = currentExp.description.trim();
        parsedData.experience.push(currentExp);
        console.log('✅ Added final experience:', currentExp);
      }
      
      i = j - 1;
      continue;
    }
    
    // Parse EDUCATION section (only once)
    if (line === 'EDUCATION' && !processedSections.education) {
      console.log('🔍 Found EDUCATION section at line', i);
      processedSections.education = true;
      let j = i + 1;
      let currentEdu = null;
      
      while (j < lines.length) {
        const eduLine = lines[j];
        console.log(`🎓 Checking education line ${j}: "${eduLine}"`);
        
        if (eduLine.match(/^(WORK EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|REFERENCES)$/)) {
          console.log('🔍 Hit next section:', eduLine);
          break;
        }
        
        if ((eduLine.includes('University') || eduLine.includes('Institution')) && eduLine.match(/\d{4}/)) {
          if (currentEdu && currentEdu.institution) {
            parsedData.education.push(currentEdu);
            console.log('✅ Added education:', currentEdu);
          }
          
          const eduPattern = /^(.+?)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}\s*-\s*\d{4})$/i;
          const eduMatch = eduLine.match(eduPattern);
          
          currentEdu = {
            id: Date.now() + parsedData.education.length + Math.random(),
            institution: eduMatch ? eduMatch[1].trim() : eduLine.replace(/\s+\d{4}.*$/, '').trim(),
            degree: '',
            fieldOfStudy: '',
            period: eduMatch ? eduMatch[2].trim() : eduLine.match(/\d{4}\s*-\s*\d{4}/)?.[0] || '',
            gpa: ''
          };
          console.log('🎓 Started new education:', currentEdu);
        } 
        else if (currentEdu && (
          eduLine.includes('Bachelor') || 
          eduLine.includes('Science') || 
          eduLine.includes('Honours') || 
          eduLine.includes('GCSE') ||
          eduLine.includes('A-levels')
        )) {
          currentEdu.degree = eduLine;
          console.log('🎓 Added degree:', eduLine);
          
          // Enhanced major extraction patterns
          let major = '';
          
          const majorPattern1 = eduLine.match(/Major in (.+)$/i);
          if (majorPattern1) {
            major = majorPattern1[1].trim();
            console.log('📚 Found major with "Major in" pattern:', major);
          } else if (eduLine.includes('Data Science') && eduLine.includes('Economics')) {
            major = 'Data Science and Economics';
            console.log('📚 Found major by keyword matching:', major);
          }
          
          if (major) {
            currentEdu.fieldOfStudy = major;
            console.log('✅ Set fieldOfStudy:', currentEdu.fieldOfStudy);
          }
        } 
        else if (currentEdu && eduLine.includes('Data Science') && eduLine.includes('Economics')) {
          currentEdu.fieldOfStudy = 'Data Science and Economics';
          console.log('✅ Found major in separate line:', currentEdu.fieldOfStudy);
        }
        else if (currentEdu && eduLine.includes('GPA')) {
          const gpaMatch = eduLine.match(/GPA[:\s]*([0-9.]+)/i);
          if (gpaMatch) {
            currentEdu.gpa = gpaMatch[1];
            console.log('📊 Added GPA:', currentEdu.gpa);
          }
        }
        
        j++;
      }
      
      if (currentEdu && currentEdu.institution) {
        parsedData.education.push(currentEdu);
        console.log('✅ Added final education:', currentEdu);
      }
      
      i = j - 1;
      continue;
    }
    
    // Parse SKILLS section (only once)
    if ((line === 'SKILLS' || line === 'TECHNICAL SKILLS') && !processedSections.skills) {
      console.log('🔍 Found SKILLS section at line', i);
      processedSections.skills = true;
      let j = i + 1;
      let skillsText = '';
      
      while (j < lines.length) {
        const skillLine = lines[j];
        
        if (skillLine.match(/^(EDUCATION|WORK EXPERIENCE|PROJECTS|CERTIFICATIONS|REFERENCES)$/)) {
          break;
        }
        
        skillsText += skillLine + ' ';
        j++;
      }
      
      if (skillsText.trim()) {
        const skillsArray = skillsText
          .split(/[,\n•·\|;]/)
          .map(skill => skill.trim())
          .filter(skill => skill && skill.length > 1 && skill.length < 50)
          .map(skill => skill.replace(/[^\w\s+#.-]/g, '').trim())
          .filter(skill => skill);
        
        parsedData.skills = [...new Set(skillsArray)].slice(0, 15);
        console.log('✅ Extracted skills:', parsedData.skills);
      }
      
      i = j - 1;
      continue;
    }
  }
  
  // Default values if sections not found
  if (parsedData.education.length === 0) {
    console.log('❌ No education found, adding default');
    parsedData.education = [{
      id: Date.now(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      period: '',
      gpa: ''
    }];
  }
  
  if (parsedData.experience.length === 0) {
    console.log('❌ No experience found, adding default');
    parsedData.experience = [{
      id: Date.now(),
      title: '',
      company: '',
      duration: '',
      description: ''
    }];
  }

  // Clean up duplicates in education
  const uniqueEducation = [];
  const seenInstitutions = new Set();

  for (const edu of parsedData.education) {
    const key = `${edu.institution}_${edu.period}`;
    if (!seenInstitutions.has(key) && edu.institution) {
      seenInstitutions.add(key);
      uniqueEducation.push(edu);
    }
  }

  parsedData.education = uniqueEducation;

  // Map education data to profile fields for compatibility
  if (parsedData.education && parsedData.education.length > 0) {
    const primaryEducation = parsedData.education[0];
    
    if (primaryEducation.fieldOfStudy) {
      parsedData.major = primaryEducation.fieldOfStudy;
      console.log('✅ Mapped fieldOfStudy to major:', parsedData.major);
    }
    
    if (primaryEducation.institution) {
      parsedData.university = primaryEducation.institution;
      console.log('✅ Mapped institution to university:', parsedData.university);
    }
  }

  console.log('✅ Final parsed data with mappings:', parsedData);
  return parsedData;
};

/**
 * Main function to process PDF resume file
 */
export const processPDFResume = async (file) => {
  if (!file) {
    return {
      success: false,
      error: 'No file provided',
      data: null
    };
  }
  
  if (file.type !== 'application/pdf') {
    return {
      success: false,
      error: 'Please provide a valid PDF file',
      data: null
    };
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: 'File size too large. Please upload a PDF smaller than 10MB',
      data: null
    };
  }

  try {
    console.log('🔄 Processing PDF resume:', file.name);
    
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file);
    
    console.log(`📄 Extracted ${extractedText.length} characters from PDF`);
    console.log('📄 FULL EXTRACTED TEXT:', extractedText);
    
    if (!extractedText || extractedText.trim().length < 50) {
      return {
        success: false,
        error: 'Could not extract sufficient text from PDF.',
        data: null
      };
    }
    
    // Parse the extracted text
    const parsedData = parseResumeText(extractedText);
    
    console.log('✅ Successfully parsed resume data');
    
    return {
      success: true,
      data: parsedData,
      extractedText: extractedText.substring(0, 500) + '...',
      message: 'Resume parsed successfully'
    };
    
  } catch (error) {
    console.error('❌ Error processing PDF resume:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred while processing PDF',
      data: null
    };
  }
};

// Export all functions
export default {
  extractTextFromPDF,
  parseResumeText,
  processPDFResume
};