import { useEffect, useRef, useState } from 'react';

const OCRScanner = () => {
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loginAttempted, setLoginAttempted] = useState(false);

    useEffect(() => {
        const handleIframeLoad = () => {
            setIsLoading(false);

            // Attempt auto-login after iframe loads
            if (!loginAttempted) {
                setLoginAttempted(true);
                attemptAutoLogin();
            }
        };

        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleIframeLoad);
            return () => iframe.removeEventListener('load', handleIframeLoad);
        }
    }, [loginAttempted]);

    const attemptAutoLogin = () => {
        try {
            const iframe = iframeRef.current;
            if (!iframe) return;

            // Try to access iframe content and auto-fill login form
            // Note: This only works if the iframe is from the same origin or has proper CORS
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                // Look for login form fields
                const usernameField = iframeDoc.querySelector('input[type="text"], input[name="username"], input[id="username"]');
                const passwordField = iframeDoc.querySelector('input[type="password"], input[name="password"], input[id="password"]');
                const loginButton = iframeDoc.querySelector('button[type="submit"], input[type="submit"], button:contains("Login")');

                if (usernameField && passwordField) {
                    // Fill in credentials
                    usernameField.value = 'pradeep';
                    passwordField.value = 'shibin';

                    // Trigger input events
                    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordField.dispatchEvent(new Event('input', { bubbles: true }));

                    // Submit form
                    if (loginButton) {
                        setTimeout(() => {
                            loginButton.click();
                        }, 500);
                    }
                }
            } catch (e) {
                // Cross-origin restriction - cannot access iframe content
                console.log('Auto-login not possible due to cross-origin restrictions');
            }
        } catch (error) {
            console.error('Auto-login error:', error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-zinc-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900">OCR Document Scanner</h2>
                        <p className="text-sm text-zinc-500 mt-1">Process and extract text from documents</p>
                    </div>
                    <a
                        href="http://149.102.158.71:2101/ocr?api_key=ocr_k-DvHxnw9FNzuyoqX5gBf453NZXL5E1LllrFevcHsXs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                    </a>
                </div>
            </div>

            {/* OCR Application iframe */}
            <div className="flex-1 relative bg-zinc-50">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                            <p className="text-sm text-zinc-600">Loading OCR Scanner...</p>
                            <p className="text-xs text-zinc-400 mt-2">Attempting auto-login</p>
                        </div>
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    src="http://149.102.158.71:2101/ocr?api_key=ocr_k-DvHxnw9FNzuyoqX5gBf453NZXL5E1LllrFevcHsXs"
                    title="OCR Document Scanner"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="camera; microphone; clipboard-read; clipboard-write"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
                />
            </div>


        </div>
    );
};

export default OCRScanner;
