#!/usr/bin/env python3
"""
Test script to verify OCR.space API connectivity
"""
import requests
import base64

# Your API key
API_KEY = "ocr_k-DvHxnw9FNzuyoqX5gBf453NZXL5E1LllrFevcHsXs"

# Test with a simple text image (base64 encoded)
# This is a small test image with "Hello World" text
test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

payload = {
    'base64Image': f'data:image/png;base64,{test_image_base64}',
    'apikey': API_KEY,
    'language': 'eng',
    'isOverlayRequired': False,
    'detectOrientation': True,
    'scale': True,
    'OCREngine': 2
}

print("Testing OCR.space API...")
print(f"API Key: {API_KEY[:15]}...")

try:
    response = requests.post('https://api.ocr.space/parse/image', data=payload, timeout=30)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        result = response.json()
        if not result.get('IsErroredOnProcessing', True):
            print("\n✅ OCR API is working!")
        else:
            print(f"\n❌ OCR Error: {result.get('ErrorMessage', 'Unknown error')}")
    else:
        print(f"\n❌ HTTP Error: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
