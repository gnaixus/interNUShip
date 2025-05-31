import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException
import serpapi

def get_indeed_internships(api_key):
    try:
        client = serpapi.Client(api_key=api_key)
        results = client.search({
            "engine": "indeed",
            "q": "internship",
            "location": "Singapore",
        })
        return results.get("jobs", [])
    except Exception as e:
        print(f"Indeed Error: {e}")
        return []

def scrape_nus_internships():
    try:
        url = "https://nus.edu.sg/careers/internships"
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")
        
        internships = []
        for job in soup.select(".job-listing"):  # Adjust selector based on NUS site
            title = job.find("h3").text.strip()
            company = "NUS"  # Default, adjust as needed
            internships.append({"title": title, "company": company})
        return internships
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NUS Scraping failed: {str(e)}")

def scrape_fastjobs():
    # Similar logic for FastJobs
    pass

def scrape_indeed():
    # Use SerpAPI or scraping with proxies
    pass