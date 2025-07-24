import pdfplumber
import spacy
import re
import logging
import dateparser
from datetime import datetime

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
    print("SpaCy model loaded successfully")
except OSError:
    print("Please install spaCy English model: python -m spacy download en_core_web_sm")
    nlp = None

# Set up logging - make sure this is available for import
logging.basicConfig(level=logging.INFO)

# Skills database
SKILLS_DB = [
    "python", "java", "sql", "excel", "javascript", "react", "node.js",
    "machine learning", "data analysis", "communication", "project management",
    "html", "css", "typescript", "vue.js", "angular", "django", "flask",
    "mysql", "postgresql", "mongodb", "aws", "azure", "docker", "git",
    "kubernetes", "jenkins", "tensorflow", "pytorch", "pandas", "numpy"
]

# Degree keywords
DEGREES_DB = [
    "bachelor", "b.sc", "b.s.", "ba", "b.a.", "master", "m.sc", "m.s.",
    "mba", "phd", "btech", "mtech", "associate", "diploma", "certificate"
]

# Company keywords
COMPANY_DB = [
    "pte ltd", "ltd", "llc", "inc", "corp", "corporation", "company", "co",
    "technologies", "tech", "systems", "solutions", "consulting", "services",
    "group", "international", "global", "holdings", "partners"
]

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        text_content = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
        
        full_text = "\n".join(text_content)
        if not full_text.strip():
            logging.warning("No text extracted from PDF")
            return ""
        
        return full_text
    except Exception as e:
        logging.error(f"Failed to extract PDF text: {e}")
        return ""

def extract_name_email_phone(text):
    """Extract name, email, and phone from text"""
    name = ""
    email = ""
    phone = ""
    
    # Extract email
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    email_match = re.search(email_pattern, text)
    if email_match:
        email = email_match.group().strip()
    
    # # Extract phone
    # phone_patterns = [
    #     r"\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
    #     r"\+?\d[\d\s\-\(\)]{8,}\d"
    # ]
    
    # for pattern in phone_patterns:
    #     phone_match = re.search(pattern, text)
    #     if phone_match:
    #         phone = phone_match.group().strip()
    #         break
    
    singapore_phone_patterns = [
        r"\+65[-\s]?[89]\d{3}[-\s]?\d{4}",  # +65 8XXX XXXX or +65 9XXX XXXX
        r"\+65[-\s]?6\d{3}[-\s]?\d{4}",     # +65 6XXX XXXX (landline)
        r"65[-\s]?[89]\d{3}[-\s]?\d{4}",    # 65 8XXX XXXX or 65 9XXX XXXX (without +)
        r"65[-\s]?6\d{3}[-\s]?\d{4}",       # 65 6XXX XXXX (landline without +)
        r"\(65\)[-\s]?[689]\d{3}[-\s]?\d{4}", # (65) XXXX XXXX
        r"[89]\d{3}[-\s]?\d{4}",            # 8XXX XXXX or 9XXX XXXX (local mobile)
        r"6\d{3}[-\s]?\d{4}",               # 6XXX XXXX (local landline)
    ]
    
    for pattern in singapore_phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            phone = phone_match.group().strip()
            break
    
    # Extract name using spaCy if available
    if nlp:
        try:
            doc = nlp(text[:500])  # Process first 500 chars
            person_entities = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
            if person_entities:
                name = person_entities[0].strip()
        except Exception as e:
            logging.warning(f"spaCy name extraction failed: {e}")
    
    # Fallback name extraction
    if not name:
        lines = text.split('\n')[:5]
        for line in lines:
            line = line.strip()
            # Look for lines that look like names (2-4 words, no numbers/emails)
            if (line and 
                not re.search(r'[@\d().]', line) and 
                len(line.split()) >= 2 and 
                len(line.split()) <= 4 and
                len(line) < 50):
                name = line
                break
    
    return name, email, phone

def extract_skills(text):
    """Extract skills from text"""
    text_lower = text.lower()
    found_skills = []
    
    for skill in SKILLS_DB:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))  # Remove duplicates

def extract_degrees(text):
    """Extract degrees from text"""
    text_lower = text.lower()
    found_degrees = []
    
    for degree in DEGREES_DB:
        if degree.lower() in text_lower:
            found_degrees.append(degree)
    
    return list(set(found_degrees))  # Remove duplicates

def extract_experience(text):
    """Extract work experience from text"""
    lines = text.split('\n')
    experience_entries = []

    # Date pattern for work experience
    date_pattern = re.compile(
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?\d{4}\s?[-–to]+\s?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?(?:\d{4}|present|current)",
        re.IGNORECASE
    )

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Check if line contains company indicators
        has_company = any(keyword in line.lower() for keyword in COMPANY_DB)
        has_date = date_pattern.search(line)
        
        if has_company and has_date:
            experience_entries.append(line)
        elif has_company:
            # Look at next line for date
            next_line = lines[i + 1] if i + 1 < len(lines) else ""
            if date_pattern.search(next_line):
                experience_entries.append(f"{line} {next_line.strip()}")

    return list(set(experience_entries))  # Remove duplicates

def calculate_experience_years(experience_entries):
    """Calculate total years of experience"""
    total_months = 0
    
    for entry in experience_entries:
        # Find date ranges in the entry
        date_matches = re.findall(
            r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?\d{4})\s?[-–to]+\s?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?(?:\d{4}|present|current))",
            entry, 
            flags=re.IGNORECASE
        )
        
        for start_str, end_str in date_matches:
            try:
                start_date = dateparser.parse(start_str)
                if re.search(r"present|current", end_str, re.IGNORECASE):
                    end_date = datetime.today()
                else:
                    end_date = dateparser.parse(end_str)
                
                if start_date and end_date and end_date >= start_date:
                    months_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                    total_months += max(0, months_diff)
            except Exception as e:
                logging.warning(f"Failed to parse dates {start_str} - {end_str}: {e}")
                continue

    return round(total_months / 12, 1) if total_months > 0 else 0.0

def parse_resume(file_path):
    """
    Main function to parse resume - THIS IS WHAT main.py IMPORTS
    
    Args:
        file_path (str): Path to the resume file
        
    Returns:
        dict: Parsed resume data
    """
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(file_path)
        
        if not text or len(text.strip()) < 50:
            logging.warning(f"Insufficient text extracted from {file_path}")
            return {
                "name": "",
                "email": "",
                "phone": "",
                "skills": [],
                "degree": [],
                "experience": [],
                "total_experience_years": 0.0
            }

        # Extract information
        name, email, phone = extract_name_email_phone(text)
        skills = extract_skills(text)
        degrees = extract_degrees(text)
        experience = extract_experience(text)
        total_exp_years = calculate_experience_years(experience)

        result = {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "degree": degrees,
            "experience": experience,
            "total_experience_years": total_exp_years
        }
        
        logging.info(f"Successfully parsed resume: {name or 'Unknown'}")
        return result
        
    except Exception as e:
        logging.error(f"Error parsing resume {file_path}: {e}")
        return {
            "name": "",
            "email": "",
            "phone": "",
            "skills": [],
            "degree": [],
            "experience": [],
            "total_experience_years": 0.0
        }

# Test function
def test_parser():
    """Test function for the parser"""
    try:
        result = parse_resume("sample_resume.pdf")
        print("Resume parsing test results:")
        print(f"Name: {result['name']}")
        print(f"Email: {result['email']}")
        print(f"Phone: {result['phone']}")
        print(f"Skills: {result['skills']}")
        print(f"Degrees: {result['degree']}")
        print(f"Experience: {result['total_experience_years']} years")
        return result
    except Exception as e:
        print(f"Test error: {e}")
        return None

__all__ = ['parse_resume', 'logging']

if __name__ == "__main__":
    test_parser()