import pdfplumber
import spacy
import re
import logging
import dateparser
from datetime import datetime

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Please install spaCy English model: python -m spacy download en_core_web_sm")
    nlp = None

# Set up logging
logging.basicConfig(level=logging.ERROR)

# Sample skills list (customize as needed)
SKILLS_DB = [
    "python", "java", "sql", "excel", "javascript", "react", "node.js",
    "machine learning", "data analysis", "communication", "project management",
    "html", "css", "typescript", "vue.js", "angular", "django", "flask",
    "mysql", "postgresql", "mongodb", "aws", "azure", "docker", "git"
]

# Common degree keywords
DEGREES_DB = [
    "bachelor", "b.sc", "b.s.", "ba", "b.a.", "master", "m.sc", "m.s.",
    "mba", "phd", "btech", "mtech", "associate", "diploma"
]

# Company keywords
COMPANY_DB = [
    "pte ltd", "ltd", "llc", "inc", "corp", "corporation", "company", "co",
    "technologies", "tech", "systems", "solutions", "consulting", "services",
    "group", "international", "global", "holdings", "partners"
]

def extract_text_from_pdf(path):
    try:
        with pdfplumber.open(path) as pdf:
            return "\n".join([page.extract_text() or '' for page in pdf.pages])
    except Exception as e:
        logging.error(f"Failed to extract PDF text: {e}")
        return ""

def extract_name_email_phone(text):
    name = ""
    email = ""
    phone = ""
    
    # Extract email
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}", text)
    if email_match:
        email = email_match.group().strip()
    
    # Extract phone
    phone_match = re.search(r"\+?\d[\d\s\-\(\)]{8,}\d", text)
    if phone_match:
        phone = phone_match.group().strip()
    
    # Extract name using spaCy if available
    if nlp:
        doc = nlp(text[:500])  # Process first 500 chars
        person_entities = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
        if person_entities:
            name = person_entities[0].strip()
    
    # Fallback name extraction
    if not name:
        lines = text.split('\n')[:5]
        for line in lines:
            line = line.strip()
            if line and not re.search(r'[@\d()]', line) and len(line.split()) <= 4:
                name = line
                break
    
    return name, email, phone

def extract_skills(text):
    text_lower = text.lower()
    return list({skill for skill in SKILLS_DB if skill in text_lower})

def extract_degrees(text):
    text_lower = text.lower()
    return list({deg for deg in DEGREES_DB if deg in text_lower})

def extract_companies(text):
    return list({line.strip() for line in text.split('\n') if any(kw in line.lower() for kw in COMPANY_DB)})

def extract_experience(text):
    lines = text.split('\n')
    experience_entries = []

    date_pattern = re.compile(
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?\d{4}\s?[-–to]+\s?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?(?:\d{4}|present|current)",
        re.IGNORECASE
    )

    for i, line in enumerate(lines):
        if any(kw in line.lower() for kw in COMPANY_DB) and date_pattern.search(line):
            experience_entries.append(line.strip())
        elif any(kw in line.lower() for kw in COMPANY_DB):
            # Look ahead one line for date
            next_line = lines[i+1] if i+1 < len(lines) else ""
            if date_pattern.search(next_line):
                experience_entries.append(f"{line.strip()} {next_line.strip()}")

    return list(set(experience_entries))

def calculate_experience_years(experience_entries):
    """Calculate total years of experience from experience entries."""
    total_months = 0
    
    for entry in experience_entries:
        # Look for date ranges in the entry
        date_matches = re.findall(
            r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?\d{4})\s?[-–to]+\s?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?(?:\d{4}|present|current))",
            entry, flags=re.IGNORECASE
        )
        
        for start_str, end_str in date_matches:
            try:
                start = dateparser.parse(start_str)
                end = datetime.today() if re.search(r"present|current", end_str, re.IGNORECASE) else dateparser.parse(end_str)
                if start and end:
                    diff = (end.year - start.year) * 12 + (end.month - start.month)
                    total_months += max(0, diff)
            except Exception:
                continue

    return round(total_months / 12, 1)  # in years

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path)
    if not text:
        return {
            "name": "", "email": "", "phone": "",
            "skills": [], "degree": [], "experience": [],
            "total_experience_years": 0
        }

    name, email, phone = extract_name_email_phone(text)
    skills = extract_skills(text)
    degrees = extract_degrees(text)
    experience = extract_experience(text)
    total_exp_years = calculate_experience_years(experience)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "degree": degrees,
        "experience": experience,
        "total_experience_years": total_exp_years
    }

# Example usage
if __name__ == "__main__":
    # Test the parser
    try:
        result = parse_resume("sample_resume.pdf")
        print("Resume parsing results:")
        print(f"Name: {result['name']}")
        print(f"Email: {result['email']}")
        print(f"Phone: {result['phone']}")
        print(f"Skills: {result['skills']}")
        print(f"Degrees: {result['degree']}")
        print(f"Experience: {result['total_experience_years']} years")
    except Exception as e:
        print(f"Error: {e}")