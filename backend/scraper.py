import requests
from bs4 import BeautifulSoup

def scrape_nus_internships():
    url = "https://nus.edu.sg/careers/internships"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    
    internships = []
    # Adjust selectors based on the actual website structure
    for listing in soup.select(".internship-listing"):
        title = listing.find("h3").text
        company = listing.find("p").text
        internships.append({"title": title, "company": company})
    
    return internships