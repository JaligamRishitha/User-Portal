import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings
from datetime import datetime

settings = get_settings()

async def send_update_notification(
    grantor_number: str,
    update_type: str,
    updated_fields: dict,
    user_name: str = ""
):
    """
    Send email notification when user updates their details
    
    Args:
        grantor_number: The grantor/vendor ID
        update_type: Type of update (User Details or Bank Details)
        updated_fields: Dictionary of fields that were updated
        user_name: Name of the user making the update
    """
    
    # Skip if SMTP is not configured
    if not settings.smtp_user or not settings.smtp_password:
        print("⚠️ Email notification skipped - SMTP not configured")
        return
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"UKPN Portal - {update_type} Update Request - {grantor_number}"
        message["From"] = settings.smtp_from
        message["To"] = settings.notification_email
        
        # Create HTML content
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 8px 8px 0 0;
                    }}
                    .content {{
                        background: #f9fafb;
                        padding: 20px;
                        border: 1px solid #e5e7eb;
                    }}
                    .field-item {{
                        background: white;
                        padding: 12px;
                        margin: 8px 0;
                        border-left: 4px solid #f97316;
                        border-radius: 4px;
                    }}
                    .field-label {{
                        font-weight: bold;
                        color: #f97316;
                    }}
                    .field-value {{
                        color: #4b5563;
                        margin-top: 4px;
                    }}
                    .footer {{
                        background: #1f2937;
                        color: #9ca3af;
                        padding: 15px;
                        text-align: center;
                        border-radius: 0 0 8px 8px;
                        font-size: 12px;
                    }}
                    .info-box {{
                        background: #fef3c7;
                        border: 1px solid #fbbf24;
                        padding: 12px;
                        border-radius: 6px;
                        margin: 15px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">⚡ UKPN Power Portal</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">{update_type} Update Request</p>
                    </div>
                    
                    <div class="content">
                        <div class="info-box">
                            <strong>📋 Request Details</strong><br>
                            <strong>Grantor Number:</strong> {grantor_number}<br>
                            <strong>User Name:</strong> {user_name or 'N/A'}<br>
                            <strong>Update Type:</strong> {update_type}<br>
                            <strong>Date & Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                        </div>
                        
                        <h3 style="color: #f97316; margin-top: 20px;">Updated Fields:</h3>
                        
                        {''.join([f'''
                        <div class="field-item">
                            <div class="field-label">{field}</div>
                            <div class="field-value">{value if value else 'Not provided'}</div>
                        </div>
                        ''' for field, value in updated_fields.items()])}
                        
                        <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 6px;">
                            <strong>⏰ Action Required:</strong><br>
                            Please review and process this update request within 5 working days.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 0;">UK Power Networks - Property and Consent Team</p>
                        <p style="margin: 5px 0 0 0;">This is an automated notification from UKPN Power Portal</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Create plain text version
        text_content = f"""
        UKPN Power Portal - {update_type} Update Request
        
        Request Details:
        ================
        Grantor Number: {grantor_number}
        User Name: {user_name or 'N/A'}
        Update Type: {update_type}
        Date & Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        Updated Fields:
        ===============
        {chr(10).join([f'{field}: {value if value else "Not provided"}' for field, value in updated_fields.items()])}
        
        Action Required:
        ================
        Please review and process this update request within 5 working days.
        
        ---
        UK Power Networks - Property and Consent Team
        This is an automated notification from UKPN Power Portal
        """
        
        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        
        print(f"✅ Email notification sent successfully to {settings.notification_email}")
        
    except Exception as e:
        print(f"❌ Failed to send email notification: {str(e)}")
        # Don't raise exception - email failure shouldn't block the update
