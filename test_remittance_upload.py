import requests
import os

# Configuration
BASE_URL = "http://localhost:8000/api"
VENDOR_ID = "5000000015"
FISCAL_YEAR = "2024"
PDF_FILE = "Remittance_sample2.pdf"

def test_upload():
    """Test uploading a remittance document"""
    print(f"Testing upload for vendor {VENDOR_ID}, year {FISCAL_YEAR}...")
    
    if not os.path.exists(PDF_FILE):
        print(f"Error: {PDF_FILE} not found!")
        return
    
    url = f"{BASE_URL}/remittance-documents/upload"
    params = {
        "vendor_id": VENDOR_ID,
        "fiscal_year": FISCAL_YEAR
    }
    
    with open(PDF_FILE, 'rb') as f:
        files = {'file': (PDF_FILE, f, 'application/pdf')}
        response = requests.post(url, params=params, files=files)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_get_years():
    """Test getting available years"""
    print(f"Testing get available years for vendor {VENDOR_ID}...")
    
    url = f"{BASE_URL}/remittance-years/{VENDOR_ID}"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_download():
    """Test downloading a remittance document"""
    print(f"Testing download for vendor {VENDOR_ID}, year {FISCAL_YEAR}...")
    
    url = f"{BASE_URL}/remittance-documents/download/{VENDOR_ID}/{FISCAL_YEAR}"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        output_file = f"downloaded_remittance_{FISCAL_YEAR}.pdf"
        with open(output_file, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded to: {output_file}")
        print(f"File size: {len(response.content)} bytes")
    else:
        print(f"Error: {response.text}")
    print()

def test_list_documents():
    """Test listing all documents for a vendor"""
    print(f"Testing list documents for vendor {VENDOR_ID}...")
    
    url = f"{BASE_URL}/remittance-documents/{VENDOR_ID}"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("Remittance Document API Tests")
    print("=" * 60)
    print()
    
    # Run tests
    test_upload()
    test_get_years()
    test_list_documents()
    test_download()
    
    print("=" * 60)
    print("Tests completed!")
    print("=" * 60)
