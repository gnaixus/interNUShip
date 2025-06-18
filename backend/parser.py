import pdfplumber
import spacy
import re
import logging
import dateparser
from datetime import datetime

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Set up logging
logging.basicConfig(level=logging.ERROR)

# Sample skills list (customize as needed)
SKILLS_DB = [
    "python", "java", "sql", "excel", "javascript", "react", "node.js",
    "machine learning", "data analysis", "communication", "project management"
]

# Common degree keywords
DEGREES_DB = [
    "bachelor", "b.sc", "b.s.", "ba", "b.a.", "master", "m.sc", "m.s.",
    "mba", "phd", "btech", "mtech", "associate", "diploma"
]

def extract_text_from_pdf(path):
    try:
        with pdfplumber.open(path) as pdf:
            return "\n".join([page.extract_text() or '' for page in pdf.pages])
    except Exception as e:
        logging.error(f"Failed to extract PDF text: {e}")
        return ""

def extract_name_email_phone(text):
    doc = nlp(text)
    
    name = next((ent.text for ent in doc.ents if ent.label_ == "PERSON"), "")
    
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}", text)
    phone_match = re.search(r"\+?\d[\d\s\-\(\)]{8,}\d", text)
    
    return name.strip(), (email_match.group().strip() if email_match else ""), (phone_match.group().strip() if phone_match else "")

def extract_skills(text):
    text_lower = text.lower()
    return list({skill for skill in SKILLS_DB if skill in text_lower})

def extract_degrees(text):
    text_lower = text.lower()
    return list({deg for deg in DEGREES_DB if deg in text_lower})

def extract_companies(text):
    return list({line.strip() for line in text.split('\n') if any(kw in line for kw in COMPANY_DB)})
# def extract_experience(text):
#     # Look for date ranges like "Jan 2020 - May 2023" or "2018 to Present"
#     date_ranges = re.findall(
#         r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?\d{4})\s?[-–to]+\s?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?(?:\d{4}|present|current))",
#         text, flags=re.IGNORECASE
#     )
    
#     total_months = 0
#     for start_str, end_str in date_ranges:
#         try:
#             start = dateparser.parse(start_str)
#             end = datetime.today() if re.search(r"present|current", end_str, re.IGNORECASE) else dateparser.parse(end_str)
#             if start and end:
#                 diff = (end.year - start.year) * 12 + (end.month - start.month)
#                 total_months += max(0, diff)
#         except Exception:
#             continue

#     return round(total_months / 12, 1)  # in years

def extract_experience(text):
    lines = text.split('\n')
    experience_entries = []
    company_keywords = ["Pte Ltd", "Ltd", "LLC", "Inc", "Partners", "Technologies"]

    date_pattern = re.compile(
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?\d{4}\s?[-–to]+\s?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\.?\s?(?:\d{4}|present|current)",
        re.IGNORECASE
    )

    for i, line in enumerate(lines):
        if any(kw in line for kw in company_keywords) and date_pattern.search(line):
            experience_entries.append(line.strip())
        elif any(kw in line for kw in company_keywords):
            # Look ahead one line for date
            next_line = lines[i+1] if i+1 < len(lines) else ""
            if date_pattern.search(next_line):
                experience_entries.append(f"{line.strip()} {next_line.strip()}")

    return list(set(experience_entries))

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path)
    if not text:
        return {
            "name": "", "email": "", "phone": "",
            "skills": [], "degree": [], "experience": []
        }

    name, email, phone = extract_name_email_phone(text)
    skills = extract_skills(text)
    degrees = extract_degrees(text)
    experience = extract_experience(text)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "degree": degrees,
        "experience": experience
    }
