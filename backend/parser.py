import nltk
import spacy
import logging
from pyresparser import ResumeParser
import os

# Set up logging
logging.basicConfig(level=logging.ERROR)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load spaCy model with error handling
try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    print("spaCy model 'en_core_web_sm' not found. Please install it:")
    print("python -m spacy download en_core_web_sm")
    raise

def parse_resume(file_path):
    """
    Parse resume using pyresparser with enhanced error handling
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Resume file not found: {file_path}")
        
        # Parse resume
        data = ResumeParser(file_path).get_extracted_data()
        
        # Return structured data with safe gets
        return {
            'name': data.get('name', ''),
            'email': data.get('email', ''),
            'phone': data.get('mobile_number', ''),
            'skills': data.get('skills', []) if data.get('skills') else [],
            'degree': data.get('degree', []) if data.get('degree') else [],
            'experience': data.get('total_experience', 0),
            'designation': data.get('designation', []) if data.get('designation') else []
        }
    
    except Exception as e:
        logging.error(f"Error parsing resume {file_path}: {str(e)}")
        # Return empty structure on error
        return {
            'name': '',
            'email': '',
            'phone': '',
            'skills': [],
            'degree': [],
            'experience': 0,
            'designation': []
        }
