# Email Notification Setup

## Overview

The UKPN Power Portal now sends email notifications to the team when users submit update requests for their details.

## Features

✅ **Automated Email Notifications** sent when:
- User updates their personal details
- User updates their bank details

✅ **Email Content Includes:**
- Grantor Number
- User Name
- Update Type (User Details or Bank Details)
- All updated fields with their new values
- Date and Time of the request
- Professional HTML formatting

## Configuration

### 1. Update Backend Environment Variables

Edit `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=rishitha.jaligam@nxzen.com
SMTP_PASSWORD=your-actual-outlook-password
SMTP_FROM=rishitha.jaligam@nxzen.com
NOTIFICATION_EMAIL=rishitha.jaligam@nxzen.com
```

### 2. Outlook/Office 365 Setup

#### Option A: Using Regular Password
1. Go to your Outlook account settings
2. Enable SMTP access
3. Use your regular password in `SMTP_PASSWORD`

#### Option B: Using App Password (Recommended)
1. Go to https://account.microsoft.com/security
2. Enable Two-Factor Authentication if not already enabled
3. Go to "App passwords"
4. Create a new app password for "UKPN Portal"
5. Use this app password in `SMTP_PASSWORD`

### 3. Install Dependencies

The required packages are already in `requirements.txt`:
- `aiosmtplib==3.0.1` - Async SMTP client
- `email-validator==2.1.0` - Email validation

Rebuild the backend container:
```bash
docker-compose up -d --build backend
```

## Email Template

The email includes:

### Header
- UKPN Power Portal branding
- Update type (User Details or Bank Details)

### Content
- **Request Details Box:**
  - Grantor Number
  - User Name
  - Update Type
  - Date & Time

- **Updated Fields:**
  - Each field shown with its new value
  - Orange highlighting for easy reading

- **Action Required:**
  - Reminder to process within 5 working days

### Footer
- UK Power Networks branding
- Automated notification disclaimer

## Testing

### 1. Test Email Configuration

```bash
# Access backend container
docker exec -it ukpn-backend bash

# Test Python email import
python -c "from email_service import send_update_notification; print('Email service loaded successfully')"
```

### 2. Test Full Flow

1. Login to the portal: http://localhost:5173/login
2. Go to User Details or Bank Details
3. Click "Update Details"
4. Select fields to update
5. Provide reasons
6. Enter new values
7. Submit the form
8. Check the email inbox: rishitha.jaligam@nxzen.com

### 3. Check Backend Logs

```bash
# View backend logs
docker logs ukpn-backend --tail 50

# Look for:
# ✅ Email notification sent successfully to rishitha.jaligam@nxzen.com
# OR
# ⚠️ Email notification skipped - SMTP not configured
# OR
# ❌ Failed to send email notification: [error message]
```

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials:**
   ```bash
   docker exec ukpn-backend env | grep SMTP
   ```

2. **Verify Outlook allows SMTP:**
   - Check if 2FA is enabled
   - Use app password instead of regular password
   - Ensure SMTP is not blocked by firewall

3. **Check backend logs:**
   ```bash
   docker logs ukpn-backend -f
   ```

### Common Issues

#### Issue: "Authentication failed"
**Solution:** Use app password instead of regular password

#### Issue: "Connection timeout"
**Solution:** Check firewall settings, ensure port 587 is open

#### Issue: "Email skipped - SMTP not configured"
**Solution:** Set SMTP_USER and SMTP_PASSWORD in .env file

## Email Format Example

```
Subject: UKPN Portal - User Details Update Request - 5000000061

From: rishitha.jaligam@nxzen.com
To: rishitha.jaligam@nxzen.com

[HTML Email with:]
- Orange gradient header
- Request details in yellow info box
- Updated fields in white cards with orange borders
- Blue action required box
- Dark footer
```

## Security Notes

⚠️ **Important:**
1. Never commit `.env` file with real passwords to Git
2. Use app passwords instead of account passwords
3. Keep SMTP credentials secure
4. Consider using environment-specific email addresses for dev/prod

## Production Recommendations

For production deployment:

1. **Use Environment Variables:**
   ```bash
   export SMTP_PASSWORD="your-secure-password"
   ```

2. **Use Secrets Management:**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

3. **Monitor Email Delivery:**
   - Set up logging
   - Track delivery rates
   - Monitor bounce rates

4. **Email Queue:**
   - Consider using Celery for async email sending
   - Implement retry logic
   - Add email queue monitoring

## Files Modified

- `backend/requirements.txt` - Added email dependencies
- `backend/.env` - Added SMTP configuration
- `backend/config.py` - Added email settings
- `backend/email_service.py` - New email service
- `backend/routers/users.py` - Added email notification
- `backend/routers/bank_details.py` - Added email notification

## Next Steps

1. ✅ Set up Outlook app password
2. ✅ Update `.env` with real password
3. ✅ Rebuild backend container
4. ✅ Test email sending
5. ✅ Verify email receipt
6. 🔄 Monitor in production
