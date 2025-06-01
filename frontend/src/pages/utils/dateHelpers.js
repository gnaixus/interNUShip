// src/utils/dateHelpers.js

/**
 * Converts a date from YYYY-MM-DD format to DD/MM/YYYY format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
export const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Converts a date from DD/MM/YYYY format to YYYY-MM-DD format (for HTML date inputs)
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return '';
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return '';
  
  const [day, month, year] = parts;
  
  // Validate the parts
  if (!day || !month || !year) return '';
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date object to DD/MM/YYYY string
 * @param {Date} date - Date object
 * @returns {string} Date in DD/MM/YYYY format
 */
export const formatDateObjectToDDMMYYYY = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Gets today's date in DD/MM/YYYY format
 * @returns {string} Today's date in DD/MM/YYYY format
 */
export const getTodayDDMMYYYY = () => {
  return formatDateObjectToDDMMYYYY(new Date());
};

/**
 * Gets today's date in YYYY-MM-DD format (for HTML date input max attribute)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayYYYYMMDD = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Validates if a date string is in DD/MM/YYYY format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid DD/MM/YYYY format
 */
export const isValidDDMMYYYY = (dateString) => {
  if (!dateString) return false;
  
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  
  // Basic validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Create date and check if it's valid
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
};

/**
 * Calculates age from date of birth in DD/MM/YYYY format
 * @param {string} dobString - Date of birth in DD/MM/YYYY format
 * @returns {number} Age in years, or null if invalid date
 */
export const calculateAge = (dobString) => {
  if (!isValidDDMMYYYY(dobString)) return null;
  
  const [day, month, year] = dobString.split('/').map(Number);
  const dob = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};