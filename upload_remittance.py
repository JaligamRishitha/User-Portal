#!/usr/bin/env python3
"""
Simple utility to upload remittance PDF documents to the database.

Usage:
    python upload_remittance.py <vendor_id> <fiscal_year> <pdf_file>

Example:
    python upload_remittance.py 5000000015 2024 Remittance_sample2.pdf
"""

import sys
import requests
import os

def upload_remittance(vendor_id, fiscal_year, pdf_file):
    """Upload a remittance PDF document"""
    
    # Check if file exists
    if not os.path.exists(pdf_file):
        print(f"❌ Error: File '{pdf_file}' not found!")
        return False
    
    # Check if file is PDF
    if not pdf_file.lower().endswith('.pdf'):
        print(f"❌ Error: File must be a PDF!")
        return False
    
    print(f"📤 Uploading remittance document...")
    print(f"   Vendor ID: {vendor_id}")
    print(f"   Fiscal Year: {fiscal_year}")
    print(f"   File: {pdf_file}")
    print()
    
    # Prepare the request
    url = "http://localhost:8000/api/remittance-documents/upload"
    params = {
        "vendor_id": vendor_id,
        "fiscal_year": fiscal_year
    }
    
    try:
        with open(pdf_file, 'rb') as f:
            files = {'file': (os.path.basename(pdf_file), f, 'application/pdf')}
            response = requests.post(url, params=params, files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"   Message: {data['message']}")
            print(f"   File Name: {data['data']['file_name']}")
            print(f"   File Size: {data['data']['file_size']:,} bytes")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the backend server.")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    if len(sys.argv) != 4:
        print("Usage: python upload_remittance.py <vendor_id> <fiscal_year> <pdf_file>")
        print()
        print("Example:")
        print("  python upload_remittance.py 5000000015 2024 Remittance_sample2.pdf")
        sys.exit(1)
    
    vendor_id = sys.argv[1]
    fiscal_year = sys.argv[2]
    pdf_file = sys.argv[3]
    
    success = upload_remittance(vendor_id, fiscal_year, pdf_file)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
