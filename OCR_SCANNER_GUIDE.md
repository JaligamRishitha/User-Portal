# OCR Scanner - User Guide

## Overview
The OCR (Optical Character Recognition) Scanner allows you to upload documents and extract text automatically using AI-powered OCR technology. The system automatically extracts key metadata including **Grantor Name**, **Address**, and **Telephone Number**.

## Features

### 1. File Upload
- **Drag & Drop:** Drag files directly onto the upload area
- **Click to Upload:** Click the upload area to browse and select files
- **Supported Formats:**
  - Images: JPG, JPEG, PNG, GIF, BMP
  - Documents: PDF
- **File Size Limit:** 3MB maximum
- **Auto-Compression:** Images larger than 2MB are automatically compressed

### 2. Image Preview
- Automatic preview for uploaded images
- Preview displayed before processing
- Clear view of the document being processed

### 3. Text Extraction & Metadata
- Click "Extract Text" button to process the document
- Real-time processing with loading indicator
- **Automatically extracts:**
  - Full text content
  - Grantor Name
  - Address (with postcode)
  - Telephone Number
- Editable metadata fields for manual corrections

### 4. Results Management
- **Copy to Clipboard:** One-click copy of extracted text
- **Download as Text:** Save extracted text as .txt file
- **Edit Metadata:** Correct or update extracted information
- **Statistics:** View character and word count
- **Clear Results:** Reset and start over

## How to Use

### Step 1: Access OCR Scanner
1. Log in to Admin Portal
2. Click "OCR Upload" tab in the navigation

### Step 2: Upload Document
**Option A - Drag & Drop:**
1. Drag your file onto the upload area
2. File will be automatically selected
3. Large images will be compressed automatically

**Option B - Click to Browse:**
1. Click the upload area
2. Select file from your computer
3. Click "Open"

### Step 3: Review Preview
- Image preview will appear (for image files)
- Verify the document is correct
- Check file name and size
- Compression notification if file was compressed

### Step 4: Extract Text
1. Click "Extract Text" button
2. Wait for processing (usually 5-30 seconds)
3. View extracted text and metadata in the results panel

### Step 5: Review Metadata
**Extracted Information Panel:**
- **Grantor Name:** Automatically detected from document
- **Address:** Full address with postcode
- **Telephone:** Contact phone number

**Edit if Needed:**
- Click in any field to edit
- Correct OCR errors
- Add missing information

### Step 6: Use Results
**Copy Text:**
- Click the copy icon
- Text is copied to clipboard
- Paste anywhere you need

**Download Text:**
- Click the download icon
- Text file is saved to your downloads
- File named: `ocr-result-[timestamp].txt`

**Clear and Start Over:**
- Click "Clear" button
- Upload a new document

## Technical Details

### API Integration
- **Base URL:** `http://149.102.158.71:2101/api`
- **API Key:** `ocr_k-DvHxnw9FNzuyoqX5gBf453NZXL5E1LllrFevcHsXs`
- **Primary Endpoint:** `/upload/` (document upload)
- **Status Endpoint:** `/task-status/{task_id}` (check processing)
- **Content Endpoint:** `/documents/{doc_id}/content` (get results)

### Processing Flow
```
1. Upload file → /upload/
2. Receive task_id
3. Poll /task-status/{task_id}
4. When complete, get /documents/{doc_id}/content
5. Extract text and metadata
6. Display results
```

### Metadata Extraction
The system uses intelligent pattern matching to detect:

**Grantor Name:**
- Looks for: "Name:", "Grantor:", "Customer:"
- Extracts text following these labels

**Address:**
- Detects UK postcode patterns (e.g., SW1A 1AA)
- Looks for "Address:" label
- Collects multiple lines for complete address

**Telephone:**
- Detects phone patterns: 10-11 digits, formatted numbers
- Looks for: "Tel:", "Phone:", "Telephone:"
- Extracts and formats phone numbers

## Features Breakdown

### Upload Section (Left Panel)
1. **Upload Area**
   - Drag & drop zone
   - Click to browse
   - Visual feedback on hover

2. **File Info Card**
   - File name display
   - File size in KB
   - Remove button

3. **Image Preview**
   - Automatic for images
   - Max height: 256px
   - Maintains aspect ratio

4. **Action Buttons**
   - Extract Text (primary action)
   - Clear (secondary action)
   - Loading state during processing

5. **Info Card**
   - Supported formats
   - File size limits
   - Auto-compression notice

### Results Section (Right Panel)
1. **Extracted Information Panel**
   - Grantor Name field (editable)
   - Address field (editable)
   - Telephone field (editable)
   - Orange-themed for visibility

2. **Full Text Display**
   - Complete extracted text
   - Monospace font for readability
   - Scrollable for long text
   - Preserves formatting

3. **Header with Actions**
   - Copy to clipboard button
   - Download as text button
   - Only visible when text is extracted

4. **Statistics Cards**
   - Character count
   - Word count
   - Color-coded (green/blue)

5. **Empty State**
   - Helpful message
   - Icon indicator
   - Instructions

## Error Handling

### Invalid File Type
- **Error:** "Invalid File Type"
- **Solution:** Upload JPG, PNG, GIF, BMP, or PDF only

### File Too Large
- **Error:** "File Too Large"
- **Solution:** Use file under 3MB (compression happens automatically for 2-3MB)

### Compression Failed
- **Warning:** "Compression Failed - Using original file"
- **Note:** File may be too large for server

### OCR Processing Failed
- **Error:** "OCR Failed"
- **Possible Causes:**
  - Poor image quality
  - Network issues
  - API unavailable
- **Solution:** Try a clearer image or check connection

### Processing Timeout
- **Error:** "OCR processing timed out"
- **Solution:** Try again with smaller document

### Network Error
- **Error:** "Failed to extract text"
- **Solution:** Check internet connection and try again

## Best Practices

### For Best Results:
1. **Image Quality**
   - Use high-resolution images (300 DPI recommended)
   - Ensure good lighting
   - Avoid blurry photos

2. **Document Orientation**
   - Keep text horizontal
   - Avoid rotated images
   - Straighten skewed documents

3. **Text Clarity**
   - Clear, readable fonts
   - Good contrast (dark text on light background)
   - Printed text works best

4. **File Format**
   - PDF for multi-page documents
   - PNG for screenshots
   - JPG for photos

5. **Metadata Accuracy**
   - Ensure Grantor Name, Address, and Phone are clearly visible
   - Review extracted metadata for accuracy
   - Correct any OCR errors in editable fields

### Tips:
- ✅ Use clear, high-contrast images
- ✅ Ensure text is not too small
- ✅ Keep key information (name, address, phone) prominent
- ✅ Crop to text area if possible
- ✅ Always review and correct extracted metadata
- ❌ Avoid low-resolution images
- ❌ Don't use heavily compressed files
- ❌ Avoid images with complex backgrounds
- ❌ Don't skip metadata verification

## Image Compression

### Automatic Compression:
- Triggered for images > 2MB
- Maximum width: 1920px
- Quality: 90% to 10% (adaptive)
- Target size: < 2MB
- Format: JPEG

### Compression Process:
1. Shows "Compressing Image..." dialog
2. Reduces dimensions if needed
3. Adjusts quality to meet size limit
4. Shows before/after sizes
5. Uses compressed version for upload

## Browser Compatibility

### Fully Supported:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features:
- ✅ Drag & drop upload
- ✅ File preview
- ✅ Image compression
- ✅ Clipboard operations
- ✅ File download
- ✅ Metadata extraction

## Privacy & Security

### Data Handling:
- Files are processed via external OCR API
- No files are stored permanently on our servers
- Text extraction happens in real-time
- Results are only stored in browser session
- Metadata is editable and not automatically saved

### API Security:
- API key is embedded in requests
- Secure connection to OCR service
- No personal data is logged

## Troubleshooting

### Issue: Upload button not working
**Solution:** Check file size (must be under 3MB) and format

### Issue: No preview showing
**Solution:** Only images show preview, PDFs don't

### Issue: Extraction taking too long
**Solution:** Large files may take 30+ seconds, wait or try smaller file

### Issue: Metadata not detected
**Solution:** 
- Document may have non-standard format
- Manually enter information in editable fields
- Ensure key information is clearly visible in document

### Issue: Extracted text is incorrect
**Solution:** 
- Try a clearer image
- Ensure text is horizontal
- Check image quality
- Use higher resolution scan

### Issue: Copy button not working
**Solution:** 
- Check browser permissions
- Try manual selection and copy

### Issue: Compression notification appears
**Solution:** This is normal for large files, compression improves upload success

## Support

For technical issues or questions:
- Contact: Admin Support
- Email: support@ukpowernetworks.co.uk
- Phone: [Support Number]

## Updates & Changelog

### Version 2.0 (Current)
- Updated to use OCR AI Assistant API
- Automatic metadata extraction (Grantor Name, Address, Telephone)
- Editable metadata fields
- Improved error handling
- Async processing with task polling
- Enhanced UI with metadata panel

### Version 1.0
- Initial release
- File upload with drag & drop
- Image preview
- Text extraction via OCR API
- Copy and download functionality
- Statistics display
- Error handling

### Planned Features:
- [ ] Save extracted metadata to database
- [ ] Link to vendor records
- [ ] Batch processing (multiple files)
- [ ] Export metadata to CSV/Excel
- [ ] OCR confidence score display
- [ ] Text formatting options
- [ ] History of processed documents
- [ ] Advanced image preprocessing
- [ ] Multi-language support
