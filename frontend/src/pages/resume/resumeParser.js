// /**
//  * Parses resume text/data and extracts structured information
//  * @param {string} resumeText - Raw resume text
//  * @param {Object} resumeFile - Optional file object with metadata
//  * @returns {Object} Parsed resume data
//  */

// export function parseResume(resumeText) {
//   // 🔍 ADD THESE DEBUG LINES AT THE VERY BEGINNING
//   console.log('🚀 Starting resume parsing...');
//   console.log('📄 Resume text length:', resumeText?.length || 0);
//   console.log('📄 First 300 characters:', resumeText?.substring(0, 300) || 'No text');
//   console.log('📄 Contains "education":', resumeText?.toLowerCase().includes('education') || false);
//   console.log('📄 Contains "experience":', resumeText?.toLowerCase().includes('experience') || false);
//   console.log('📄 Contains "work":', resumeText?.toLowerCase().includes('work') || false);
  
//   // Show the actual lines to see structure
//   const lines = resumeText?.split('\n') || [];
//   console.log('📄 Total lines:', lines.length);
//   console.log('📄 First 10 lines:', lines.slice(0, 10));
  
//   // 🔍 END OF DEBUG SECTION - YOUR EXISTING CODE CONTINUES BELOW
  
//   const parsedData = {
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     designation: '',
//     education: [],
//     experience: [],
//     skills: [],
//     certifications: []
//   };

//   if (!resumeText) return parsedData;

//   try {
//     // Extract name (usually first line or after "Name:")
//     const nameMatch = resumeText.match(/(?:Name[:\s]+)?([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
//     if (nameMatch) {
//       parsedData.name = nameMatch[1].trim();
//     }

//     // Extract email
//     const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
//     if (emailMatch) {
//       parsedData.email = emailMatch[1];
//     }

//     // Extract phone number
//     const phoneMatch = resumeText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
//     if (phoneMatch) {
//       parsedData.phone = phoneMatch[1];
//     }

//     // Extract address (basic pattern)
//     const addressMatch = resumeText.match(/(?:Address[:\s]+)?([0-9]+\s+[A-Za-z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)[A-Za-z\s,0-9]*)/i);
//     if (addressMatch) {
//       parsedData.address = addressMatch[1].trim();
//     }

//     // Extract designation/title
//     const designationMatch = resumeText.match(/(?:Title|Position|Role)[:\s]+([A-Za-z\s]+)(?:\n|$)/i) ||
//                              resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Developer|Engineer|Manager|Analyst|Designer|Specialist)))/m);
//     if (designationMatch) {
//       parsedData.designation = designationMatch[1].trim();
//     }

//     // Extract education
//     const educationSection = extractSection(resumeText, 'education');
//     if (educationSection) {
//       parsedData.education = parseEducation(educationSection);
//     }

//     // Extract experience
//     const experienceSection = extractSection(resumeText, 'experience') || 
//                              extractSection(resumeText, 'work history') ||
//                              extractSection(resumeText, 'employment');
//     if (experienceSection) {
//       parsedData.experience = parseExperience(experienceSection);
//     }

//     // Extract skills
//     const skillsSection = extractSection(resumeText, 'skills') ||
//                          extractSection(resumeText, 'technical skills') ||
//                          extractSection(resumeText, 'competencies');
//     if (skillsSection) {
//       parsedData.skills = parseSkills(skillsSection);
//     }

//     // Extract certifications
//     const certSection = extractSection(resumeText, 'certifications') ||
//                        extractSection(resumeText, 'certificates');
//     if (certSection) {
//       parsedData.certifications = parseCertifications(certSection);
//     }

//     return parsedData;
//   } catch (error) {
//     console.error('Error parsing resume:', error);
//     return parsedData;
//   }
// }

// /**
//  * Extracts a specific section from resume text
//  * @param {string} text - Resume text
//  * @param {string} sectionName - Section to extract
//  * @returns {string|null} Section content
//  */
// function extractSection(text, sectionName) {
//   console.log(`🔍 Looking for section: "${sectionName}"`);
  
//   if (!text) {
//     console.log('❌ No text provided to extractSection');
//     return null;
//   }
  
//   // Try multiple patterns to find the section
//   const patterns = [
//     // Pattern 1: "EDUCATION:" or "EXPERIENCE:" 
//     new RegExp(`(?:^|\\n)\\s*${sectionName}\\s*:([\\s\\S]*?)(?=\\n\\s*[A-Z][a-zA-Z\\s]*:|$)`, 'i'),
    
//     // Pattern 2: "EDUCATION" on its own line
//     new RegExp(`(?:^|\\n)\\s*${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n\\s*[A-Z][a-zA-Z\\s]*\\n|$)`, 'i'),
    
//     // Pattern 3: "EDUCATION" with dashes/underlines
//     new RegExp(`(?:^|\\n)\\s*${sectionName}\\s*[-_=]*\\n?([\\s\\S]*?)(?=\\n\\s*[A-Z]+\\s*[-_=]*|$)`, 'i'),
    
//     // Pattern 4: More flexible - just find the word and grab content after
//     new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=(?:education|experience|skills|projects|certifications|contact|summary|objective)\\s*[:\\n]|$)`, 'i')
//   ];

//   for (let i = 0; i < patterns.length; i++) {
//     const pattern = patterns[i];
//     const match = text.match(pattern);
    
//     if (match && match[1]) {
//       const content = match[1].trim();
//       if (content.length > 5) { // Make sure we have meaningful content
//         console.log(`✅ Found ${sectionName} with pattern ${i + 1}`);
//         console.log(`📝 Content preview: "${content.substring(0, 100)}..."`);
//         return content;
//       }
//     }
//   }
  
//   console.log(`❌ No ${sectionName} section found with any pattern`);
//   return null;
// }

// /**
//  * Parses education section
//  * @param {string} educationText - Education section text
//  * @returns {Array} Array of education objects
//  */
// function parseEducation(educationText) {
//   console.log('🎓 Parsing education...');
//   console.log('🎓 Education text:', educationText?.substring(0, 200) || 'No text');
  
//   if (!educationText) {
//     console.log('❌ No education text provided');
//     return [{
//       institution: '',
//       degree: '',
//       fieldOfStudy: '',
//       year: '',
//       gpa: ''
//     }];
//   }

//   const education = [];
  
//   // Split into potential education entries
//   const blocks = educationText
//     .split(/\n\s*\n+/) // Split by blank lines
//     .filter(block => block.trim())
//     .map(block => block.trim());
  
//   console.log('🎓 Found', blocks.length, 'education blocks');
  
//   // If no blocks, treat entire text as one education entry
//   if (blocks.length === 0) {
//     blocks.push(educationText.trim());
//   }

//   blocks.forEach((block, index) => {
//     console.log(`🎓 Processing education block ${index + 1}:`, block);
    
//     const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
//     const eduItem = {
//       institution: '',
//       degree: '',
//       fieldOfStudy: '',
//       year: '',
//       gpa: ''
//     };

//     // Look for degree in each line
//     const degreePatterns = [
//       /(Bachelor.*|Master.*|PhD|Doctorate|Associate)/i,
//       /(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?E\.?|M\.?E\.?)/i,
//       /(Computer Science|Engineering|Business|Science|Arts)/i
//     ];

//     // Look for institution in each line
//     const institutionPatterns = [
//       /(University|College|Institute|School|Polytechnic)/i,
//       /(NUS|NTU|SMU|MIT|Harvard|Stanford|UCLA)/i
//     ];

//     lines.forEach(line => {
//       console.log(`  📄 Checking line: "${line}"`);
      
//       // Check for degree
//       degreePatterns.forEach(pattern => {
//         if (!eduItem.degree && pattern.test(line)) {
//           eduItem.degree = line;
//           console.log(`    🎓 Found degree: "${eduItem.degree}"`);
//         }
//       });
      
//       // Check for institution  
//       institutionPatterns.forEach(pattern => {
//         if (!eduItem.institution && pattern.test(line)) {
//           eduItem.institution = line;
//           console.log(`    🏫 Found institution: "${eduItem.institution}"`);
//         }
//       });
      
//       // Check for year
//       const yearMatch = line.match(/\b(19|20)\d{2}\b/);
//       if (!eduItem.year && yearMatch) {
//         eduItem.year = yearMatch[0];
//         console.log(`    📅 Found year: "${eduItem.year}"`);
//       }
      
//       // Check for GPA
//       const gpaMatch = line.match(/GPA[:\s]*([0-9.]+)|([0-9.]+)\s*GPA/i);
//       if (!eduItem.gpa && gpaMatch) {
//         eduItem.gpa = gpaMatch[1] || gpaMatch[2];
//         console.log(`    📊 Found GPA: "${eduItem.gpa}"`);
//       }
//     });

//     // Add if we found something meaningful
//     if (eduItem.degree || eduItem.institution || eduItem.year) {
//       education.push(eduItem);
//       console.log(`✅ Added education item:`, eduItem);
//     } else {
//       console.log(`❌ No meaningful education data in block ${index + 1}`);
//     }
//   });

//   console.log(`🎓 Final education result: ${education.length} items`);
  
//   // Return at least one empty item if nothing found
//   return education.length > 0 ? education : [{
//     institution: '',
//     degree: '',
//     fieldOfStudy: '',
//     year: '',
//     gpa: ''
//   }];
// }

// /**
//  * Parses experience section
//  * @param {string} experienceText - Experience section text
//  * @returns {Array} Array of experience objects
//  */
// function parseExperience(experienceText) {
//   console.log('💼 Parsing experience...');
//   console.log('💼 Experience text:', experienceText?.substring(0, 200) || 'No text');
  
//   if (!experienceText) {
//     console.log('❌ No experience text provided');
//     return [{
//       company: '',
//       position: '',
//       startDate: '',
//       endDate: '',
//       description: '',
//       currentJob: false
//     }];
//   }

//   const experience = [];
  
//   // Split into potential experience entries
//   const blocks = experienceText
//     .split(/\n\s*\n+/) // Split by blank lines
//     .filter(block => block.trim())
//     .map(block => block.trim());
  
//   console.log('💼 Found', blocks.length, 'experience blocks');
  
//   // If no blocks, treat entire text as one experience entry
//   if (blocks.length === 0) {
//     blocks.push(experienceText.trim());
//   }

//   blocks.forEach((block, index) => {
//     console.log(`💼 Processing experience block ${index + 1}:`, block);
    
//     const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    
//     const expItem = {
//       company: '',
//       position: '',
//       startDate: '',
//       endDate: '',
//       description: '',
//       currentJob: false
//     };

//     if (lines.length === 0) return;

//     // First line usually has position and/or company
//     const firstLine = lines[0];
//     console.log(`  📄 First line: "${firstLine}"`);
    
//     // Try to extract position and company from first line
//     const patterns = [
//       /^(.+?)\s+at\s+(.+)$/i,           // "Software Engineer at Google"
//       /^(.+?)\s*[-|]\s*(.+)$/,          // "Software Engineer - Google"  
//       /^(.+?),\s*(.+)$/,                // "Software Engineer, Google"
//     ];
    
//     let found = false;
//     patterns.forEach((pattern, patIndex) => {
//       if (!found) {
//         const match = firstLine.match(pattern);
//         if (match) {
//           expItem.position = match[1].trim();
//           expItem.company = match[2].trim();
//           found = true;
//           console.log(`    💼 Found position/company with pattern ${patIndex + 1}: "${expItem.position}" at "${expItem.company}"`);
//         }
//       }
//     });
    
//     // If no pattern matched, assume first line is position
//     if (!found) {
//       expItem.position = firstLine;
//       console.log(`    💼 Using first line as position: "${expItem.position}"`);
      
//       // Try to find company in second line
//       if (lines.length > 1 && lines[1].length < 50 && !lines[1].match(/\d{4}/)) {
//         expItem.company = lines[1];
//         console.log(`    🏢 Found company in second line: "${expItem.company}"`);
//       }
//     }

//     // Look for dates in any line
//     const datePatterns = [
//       /(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|Present|Current)/i,
//       /(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i,
//       /(\d{1,2}\/\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|Present|Current)/i
//     ];
    
//     lines.forEach(line => {
//       datePatterns.forEach((pattern, patIndex) => {
//         if (!expItem.startDate) {
//           const match = line.match(pattern);
//           if (match) {
//             expItem.startDate = match[1];
//             expItem.endDate = match[2];
//             expItem.currentJob = match[2].toLowerCase().includes('present') || 
//                                match[2].toLowerCase().includes('current');
//             console.log(`    📅 Found dates with pattern ${patIndex + 1}: "${expItem.startDate}" - "${expItem.endDate}"`);
//           }
//         }
//       });
//     });

//     // Get description from remaining lines
//     const descLines = lines.filter(line => {
//       // Skip lines we already used
//       if (line === expItem.position || line === expItem.company) return false;
//       // Skip date lines
//       if (datePatterns.some(pattern => pattern.test(line))) return false;
//       // Keep lines that are long enough to be descriptions
//       return line.length > 10;
//     });
    
//     expItem.description = descLines.join(' ').trim();
//     console.log(`    📝 Description: "${expItem.description.substring(0, 50)}..."`);

//     // Add if we found meaningful data
//     if (expItem.position && (expItem.company || expItem.description)) {
//       experience.push(expItem);
//       console.log(`✅ Added experience item:`, expItem);
//     } else {
//       console.log(`❌ No meaningful experience data in block ${index + 1}`);
//     }
//   });

//   console.log(`💼 Final experience result: ${experience.length} items`);
  
//   // Return at least one empty item if nothing found
//   return experience.length > 0 ? experience : [{
//     company: '',
//     position: '',
//     startDate: '',
//     endDate: '',
//     description: '',
//     currentJob: false
//   }];
// }

// /**
//  * Parses skills section
//  * @param {string} skillsText - Skills section text
//  * @returns {Array} Array of skills
//  */
// function parseSkills(skillsText) {
//   const skills = [];
  
//   // Split by common delimiters
//   const skillItems = skillsText
//     .split(/[,\n•·\-\*]/)
//     .map(skill => skill.trim())
//     .filter(skill => skill && skill.length > 1);

//   return skillItems.length > 0 ? skillItems : [];
// }

// /**
//  * Parses certifications section
//  * @param {string} certText - Certifications section text
//  * @returns {Array} Array of certifications
//  */
// function parseCertifications(certText) {
//   const certifications = [];
//   const lines = certText.split('\n').filter(line => line.trim());

//   for (const line of lines) {
//     const cert = {
//       name: '',
//       issuer: '',
//       year: ''
//     };

//     // Extract certification name and issuer
//     const certMatch = line.match(/^([^,\n]+)(?:,\s*([^,\n]+))?/);
//     if (certMatch) {
//       cert.name = certMatch[1].trim();
//       if (certMatch[2]) {
//         cert.issuer = certMatch[2].trim();
//       }
//     }

//     // Extract year
//     const yearMatch = line.match(/\b(19|20)\d{2}\b/);
//     if (yearMatch) {
//       cert.year = yearMatch[0];
//     }

//     if (cert.name) {
//       certifications.push(cert);
//     }
//   }

//   return certifications;
// }

// /**
//  * Validates parsed resume data
//  * @param {Object} parsedData - Parsed resume data
//  * @returns {Object} Validation results
//  */
// export function validateResumeData(parsedData) {
//   const validation = {
//     isValid: true,
//     errors: [],
//     warnings: []
//   };

//   // Check required fields
//   if (!parsedData.name) {
//     validation.warnings.push('Name not found in resume');
//   }

//   if (!parsedData.email) {
//     validation.errors.push('Email address not found');
//     validation.isValid = false;
//   }

//   if (!parsedData.phone) {
//     validation.warnings.push('Phone number not found');
//   }

//   if (!parsedData.experience || parsedData.experience.length === 0) {
//     validation.warnings.push('No work experience found');
//   }

//   if (!parsedData.education || parsedData.education.length === 0) {
//     validation.warnings.push('No education information found');
//   }

//   return validation;
// }

// /**
//  * Processes uploaded resume file
//  * @param {File} file - Resume file
//  * @returns {Promise<Object>} Parsed resume data
//  */
// export async function processResumeFile(file) {
//   if (!file) {
//     throw new Error('No file provided');
//   }

//   const allowedTypes = [
//     'application/pdf', 
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'text/plain'
//   ];

//   if (!allowedTypes.includes(file.type)) {
//     throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.');
//   }

//   try {
//     let text = '';
    
//     if (file.type === 'text/plain') {
//       text = await file.text();
//     } else {

//       // This is a placeholder for actual file processing
//       text = await extractTextFromFile(file);
//     }

//     return parseResumeText(text, file);
//   } catch (error) {
//     console.error('Error processing resume file:', error);
//     throw new Error('Failed to process resume file');
//   }
// }

// /**
//  * Placeholder for actual file text extraction
//  * @param {File} file - File to extract text from
//  * @returns {Promise<string>} Extracted text
//  */
// async function extractTextFromFile(file) {
//   // This is a placeholder - actual implementation would depend on file type
//   // and chosen libraries for text extraction
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve('Sample extracted text from ' + file.name);
//     }, 1000);
//   });
// }

// ms2 final

