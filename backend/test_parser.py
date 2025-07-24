import pytest
import os
import tempfile
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import pdfplumber

from parser import (
    extract_text_from_pdf,
    extract_name_email_phone,
    extract_skills,
    extract_degrees,
    extract_experience,
    calculate_experience_years,
    parse_resume,
    SKILLS_DB,
    DEGREES_DB,
    COMPANY_DB
)


class TestExtractTextFromPDF:
    """Test cases for extract_text_from_pdf function"""
    
    def test_extract_text_success(self):
        """Test successful text extraction from PDF"""
        with patch('parser.pdfplumber.open') as mock_open:
            # Mock PDF with pages
            mock_page = Mock()
            mock_page.extract_text.return_value = "Sample resume text"
            mock_pdf = Mock()
            mock_pdf.pages = [mock_page]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            result = extract_text_from_pdf("test.pdf")
            assert result == "Sample resume text"
    
    def test_extract_text_multiple_pages(self):
        """Test text extraction from multiple page PDF"""
        with patch('parser.pdfplumber.open') as mock_open:
            mock_page1 = Mock()
            mock_page1.extract_text.return_value = "Page 1 text"
            mock_page2 = Mock()
            mock_page2.extract_text.return_value = "Page 2 text"
            
            mock_pdf = Mock()
            mock_pdf.pages = [mock_page1, mock_page2]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            result = extract_text_from_pdf("test.pdf")
            assert result == "Page 1 text\nPage 2 text"
    
    def test_extract_text_empty_pdf(self):
        """Test handling of empty PDF"""
        with patch('parser.pdfplumber.open') as mock_open:
            mock_page = Mock()
            mock_page.extract_text.return_value = ""
            mock_pdf = Mock()
            mock_pdf.pages = [mock_page]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            result = extract_text_from_pdf("test.pdf")
            assert result == ""
    
    def test_extract_text_file_error(self):
        """Test handling of file reading errors"""
        with patch('parser.pdfplumber.open', side_effect=Exception("File not found")):
            result = extract_text_from_pdf("nonexistent.pdf")
            assert result == ""


class TestExtractNameEmailPhone:
    """Test cases for extract_name_email_phone function"""
    
    def test_extract_email_basic(self):
        """Test basic email extraction"""
        text = "Contact: john.doe@example.com"
        name, email, phone = extract_name_email_phone(text)
        assert email == "john.doe@example.com"
    
    def test_extract_phone_basic(self):
        """Test basic Singapore phone extraction"""
        text = "Phone: +65 9123 4567"
        name, email, phone = extract_name_email_phone(text)
        assert phone == "+65 9123 4567"
    
    def test_extract_phone_formats(self):
        """Test various Singapore phone number formats"""
        test_cases = [
            ("Phone: +65 9123 4567", "+65 9123 4567"),      # Standard mobile format
            ("Call: +65-8456-7890", "+65-8456-7890"),        # Mobile with dashes
            ("Mobile: +65 6234 5678", "+65 6234 5678"),      # Landline format
            ("Contact: 9123 4567", "9123 4567"),              # Local mobile format
            ("Office: 6234 5678", "6234 5678"),              # Local landline format
            ("Phone: (65) 9123 4567", "(65) 9123 4567"),     # With parentheses
        ]
        
        for text, expected in test_cases:
            _, _, phone = extract_name_email_phone(text)
            assert phone == expected
    
    @patch('parser.nlp')
    def test_extract_name_with_spacy(self, mock_nlp):
        """Test name extraction using spaCy"""
        # Mock spaCy entities
        mock_entity = Mock()
        mock_entity.text = "John Doe"
        mock_entity.label_ = "PERSON"
        
        mock_doc = Mock()
        mock_doc.ents = [mock_entity]
        mock_nlp.return_value = mock_doc
        
        text = "John Doe is a software engineer"
        name, _, _ = extract_name_email_phone(text)
        assert name == "John Doe"
    
    def test_extract_name_fallback(self):
        """Test fallback name extraction when spaCy fails"""
        with patch('parser.nlp', None):  # Simulate spaCy not available
            text = "John Doe\nSoftware Engineer\njohn@example.com"
            name, _, _ = extract_name_email_phone(text)
            assert name == "John Doe"
    
    def test_extract_all_info(self):
        """Test extracting name, email, and phone together"""
        text = """
        John Smith
        Software Developer
        Email: john.smith@company.com
        Phone: +65 9123 4567
        """
        name, email, phone = extract_name_email_phone(text)
        assert email == "john.smith@company.com"
        assert phone == "+65 9123 4567"


class TestExtractSkills:
    """Test cases for extract_skills function"""
    
    def test_extract_basic_skills(self):
        """Test basic skill extraction"""
        text = "I have experience with Python, Java, and SQL"
        skills = extract_skills(text)
        assert "python" in skills
        assert "java" in skills
        assert "sql" in skills
    
    def test_extract_case_insensitive(self):
        """Test case-insensitive skill extraction"""
        text = "PYTHON, JavaScript, Html"
        skills = extract_skills(text)
        assert "python" in skills
        assert "javascript" in skills
        assert "html" in skills
    
    def test_extract_no_skills(self):
        """Test handling when no skills are found"""
        text = "This is just some random text with no technical skills"
        skills = extract_skills(text)
        assert len(skills) == 0
    
    def test_extract_duplicate_skills(self):
        """Test removal of duplicate skills"""
        text = "Python, python, PYTHON, Java"
        skills = extract_skills(text)
        assert skills.count("python") == 1
        assert "java" in skills


class TestExtractDegrees:
    """Test cases for extract_degrees function"""
    
    def test_extract_basic_degrees(self):
        """Test basic degree extraction"""
        text = "I have a Bachelor's degree and an MBA"
        degrees = extract_degrees(text)
        assert "bachelor" in degrees
        assert "mba" in degrees
    
    def test_extract_degree_variations(self):
        """Test various degree format extractions"""
        text = "B.Sc in Computer Science, M.S. in Data Science"
        degrees = extract_degrees(text)
        assert "b.sc" in degrees
        assert "m.s." in degrees
    
    def test_extract_no_degrees(self):
        """Test handling when no degrees are found"""
        text = "Just some text without any educational qualifications"
        degrees = extract_degrees(text)
        assert len(degrees) == 0


class TestExtractExperience:
    """Test cases for extract_experience function"""
    
    def test_extract_basic_experience(self):
        """Test basic experience extraction"""
        text = """
        Software Engineer at Google Inc
        Jan 2020 - Dec 2022
        
        Data Analyst at Microsoft Corp
        2018 - 2020
        """
        experience = extract_experience(text)
        assert len(experience) >= 1
        # Check if any experience entry contains company indicators
        has_company = any(any(comp in exp.lower() for comp in COMPANY_DB) for exp in experience)
        assert has_company
    
    def test_extract_experience_with_present(self):
        """Test experience extraction with 'present' end date"""
        text = "Senior Developer at Tech Solutions Ltd\nMar 2020 - Present"
        experience = extract_experience(text)
        assert len(experience) >= 1
    
    def test_extract_no_experience(self):
        """Test handling when no experience is found"""
        text = "Just some random text without work experience"
        experience = extract_experience(text)
        assert len(experience) == 0


class TestCalculateExperienceYears:
    """Test cases for calculate_experience_years function"""
    
    @patch('parser.dateparser')
    def test_calculate_basic_years(self, mock_dateparser):
        """Test basic years calculation"""
        # Mock dateparser to return specific dates
        mock_dateparser.parse.side_effect = [
            datetime(2020, 1, 1),  # start date
            datetime(2022, 12, 1)  # end date - adjusted to give exactly 2.9 years
        ]
        
        experience_entries = ["Software Engineer Jan 2020 - Dec 2022"]
        years = calculate_experience_years(experience_entries)
        assert years == 2.9
    
    @patch('parser.dateparser')
    def test_calculate_exact_years(self, mock_dateparser):
        """Test exact years calculation"""
        # Mock dateparser to return dates that give exactly 3 years
        mock_dateparser.parse.side_effect = [
            datetime(2020, 1, 1),  # start date
            datetime(2023, 1, 1)   # end date - exactly 3 years
        ]
        
        experience_entries = ["Software Engineer Jan 2020 - Jan 2023"]
        years = calculate_experience_years(experience_entries)
        assert years == 3.0
    
    @patch('parser.dateparser')
    def test_calculate_with_months(self, mock_dateparser):
        """Test years calculation with partial months"""
        mock_dateparser.parse.side_effect = [
            datetime(2020, 6, 1),   # start date
            datetime(2021, 6, 1)    # end date (exactly 1 year)
        ]
        
        experience_entries = ["Developer Jun 2020 - Jun 2021"]
        years = calculate_experience_years(experience_entries)
        assert years == 1.0
    
    def test_calculate_with_present(self):
        """Test calculation with 'present' as end date"""
        with patch('parser.dateparser') as mock_dateparser, \
             patch('parser.datetime') as mock_datetime:
            
            mock_dateparser.parse.return_value = datetime(2020, 1, 1)
            mock_datetime.today.return_value = datetime(2024, 1, 1)
            
            experience_entries = ["Developer Jan 2020 - present"]
            years = calculate_experience_years(experience_entries)
            assert years >= 3.0  # Should be about 4 years
    
    def test_calculate_invalid_dates(self):
        """Test handling of invalid date formats"""
        experience_entries = ["Invalid date format"]
        years = calculate_experience_years(experience_entries)
        assert years == 0.0
    
    def test_calculate_multiple_experiences(self):
        """Test calculation with multiple experience entries"""
        with patch('parser.dateparser') as mock_dateparser:
            # Mock multiple date pairs
            mock_dateparser.parse.side_effect = [
                datetime(2018, 1, 1), datetime(2020, 1, 1),  # 2 years
                datetime(2020, 6, 1), datetime(2022, 6, 1),  # 2 years
            ]
            
            experience_entries = [
                "Job 1: Jan 2018 - Jan 2020",
                "Job 2: Jun 2020 - Jun 2022"
            ]
            years = calculate_experience_years(experience_entries)
            assert years == 4.0


class TestParseResume:
    """Test cases for parse_resume function"""
    
    @patch('parser.extract_text_from_pdf')
    @patch('parser.extract_name_email_phone')
    @patch('parser.extract_skills')
    @patch('parser.extract_degrees')
    @patch('parser.extract_experience')
    @patch('parser.calculate_experience_years')
    def test_parse_resume_success(self, mock_calc_exp, mock_extract_exp, 
                                 mock_extract_deg, mock_extract_skills,
                                 mock_extract_info, mock_extract_text):
        """Test successful resume parsing"""
        # Setup mocks
        mock_extract_text.return_value = "Sample resume text with enough content to pass validation"
        mock_extract_info.return_value = ("John Doe", "john@example.com", "555-1234")
        mock_extract_skills.return_value = ["python", "java"]
        mock_extract_deg.return_value = ["bachelor"]
        mock_extract_exp.return_value = ["Software Engineer at Company"]
        mock_calc_exp.return_value = 3.5
        
        result = parse_resume("test.pdf")
        
        assert result["name"] == "John Doe"
        assert result["email"] == "john@example.com" 
        assert result["phone"] == "555-1234"
        assert result["skills"] == ["python", "java"]
        assert result["degree"] == ["bachelor"]
        assert result["total_experience_years"] == 3.5
    
    @patch('parser.extract_text_from_pdf')
    def test_parse_resume_insufficient_text(self, mock_extract_text):
        """Test handling of insufficient text"""
        mock_extract_text.return_value = "Short"  # Less than 50 characters
        
        result = parse_resume("test.pdf")
        
        # Should return empty structure
        assert result["name"] == ""
        assert result["email"] == ""
        assert result["phone"] == ""
        assert result["skills"] == []
        assert result["degree"] == []
        assert result["experience"] == []
        assert result["total_experience_years"] == 0.0
    
    @patch('parser.extract_text_from_pdf')
    def test_parse_resume_exception_handling(self, mock_extract_text):
        """Test exception handling in parse_resume"""
        mock_extract_text.side_effect = Exception("PDF processing error")
        
        result = parse_resume("test.pdf")
        
        # Should return empty structure on exception
        assert result["name"] == ""
        assert result["email"] == ""
        assert result["phone"] == ""
        assert result["skills"] == []
        assert result["degree"] == []
        assert result["experience"] == []
        assert result["total_experience_years"] == 0.0


class TestConstants:
    """Test the predefined constants"""
    
    def test_skills_db_not_empty(self):
        """Test that SKILLS_DB is populated"""
        assert len(SKILLS_DB) > 0
        assert "python" in SKILLS_DB
        assert "java" in SKILLS_DB
    
    def test_degrees_db_not_empty(self):
        """Test that DEGREES_DB is populated"""
        assert len(DEGREES_DB) > 0
        assert "bachelor" in DEGREES_DB
        assert "master" in DEGREES_DB
    
    def test_company_db_not_empty(self):
        """Test that COMPANY_DB is populated"""
        assert len(COMPANY_DB) > 0
        assert "ltd" in COMPANY_DB
        assert "inc" in COMPANY_DB


# Fixtures for test data
@pytest.fixture
def sample_resume_text():
    """Sample resume text for testing"""
    return """
    John Doe
    Software Engineer
    Email: john.doe@example.com
    Phone: +65 9123 4567
    
    Skills: Python, Java, SQL, Machine Learning
    
    Education:
    Bachelor of Science in Computer Science
    
    Experience:
    Senior Software Engineer at Tech Corp Inc
    Jan 2020 - Present
    
    Software Developer at Solutions Ltd
    Jun 2018 - Dec 2019
    """


@pytest.fixture
def temp_pdf_file():
    """Create a temporary PDF file for testing"""
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
        yield f.name
    os.unlink(f.name)


# Integration tests
class TestIntegration:
    """Integration tests combining multiple functions"""
    
    def test_full_parsing_workflow(self, sample_resume_text):
        """Test the complete parsing workflow"""
        with patch('parser.extract_text_from_pdf', return_value=sample_resume_text):
            result = parse_resume("test.pdf")
            
            # Verify that all components work together
            assert result["email"] == "john.doe@example.com"
            assert result["phone"] == "+65 9123 4567"
            assert len(result["skills"]) > 0
            assert "python" in result["skills"]
            assert len(result["degree"]) > 0
            assert result["total_experience_years"] > 0


if __name__ == "__main__":
    pytest.main([__file__])