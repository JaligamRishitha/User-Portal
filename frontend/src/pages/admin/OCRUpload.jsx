import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const OCRUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [ocrResult, setOcrResult] = useState(null);
    const [metadata, setMetadata] = useState({
        grantorName: '',
            grantorNumber: '',
        grantorAddress: '',
        grantorPostcode: '',
        grantorTelephone: '',
        grantorEmail: '',
        agreementDate: '',
        agreementRef: '',
        companyWith: '',
        tqNumber: '',
        payment: '',
        duration: '',
        propertyLocation: '',
        worksDescription: '',
        drawingNumber: ''
    });
    const [savedDocuments, setSavedDocuments] = useState([]);
    const [viewingDocument, setViewingDocument] = useState(null);

    const OCR_API_KEY = import.meta.env.VITE_OCR_API_KEY || '';
    const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || 'http://149.102.158.71:2101/api';
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8003/api';

    // Load saved documents on mount
    useEffect(() => {
        loadSavedDocuments();
    }, []);

    const loadSavedDocuments = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/wayleave-agreements`);
            if (response.ok) {
                const data = await response.json();
                setSavedDocuments(data);
            }
        } catch (error) {
            console.error('Error loading saved documents:', error);
        }
    };

    const compressImage = (file, maxSizeMB = 2) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions (max 1920px width)
                    const maxWidth = 1920;
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Try different quality levels to get under size limit
                    let quality = 0.9;
                    const tryCompress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.1) {
                                    const compressedFile = new File([blob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now(),
                                    });
                                    resolve(compressedFile);
                                } else {
                                    quality -= 0.1;
                                    tryCompress();
                                }
                            },
                            'image/jpeg',
                            quality
                        );
                    };
                    tryCompress();
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    title: 'Invalid File Type',
                    text: 'Please upload an image (JPG, PNG, GIF, BMP) or PDF file',
                    icon: 'error',
                    confirmButtonColor: '#ea580c',
                });
                return;
            }

            let processedFile = file;

            // Compress images if they're too large
            if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
                try {
                    Swal.fire({
                        title: 'Compressing Image...',
                        text: 'Please wait while we optimize your image',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    processedFile = await compressImage(file, 2);

                    Swal.close();

                    Swal.fire({
                        title: 'Image Compressed',
                        text: `Original: ${(file.size / 1024).toFixed(0)}KB → Compressed: ${(processedFile.size / 1024).toFixed(0)}KB`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (error) {
                    console.error('Compression error:', error);
                    Swal.fire({
                        title: 'Compression Failed',
                        text: 'Using original file. It may be too large for the server.',
                        icon: 'warning',
                        confirmButtonColor: '#ea580c',
                    });
                }
            }

            // Validate final file size (max 3MB for server)
            if (processedFile.size > 3 * 1024 * 1024) {
                Swal.fire({
                    title: 'File Too Large',
                    text: 'Please upload a file smaller than 3MB. Try a lower resolution image.',
                    icon: 'error',
                    confirmButtonColor: '#ea580c',
                });
                return;
            }

            setSelectedFile(processedFile);

            // Create preview for images
            if (processedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(processedFile);
            } else {
                setPreviewUrl(null);
            }

            // Reset previous results
            setExtractedText('');
            setOcrResult(null);
            setMetadata({
                grantorName: '',
            grantorNumber: '',
                grantorAddress: '',
                grantorPostcode: '',
                grantorTelephone: '',
                grantorEmail: '',
                agreementDate: '',
                agreementRef: '',
                tqNumber: '',
                payment: '',
                duration: '',
                propertyLocation: '',
                worksDescription: '',
                drawingNumber: ''
            });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const extractWayleaveData = (text) => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const fullText = text.toLowerCase();

        const data = {
            // Grantor Details
            grantorName: '',
            grantorNumber: '',
            grantorAddress: '',
            grantorPostcode: '',
            grantorTelephone: '',
            grantorEmail: '',

            // Agreement Details
            agreementDate: '',
            agreementRef: '',
            companyWith: '',
            tqNumber: '',
            payment: '',
            duration: '',

            // Wayleave Information
            propertyLocation: '',
            worksDescription: '',
            drawingNumber: ''
        };

        const postcodePattern = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;
        const tidy = (value) => value
            .replace(/\s+/g, ' ')
            .replace(/["“”()]/g, '')
            .replace(/\s*,\s*(,\s*)+/g, ', ')
            .replace(/^[,:;\s]+|[,:;\s]+$/g, '');

        // Extract Grantor Name - the party marked ("the Grantor"), written as e.g.
        //   BETWEEN: D L Bolton ("the Grantor") of Borheam Hall, ..., CM3 3DQ of the one part
        //   BETWEEN JOHN SMITH (hereinafter called "the Grantor") of ...
        const grantorMarker = text.match(/\(\s*(?:hereinafter\s+(?:called|referred\s+to\s+as)\s+)?["“”']*\s*the\s+Grantors?\s*["“”']*\s*\)/i);
        if (grantorMarker) {
            const beforeMarker = text.slice(0, grantorMarker.index);
            const between = beforeMarker.match(/\bBETWEEN\b\s*:?\s*([\s\S]*)$/i);
            let name = tidy(between ? between[1] : beforeMarker.split('\n').pop());
            // A runaway match means BETWEEN was far away - keep the marker's own line
            if (name.length > 120) name = tidy(beforeMarker.split('\n').pop());
            data.grantorName = name;

            // Address follows the marker, up to "of the one part" / the other party
            const afterMarker = text.slice(grantorMarker.index + grantorMarker[0].length);
            const addressSection = afterMarker.split(/\bof\s+the\s+one\s+part\b|\bAND\b|\n\s*\n/)[0];
            const postcodeMatch = addressSection.match(postcodePattern);
            const addressText = postcodeMatch
                ? addressSection.slice(0, postcodeMatch.index)
                : addressSection;
            if (postcodeMatch) {
                data.grantorPostcode = `${postcodeMatch[1]} ${postcodeMatch[2]}`.toUpperCase();
            }
            const address = tidy(addressText.replace(/^\s*of\s+/i, '').replace(/\n/g, ', '));
            if (address.length <= 200) data.grantorAddress = address;
        }

        // Fallback: a labelled name, e.g. "Grantor Name: D L Bolton" or "Grantor: D L Bolton"
        if (!data.grantorName) {
            const labelledName = text.match(/^\s*(?:grantor(?:'s)?\s*name|name\s+of\s+grantor|grantor)\s*[:-]\s*(.+)$/im);
            if (labelledName) data.grantorName = tidy(labelledName[1]);
        }

        // Extract contact details
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            // Extract Telephone
            if (!data.grantorTelephone && /\b(?:tel|telephone|phone|mobile)\b/.test(lowerLine)) {
                const phoneMatch = line.match(/\b(?:tel|telephone|phone|mobile)\b\.?[:\s]*(\+?[0-9][0-9\s\-()]{8,})/i) ||
                    line.match(/\b(0\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/);
                if (phoneMatch) {
                    data.grantorTelephone = (phoneMatch[1] || phoneMatch[0]).trim();
                }
            }

            // Extract Email
            if (!data.grantorEmail && lowerLine.includes('mail')) {
                const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
                if (emailMatch) data.grantorEmail = emailMatch[0];
            }
        }

        // Extract Company Information (the "with" party)
        // Look for text between "and" and "the Company" or "the other part"
        const companyMatch = text.match(/\bAND\s+(.*?)\s*\(.*?(?:the Company|the Grantee).*?\)\s*of\s+the\s+other\s+part/is);
        if (companyMatch) {
            // Clean up the company info - remove extra whitespace and newlines
            data.companyWith = companyMatch[1]
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/["()]/g, '')
                .replace(/\bpie\b/gi, 'plc') // Fix common OCR error: "pie" -> "plc"
                .trim();
        }

        // Extract Agreement Date - look for "made the" or "dated"
        const dateMatch = text.match(/made\s+the\s+(\d{1,2}(?:st|nd|rd|th)?\s+day\s+of\s+\w+\s+\d{4})/i) ||
            text.match(/dated\s+(?:the\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+\d{4})/i) ||
            text.match(/(\d{1,2}\s+day\s+of\s+\w+\s+\d{4})/i);
        if (dateMatch) {
            data.agreementDate = dateMatch[1].trim();
        }

        // Extract Agreement Number - the form number at the top ("No...20024547"),
        // otherwise a labelled reference
        const agreementNoMatch = text.match(/^\s*No\.*\s*:?\s*(\d{5,})/im);
        const refMatch = text.match(/\b(?:ref(?:erence)?|agreement\s+no|doc(?:ument)?\s+no)\b\.?[:\s#]*([A-Z0-9\-/]+)/i);
        if (agreementNoMatch) {
            data.agreementRef = agreementNoMatch[1];
        } else if (refMatch) {
            data.agreementRef = refMatch[1];
        }

        // Extract TQ / TL Number - only references with the TQ or TL prefix
        // (TQ4565 1234, TL 4366 4653, TQ45651234, TQ64731), wherever they appear
        // in the text. Any other prefix is ignored.
        const tqNumbers = [...text.matchAll(/\bT\.?\s?([QL])(?![A-Z])\.?\s*[:#-]?\s*(\d{2,10})(?: (\d{2,5}))?(?!\d)/gi)]
            .map(([, letter, first, second]) => {
                const prefix = `T${letter.toUpperCase()}`;
                if (second) return `${prefix}${first} ${second}`;
                // An unspaced easting+northing, e.g. TQ45651234 -> TQ4565 1234
                if (first.length >= 8 && first.length % 2 === 0) {
                    return `${prefix}${first.slice(0, first.length / 2)} ${first.slice(first.length / 2)}`;
                }
                return `${prefix}${first}`;
            });
        // Prefer a full easting/northing pair over a single block such as TQ64731
        data.tqNumber = tqNumbers.find((tq) => tq.includes(' ')) || tqNumbers[0] || '';

        // Extract Grantor Number - labelled, or a 10-digit grantor/vendor ID (5000000061)
        const grantorNumberMatch = text.match(/\bgrantor\s*(?:no\b\.?|number\b|ref(?:erence)?\b|id\b)\s*[:#]?\s*([A-Z0-9][A-Z0-9/-]*\d[A-Z0-9/-]*)/i) ||
            text.match(/\b(5\d{9})\b/);
        if (grantorNumberMatch) {
            data.grantorNumber = grantorNumberMatch[1];
        }

        // Extract Payment amount
        const paymentMatch = text.match(/payment\s+of\s+(£[\d,]+(?:\.\d{2})?)/i) ||
            text.match(/sum\s+of\s+(£[\d,]+(?:\.\d{2})?)/i) ||
            text.match(/(£[\d,]+(?:\.\d{2})?)\s+(?:per|each)/i);
        if (paymentMatch) {
            data.payment = paymentMatch[1];
        }

        // Extract Duration/Period
        const durationMatch = text.match(/(?:period|term)\s+of\s+(\d+\s+years?)/i) ||
            text.match(/for\s+a\s+(?:period|term)\s+of\s+(\d+\s+years?)/i);
        if (durationMatch) {
            data.duration = durationMatch[1];
        }

        // Extract Property Location
        const locationMatch = text.match(/(?:situated|located)\s+at\s+(.*?)(?:\.|,|\n|$)/is);
        if (locationMatch) {
            data.propertyLocation = locationMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        }

        // The plan's "Site:" line gives the full site address
        const siteMatch = text.match(/^\s*Site\s*:\s*(.+)$/im);
        if (siteMatch) {
            const site = tidy(siteMatch[1]);
            data.propertyLocation = data.propertyLocation && !site.includes(data.propertyLocation)
                ? `${data.propertyLocation} (Site: ${site})`
                : site;
        }

        // Extract Works Description - the whole clause up to "together with" / "across" / the sentence end
        const worksEnd = '(?=\\s+together\\s+with\\b|\\s+across\\b|[.\\n]|$)';
        const worksMatch = text.match(new RegExp(`(overhead\\s+electric\\s+line[^.\\n]*?)${worksEnd}`, 'i')) ||
            text.match(new RegExp(`(underground\\s+cable[^.\\n]*?)${worksEnd}`, 'i')) ||
            text.match(new RegExp(`works?\\s+(?:comprising|consisting)\\s+of\\s+([^.\\n]*?)${worksEnd}`, 'i'));
        if (worksMatch) {
            data.worksDescription = worksMatch[1].trim().replace(/\s+/g, ' ');
        }

        // Extract Drawing Number
        const drawingMatch = text.match(/\bdrawing\s+(?:no\b\.?|number\b|ref\b\.?)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-/]*)/i);
        if (drawingMatch) {
            data.drawingNumber = drawingMatch[1];
        }

        return data;
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Swal.fire({
                title: 'No File Selected',
                text: 'Please select a file to upload',
                icon: 'warning',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${OCR_API_URL}/upload/?api_key=${OCR_API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            if (response.status === 413) {
                throw new Error('File is too large for the server. Please use a smaller file (under 2MB).');
            }

            const data = await response.json();
            console.log('Upload response:', data);

            if (response.ok) {
                // Check if response has result with extracted_text (direct response)
                if (data.result && data.result.extracted_text) {
                    applyExtractedText(data.result.extracted_text, data.result);
                }
                // Check for task_id (async processing)
                else if (data.task_id) {
                    await pollTaskStatus(data.task_id);
                }
                // Check for document_id
                else if (data.document_id) {
                    await getDocumentContent(data.document_id);
                } else {
                    throw new Error('Unexpected response format from OCR API');
                }
            } else {
                throw new Error(data.detail || data.error || 'OCR processing failed');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            Swal.fire({
                title: 'OCR Failed',
                text: error.message || 'Failed to extract text from the document',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
            setLoading(false);
        }
    };

    // Shared handler: apply extracted OCR text to state, parse wayleave data, notify.
    const applyExtractedText = (text, result) => {
        setExtractedText(text);
        setOcrResult(result || { extracted_text: text });

        const extractedData = extractWayleaveData(text);
        setMetadata(extractedData);

        Swal.fire({
            title: 'Success!',
            text: 'Text extracted successfully',
            icon: 'success',
            confirmButtonColor: '#ea580c',
        });
        setLoading(false);
    };

    const pollTaskStatus = async (taskId) => {
        const maxWaitMs = 120000; // give up after ~2 minutes
        const startTime = Date.now();
        let delay = 800; // start fast, then back off to avoid hammering the server

        const checkStatus = async () => {
            try {
                const elapsed = Date.now() - startTime;
                console.log(`Polling task ${taskId} (elapsed ${(elapsed / 1000).toFixed(1)}s, next check in ${delay}ms)`);
                const response = await fetch(`${OCR_API_URL}/task-status/${taskId}?api_key=${OCR_API_KEY}`);
                const data = await response.json();
                console.log('Task status response:', data);

                if (data.status === 'completed') {
                    console.log('Task completed, document_id:', data.document_id);
                    // Prefer inline text if present — saves an extra round-trip to /documents/{id}/content
                    if (data.result && data.result.extracted_text) {
                        applyExtractedText(data.result.extracted_text, data.result);
                    } else if (data.document_id) {
                        await getDocumentContent(data.document_id);
                    } else {
                        throw new Error('OCR completed but returned no text');
                    }
                } else if (data.status === 'failed' || data.status === 'error') {
                    throw new Error(data.error || data.message || 'OCR processing failed');
                } else if (elapsed < maxWaitMs) {
                    setTimeout(checkStatus, delay);
                    delay = Math.min(Math.round(delay * 1.3), 3000); // ramp 800ms -> 3s cap
                } else {
                    console.error('Polling timed out after', (elapsed / 1000).toFixed(0), 'seconds');
                    throw new Error('OCR processing timed out. The document may be too large or complex.');
                }
            } catch (error) {
                console.error('Polling error:', error);
                setLoading(false);
                throw error;
            }
        };

        await checkStatus();
    };

    const getDocumentContent = async (documentId) => {
        try {
            console.log('Fetching document content for:', documentId);
            const response = await fetch(`${OCR_API_URL}/documents/${documentId}/content?api_key=${OCR_API_KEY}`);
            const data = await response.json();
            console.log('Document content response:', data);

            let extractedTextContent = null;

            // Try multiple possible response formats
            if (data.result && data.result.extracted_text) {
                extractedTextContent = data.result.extracted_text;
            } else if (data.extracted_text) {
                extractedTextContent = data.extracted_text;
            } else if (data.text) {
                extractedTextContent = data.text;
            }

            if (response.ok && extractedTextContent) {
                console.log('Setting extracted text, length:', extractedTextContent.length);
                applyExtractedText(extractedTextContent, data.result || data);
            } else {
                console.error('No text found in response:', data);
                throw new Error('Failed to retrieve document content - no text found');
            }
        } catch (error) {
            console.error('Error getting document content:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setExtractedText('');
        setOcrResult(null);
        setMetadata({
            grantorName: '',
            grantorNumber: '',
            grantorAddress: '',
            grantorTelephone: '',
            grantorEmail: '',
            agreementDate: '',
            agreementRef: '',
            payment: '',
            duration: '',
            propertyLocation: '',
            worksDescription: '',
            drawingNumber: ''
        });
    };

    const handleSave = async () => {
        if (!extractedText) {
            Swal.fire({
                title: 'No Data to Save',
                text: 'Please extract text from a document first',
                icon: 'warning',
                confirmButtonColor: '#ea580c',
            });
            return;
        }

        try {
            const wayleaveData = {
                filename: selectedFile?.name || 'Unknown',
                grantor_name: metadata.grantorName,
                grantor_address: metadata.grantorAddress,
                grantor_postcode: metadata.grantorPostcode,
                grantor_telephone: metadata.grantorTelephone,
                grantor_email: metadata.grantorEmail,
                agreement_date: metadata.agreementDate,
                agreement_ref: metadata.agreementRef,
                company_with: metadata.companyWith,
                tq_number: metadata.tqNumber,
                payment: metadata.payment,
                duration: metadata.duration,
                property_location: metadata.propertyLocation,
                works_description: metadata.worksDescription,
                drawing_number: metadata.drawingNumber,
                extracted_text: extractedText
            };

            const response = await fetch(`${API_BASE_URL}/admin/wayleave-agreements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wayleaveData),
            });

            if (!response.ok) {
                throw new Error('Failed to save wayleave agreement');
            }

            const savedDoc = await response.json();

            // Add to local state
            setSavedDocuments([savedDoc, ...savedDocuments]);

            Swal.fire({
                title: 'Saved!',
                text: 'Wayleave agreement saved to database',
                icon: 'success',
                confirmButtonColor: '#ea580c',
                timer: 1500,
                showConfirmButton: false,
            });

            // Clear current extraction
            handleClear();
        } catch (error) {
            console.error('Save error:', error);
            Swal.fire({
                title: 'Save Failed',
                text: error.message || 'Failed to save wayleave agreement',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        }
    };

    const handleView = (doc) => {
        setViewingDocument(doc);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Document?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/wayleave-agreements/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete wayleave agreement');
                }

                setSavedDocuments(savedDocuments.filter(doc => doc.id !== id));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Document has been deleted',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire({
                    title: 'Delete Failed',
                    text: error.message || 'Failed to delete wayleave agreement',
                    icon: 'error',
                    confirmButtonColor: '#ea580c',
                });
            }
        }
    };



    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col animate-fade-in p-6 gap-6" style={{ minHeight: 'calc(100vh - 10rem)' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">OCR Document Scanner</h2>
                    <p className="text-sm text-zinc-500 mt-1">Upload documents to extract text using OCR technology</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Upload Section */}
                <div className="flex flex-col gap-4">
                    {/* File Upload Area */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Upload Document</h3>

                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors cursor-pointer bg-zinc-50"
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            PNG, JPG, GIF, BMP, PDF (max 3MB)
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Selected File Info */}
                        {selectedFile && (
                            <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{selectedFile.name}</p>
                                            <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClear}
                                        className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Document Preview */}
                        {(previewUrl || (selectedFile && selectedFile.type === 'application/pdf')) && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-zinc-700 mb-2">Document Preview</h4>
                                <div className="border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                                    {selectedFile && selectedFile.type === 'application/pdf' ? (
                                        <iframe
                                            src={URL.createObjectURL(selectedFile)}
                                            className="w-full h-96"
                                            title="PDF Preview"
                                        />
                                    ) : previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || loading}
                                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Extract Text
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={!selectedFile || loading}
                                className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-blue-900">Supported Formats</h4>
                                <p className="text-xs text-blue-700 mt-1">
                                    Images: JPG, PNG, GIF, BMP • Documents: PDF • Max size: 3MB
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex-1 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Extracted Text</h3>
                            <p className="text-sm text-zinc-500 mt-1">Full text content from document</p>
                        </div>

                        {extractedText ? (
                            <div className="flex-1 overflow-auto space-y-4">
                                {/* Grantor Details */}
                                {(metadata.grantorName || metadata.grantorNumber || metadata.tqNumber || metadata.grantorAddress || metadata.grantorPostcode || metadata.grantorTelephone || metadata.grantorEmail) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-3">Grantor Details</h4>
                                        <div className="space-y-2 text-sm">
                                            {metadata.grantorName && <div><span className="font-medium text-blue-700">Name:</span> <span className="text-blue-900">{metadata.grantorName}</span></div>}
                                            {metadata.grantorNumber && <div><span className="font-medium text-blue-700">Grantor No:</span> <span className="text-blue-900">{metadata.grantorNumber}</span></div>}
                                            {metadata.tqNumber && <div><span className="font-medium text-blue-700">TQ/TL Number:</span> <span className="text-blue-900 font-semibold">{metadata.tqNumber}</span></div>}
                                            {metadata.grantorAddress && <div><span className="font-medium text-blue-700">Address:</span> <span className="text-blue-900">{metadata.grantorAddress}</span></div>}
                                            {metadata.grantorPostcode && <div><span className="font-medium text-blue-700">Postcode:</span> <span className="text-blue-900">{metadata.grantorPostcode}</span></div>}
                                            {metadata.grantorTelephone && <div><span className="font-medium text-blue-700">Telephone:</span> <span className="text-blue-900">{metadata.grantorTelephone}</span></div>}
                                            {metadata.grantorEmail && <div><span className="font-medium text-blue-700">Email:</span> <span className="text-blue-900">{metadata.grantorEmail}</span></div>}
                                        </div>
                                    </div>
                                )}

                                {/* Agreement Details */}
                                {(metadata.agreementRef || metadata.agreementDate || metadata.companyWith || metadata.payment || metadata.duration) && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-orange-900 mb-3">Agreement Details</h4>
                                        <div className="space-y-2 text-sm">
                                            {metadata.agreementRef && <div><span className="font-medium text-orange-700">Agreement No:</span> <span className="text-orange-900">{metadata.agreementRef}</span></div>}
                                            {metadata.agreementDate && <div><span className="font-medium text-orange-700">Date:</span> <span className="text-orange-900">{metadata.agreementDate}</span></div>}
                                            {metadata.companyWith && <div><span className="font-medium text-orange-700">With:</span> <span className="text-orange-900">{metadata.companyWith}</span></div>}
                                            {metadata.payment && <div><span className="font-medium text-orange-700">Payment:</span> <span className="text-orange-900">{metadata.payment}</span></div>}
                                            {metadata.duration && <div><span className="font-medium text-orange-700">Duration:</span> <span className="text-orange-900">{metadata.duration}</span></div>}
                                        </div>
                                    </div>
                                )}

                                {/* Wayleave Information */}
                                {(metadata.propertyLocation || metadata.worksDescription || metadata.drawingNumber) && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-green-900 mb-3">Wayleave Information</h4>
                                        <div className="space-y-2 text-sm">
                                            {metadata.propertyLocation && <div><span className="font-medium text-green-700">Property:</span> <span className="text-green-900">{metadata.propertyLocation}</span></div>}
                                            {metadata.worksDescription && <div><span className="font-medium text-green-700">Works:</span> <span className="text-green-900">{metadata.worksDescription}</span></div>}
                                            {metadata.drawingNumber && <div><span className="font-medium text-green-700">Drawing No:</span> <span className="text-green-900">{metadata.drawingNumber}</span></div>}
                                        </div>
                                    </div>
                                )}

                                {/* Full Extracted Text */}
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">Full Extracted Text</h4>
                                    <pre className="text-xs text-zinc-700 whitespace-pre-wrap break-words font-mono max-h-96 overflow-auto">{extractedText}</pre>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSave}
                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Save Wayleave Agreement
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg">
                                <div className="text-center text-zinc-400">
                                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm font-medium">No text extracted yet</p>
                                    <p className="text-xs mt-1">Upload a document to extract text content</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Document Modal */}
            {viewingDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b border-zinc-200 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-zinc-900">Wayleave Agreement Details</h3>
                                <p className="text-sm text-zinc-500 mt-1">{viewingDocument.filename}</p>
                            </div>
                            <button
                                onClick={() => setViewingDocument(null)}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Grantor Details */}
                            {(viewingDocument.grantor_name || viewingDocument.tq_number || viewingDocument.grantor_address || viewingDocument.grantor_postcode || viewingDocument.grantor_telephone || viewingDocument.grantor_email) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Grantor Details</h4>
                                    <div className="space-y-2 text-sm">
                                        {viewingDocument.grantor_name && <div><span className="font-medium text-blue-700">Name:</span> <span className="text-blue-900">{viewingDocument.grantor_name}</span></div>}
                                        {viewingDocument.tq_number && <div><span className="font-medium text-blue-700">TQ/TL Number:</span> <span className="text-blue-900 font-semibold">{viewingDocument.tq_number}</span></div>}
                                        {viewingDocument.grantor_address && <div><span className="font-medium text-blue-700">Address:</span> <span className="text-blue-900">{viewingDocument.grantor_address}</span></div>}
                                        {viewingDocument.grantor_postcode && <div><span className="font-medium text-blue-700">Postcode:</span> <span className="text-blue-900">{viewingDocument.grantor_postcode}</span></div>}
                                        {viewingDocument.grantor_telephone && <div><span className="font-medium text-blue-700">Telephone:</span> <span className="text-blue-900">{viewingDocument.grantor_telephone}</span></div>}
                                        {viewingDocument.grantor_email && <div><span className="font-medium text-blue-700">Email:</span> <span className="text-blue-900">{viewingDocument.grantor_email}</span></div>}
                                    </div>
                                </div>
                            )}

                            {/* Agreement Details */}
                            {(viewingDocument.agreement_ref || viewingDocument.agreement_date || viewingDocument.company_with || viewingDocument.payment || viewingDocument.duration) && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-orange-900 mb-3">Agreement Details</h4>
                                    <div className="space-y-2 text-sm">
                                        {viewingDocument.agreement_ref && <div><span className="font-medium text-orange-700">Agreement No:</span> <span className="text-orange-900">{viewingDocument.agreement_ref}</span></div>}
                                        {viewingDocument.agreement_date && <div><span className="font-medium text-orange-700">Date:</span> <span className="text-orange-900">{viewingDocument.agreement_date}</span></div>}
                                        {viewingDocument.company_with && <div><span className="font-medium text-orange-700">With:</span> <span className="text-orange-900">{viewingDocument.company_with}</span></div>}
                                        {viewingDocument.payment && <div><span className="font-medium text-orange-700">Payment:</span> <span className="text-orange-900">{viewingDocument.payment}</span></div>}
                                        {viewingDocument.duration && <div><span className="font-medium text-orange-700">Duration:</span> <span className="text-orange-900">{viewingDocument.duration}</span></div>}
                                    </div>
                                </div>
                            )}

                            {/* Wayleave Information */}
                            {(viewingDocument.property_location || viewingDocument.works_description || viewingDocument.drawing_number) && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-green-900 mb-3">Wayleave Information</h4>
                                    <div className="space-y-2 text-sm">
                                        {viewingDocument.property_location && <div><span className="font-medium text-green-700">Property:</span> <span className="text-green-900">{viewingDocument.property_location}</span></div>}
                                        {viewingDocument.works_description && <div><span className="font-medium text-green-700">Works:</span> <span className="text-green-900">{viewingDocument.works_description}</span></div>}
                                        {viewingDocument.drawing_number && <div><span className="font-medium text-green-700">Drawing No:</span> <span className="text-green-900">{viewingDocument.drawing_number}</span></div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Saved Documents Section */}
            {savedDocuments.length > 0 && (
                <div className="mt-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900">Saved Documents</h3>
                                <p className="text-sm text-zinc-500 mt-1">{savedDocuments.length} document{savedDocuments.length !== 1 ? 's' : ''} saved</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Filename</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Grantor</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Agreement Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Extracted At</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-zinc-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedDocuments.map((doc) => (
                                        <tr key={doc.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                                            <td className="py-3 px-4 text-sm text-zinc-900">{doc.filename}</td>
                                            <td className="py-3 px-4 text-sm text-zinc-700">{doc.grantor_name || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-zinc-700">{doc.agreement_date || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-zinc-500">
                                                {doc.created_at ? new Date(doc.created_at).toLocaleString() : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(doc)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OCRUpload;
