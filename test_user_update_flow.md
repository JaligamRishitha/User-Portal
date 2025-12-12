# Test User Update Flow

## ✅ Backend Verification (PASSED)

The API endpoint `GET /api/admin/requests` returns:
```json
{
  "success": true,
  "requests": [
    {
      "id": "user_1",
      "vendor_id": "5000000015",
      "user": "John A DREIER",
      "type": "User Details Update",
      "status": "Pending"
    },
    {
      "id": "user_2",
      "vendor_id": "5000000061",
      "user": "D L BOLTON",
      "type": "User Details Update",
      "status": "Pending"
    }
  ]
}
```

## Frontend Checklist

1. **Open Admin Portal**: http://localhost:5173/admin/requests
2. **Login as admin**: admin@ukpn.com / Admin@123
3. **Check Request Console** - You should see:
   - 2 entries with purple badge "👤 User Details Update"
   - Grantor numbers: 5000000015 and 5000000061
   - "View Details" button to see old vs new values

## If Not Visible

1. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check Browser Console**: F12 → Console tab for errors
3. **Verify API Response**: 
   - F12 → Network tab
   - Look for request to `/api/admin/requests`
   - Check if response contains "User Details Update" entries

## Test User Update from Portal

1. **Login as user**: susanfrogers@gmail.com (grantor 5000000015)
2. **Go to Profile/Settings**
3. **Update mobile number** to: 07888 999 000
4. **Submit update**
5. **Go back to Admin Console**
6. **Refresh** - New update should appear

## Database State

Current vendors with updates:
- 5000000015: updated_at > created_at ✓, bank_details NOT updated ✓
- 5000000061: updated_at > created_at ✓, bank_details NOT updated ✓

Both should show in Request Console!
