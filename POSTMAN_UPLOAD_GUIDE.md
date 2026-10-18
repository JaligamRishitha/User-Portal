# How to Upload User Agreement via Postman

## Step-by-Step Guide

### Step 1: Open Postman
1. Launch Postman application
2. Create a new request or import the collection file `User_Agreement_API.postman_collection.json`

### Step 2: Configure the Request
1. **Method**: Select `POST`
2. **URL**: `http://localhost:8000/api/user-agreement/upload/5000000061`
   - Replace `5000000061` with your actual vendor ID (you can see it in the screenshot as "GRANTOR NUMBER")

### Step 3: Set Up the Body
1. Click on the **Body** tab
2. Select **form-data** (NOT raw or binary)
3. In the KEY column:
   - Type: `file`
   - Change the dropdown from "Text" to **"File"**
4. In the VALUE column:
   - Click **"Select Files"** button
   - Browse and select your PDF/DOC/DOCX file (e.g., user_agreement.pdf)

### Step 4: Send the Request
1. Click the blue **Send** button
2. Wait for the response

### Step 5: Expected Response
```json
{
    "success": true,
    "message": "User agreement uploaded successfully",
    "file_url": "/documents/user_agreements/user_agreement_5000000061_20251212_150530.pdf",
    "vendor_id": "5000000061"
}
```

### Step 6: Verify on Frontend
1. Refresh the User Details page in your browser
2. You should now see the **"User Agreement"** button on the left side
3. Click it to open the document in a new tab

---

## Alternative: Using cURL Command

If you prefer command line, use this:

```bash
curl -X POST "http://localhost:8000/api/user-agreement/upload/5000000061" \
  -F "file=@C:/path/to/your/agreement.pdf"
```

Replace:
- `5000000061` with your vendor ID
- `C:/path/to/your/agreement.pdf` with the actual path to your file

---

## Troubleshooting

### Issue: "Vendor not found"
- Make sure the vendor ID exists in the database
- Check that you're using the correct vendor ID from the User Details page

### Issue: "Invalid file type"
- Only PDF, DOC, and DOCX files are allowed
- Check your file extension

### Issue: Button still not showing
1. Check the browser console for errors (F12)
2. Verify the upload was successful (check response)
3. Hard refresh the page (Ctrl + Shift + R)
4. Check if the backend is running on port 8000

---

## Quick Test for Vendor 5000000061

1. **POST** `http://localhost:8000/api/user-agreement/upload/5000000061`
   - Body: form-data
   - Key: `file` (type: File)
   - Value: Select your PDF file

2. **GET** `http://localhost:8000/api/user-agreement/5000000061`
   - This will show if the agreement was uploaded successfully

3. Refresh the User Details page - the button should appear!

---

## Visual Guide for Postman

```
┌─────────────────────────────────────────────────────────┐
│ POST  http://localhost:8000/api/user-agreement/upload/5000000061  │
├─────────────────────────────────────────────────────────┤
│ Params | Authorization | Headers | Body | Pre-request  │
│                                    ▼                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ○ none  ○ form-data  ○ x-www-form-urlencoded       │ │
│ │ ○ raw   ○ binary     ○ GraphQL                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ KEY          │ VALUE                    │ DESCRIPTION   │
│ ─────────────┼──────────────────────────┼──────────────│
│ file [File]  │ [Select Files]           │               │
│              │ agreement.pdf            │               │
│                                                          │
│                                    [Send]                │
└─────────────────────────────────────────────────────────┘
```

Make sure to select **File** type from the dropdown next to the key name!
