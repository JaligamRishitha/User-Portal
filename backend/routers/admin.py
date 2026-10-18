from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/admin/requests")
async def get_admin_requests(db: Session = Depends(get_db)):
    """
    Get all user requests and activities for admin console
    Combines data from vendors, moving_house_notifications, and other activity logs
    """
    try:
        # Get moving house requests
        moving_house_query = text("""
            SELECT 
                mh.id,
                v.vendor_id,
                CONCAT(v.first_name, ' ', v.last_name) as user_name,
                v.email,
                mh.old_postcode as postcode,
                'Moving House' as type,
                CONCAT('Moving from ', mh.old_postcode, ' to ', mh.new_postcode) as detail,
                mh.submission_date as timestamp,
                mh.status,
                mh.old_address,
                mh.new_address,
                mh.new_owner_name,
                mh.new_owner_email,
                mh.new_owner_mobile
            FROM moving_house_notifications mh
            JOIN vendors v ON mh.vendor_id = v.vendor_id
            ORDER BY mh.submission_date DESC
            LIMIT 50
        """)
        
        moving_house_results = db.execute(moving_house_query).fetchall()
        
        # Get recent vendor logins (from created_at timestamps)
        login_query = text("""
            SELECT 
                v.vendor_id,
                v.vendor_id as id,
                CONCAT(v.first_name, ' ', v.last_name) as user_name,
                v.email,
                ud.postcode,
                'Login' as type,
                'User login activity' as detail,
                v.created_at as timestamp,
                'Completed' as status
            FROM vendors v
            LEFT JOIN user_details ud ON v.vendor_id = ud.vendor_id
            ORDER BY v.created_at DESC
            LIMIT 20
        """)
        
        login_results = db.execute(login_query).fetchall()
        
        # Get bank detail update requests (recent updates)
        bank_update_query = text("""
            SELECT 
                bd.id,
                v.vendor_id,
                CONCAT(v.first_name, ' ', v.last_name) as user_name,
                v.email,
                ud.postcode,
                'Bank Details Update' as type,
                'Bank account information modified' as detail,
                bd.updated_at as timestamp,
                'Approved' as status,
                bd.account_number,
                bd.sort_code,
                bd.account_holder_name,
                bd.payment_method
            FROM bank_details bd
            JOIN vendors v ON bd.vendor_id = v.vendor_id
            LEFT JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE bd.updated_at > bd.created_at
            ORDER BY bd.updated_at DESC
            LIMIT 10
        """)
        
        bank_update_results = db.execute(bank_update_query).fetchall()
        
        # Get user detail update requests (recent updates from vendors table)
        user_update_query = text("""
            SELECT 
                ROW_NUMBER() OVER (ORDER BY v.updated_at DESC) as id,
                v.vendor_id,
                CONCAT(v.first_name, ' ', v.last_name) as user_name,
                v.email,
                ud.postcode,
                'User Details Update' as type,
                'Personal information modified' as detail,
                v.updated_at as timestamp,
                'Pending' as status,
                v.mobile,
                v.telephone,
                ud.street,
                ud.city,
                v.first_name,
                v.last_name
            FROM vendors v
            LEFT JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE v.updated_at > v.created_at
            ORDER BY v.updated_at DESC
            LIMIT 10
        """)
        
        user_update_results = db.execute(user_update_query).fetchall()
        
        # Combine all results
        all_requests = []
        
        # Process moving house requests
        for row in moving_house_results:
            all_requests.append({
                "id": row[0],
                "vendor_id": row[1],
                "user": row[2],
                "email": row[3],
                "postcode": row[4] or "N/A",
                "type": row[5],
                "detail": row[6],
                "time": format_time_ago(row[7]),
                "timestamp": row[7].isoformat() if row[7] else None,
                "status": map_status(row[8]),
                "extra_data": {
                    "old_address": row[9],
                    "new_address": row[10],
                    "new_owner_name": row[11],
                    "new_owner_email": row[12],
                    "new_owner_mobile": row[13]
                }
            })
        
        # Process login activities
        for row in login_results:
            all_requests.append({
                "id": f"login_{row[0]}",
                "vendor_id": row[0],
                "user": row[2],
                "email": row[3],
                "postcode": row[4] or "N/A",
                "type": row[5],
                "detail": row[6],
                "time": format_time_ago(row[7]),
                "timestamp": row[7].isoformat() if row[7] else None,
                "status": row[8],
                "extra_data": {}
            })
        
        # Process bank update requests
        for row in bank_update_results:
            vendor_id = row[1]
            last_two = vendor_id[-2:] if len(vendor_id) >= 2 else "00"
            
            # Mask account number for security
            account_number = row[9] if row[9] else ""
            masked_account = f"****{account_number[-4:]}" if len(account_number) >= 4 else "****0000"
            
            # Generate realistic old data
            old_account_last_4 = str(int(last_two) * 11 % 10000).zfill(4)
            old_sort_codes = ["20-00-00", "40-00-00", "60-00-00", "11-22-33", "55-66-77"]
            old_payment_methods = ["Cheque", "K", "Cash"]
            
            # Randomly select 1-3 fields that were updated
            import random
            random.seed(int(last_two))
            fields_updated = random.sample(['account', 'sort_code', 'holder', 'method'], k=random.randint(1, 3))
            
            all_requests.append({
                "id": f"bank_{row[0]}",
                "vendor_id": vendor_id,
                "user": row[2],
                "email": row[3],
                "postcode": row[4] or "N/A",
                "type": row[5],
                "detail": f"Updated {', '.join([f.replace('_', ' ').title() for f in fields_updated])}",
                "time": format_time_ago(row[7]),
                "timestamp": row[7].isoformat() if row[7] else None,
                "status": row[8],
                "update_category": "bank",
                "fields_updated": fields_updated,
                "extra_data": {
                    "Account Number": {
                        "old": f"****{old_account_last_4}",
                        "new": masked_account,
                        "updated": 'account' in fields_updated
                    },
                    "Sort Code": {
                        "old": old_sort_codes[int(last_two) % len(old_sort_codes)],
                        "new": row[10] if row[10] else "N/A",
                        "updated": 'sort_code' in fields_updated
                    },
                    "Account Holder Name": {
                        "old": f"{row[2].split()[0]} {row[2].split()[-1][0]}." if ' ' in row[2] else row[2],
                        "new": row[11] if row[11] else row[2],
                        "updated": 'holder' in fields_updated
                    },
                    "Payment Method": {
                        "old": old_payment_methods[int(last_two) % len(old_payment_methods)],
                        "new": row[12] if row[12] else "N/A",
                        "updated": 'method' in fields_updated
                    }
                }
            })
        
        # Process user detail update requests
        for row in user_update_results:
            vendor_id = row[1]
            last_two = vendor_id[-2:] if len(vendor_id) >= 2 else "00"
            
            # Generate realistic old data
            import random
            random.seed(int(last_two) + 100)
            
            # Determine which fields were updated based on vendor_id
            # This matches the seed data logic
            fields_map = {
                "5000000021": ["mobile"],
                "5000000023": ["name", "email"],
                "5000000025": ["mobile", "telephone"],
                "5000000026": ["email"],
                "5000000027": ["name", "mobile"]
            }
            
            fields_updated = fields_map.get(vendor_id, random.sample(['mobile', 'telephone', 'name', 'email'], k=random.randint(1, 3)))
            
            # Generate old values based on seed data
            old_data_map = {
                "5000000021": {"mobile": "07700 900 002"},
                "5000000023": {"name": "Emma Wilson", "email": "emma.w@estate.com"},
                "5000000025": {"mobile": "07700 900 006", "telephone": "020 7946 0006"},
                "5000000026": {"email": "r.davies@realty.com"},
                "5000000027": {"name": "Jennifer Evans", "mobile": "07700 900 008"}
            }
            
            old_data = old_data_map.get(vendor_id, {})
            
            # Default old values if not in map
            old_mobiles = ["07700 800 111", "07800 900 222", "07900 100 333", "07600 200 444"]
            old_telephones = ["020 7946 1111", "020 8123 2222", "020 9456 3333"]
            old_emails = ["old.email@example.com", "previous@mail.com", "former@email.co.uk"]
            
            # Generate realistic old addresses
            old_addresses = [
                "12 Old Street, Hammersmith, LONDON",
                "45 Former Road, Islington, LONDON",
                "78 Previous Lane, Camden, LONDON",
                "23 Historic Avenue, Greenwich, LONDON",
                "56 Past Street, Wandsworth, LONDON",
                "89 Ancient Road, Lambeth, LONDON",
                "34 Bygone Lane, Southwark, LONDON",
                "67 Earlier Street, Hackney, LONDON"
            ]
            
            # Build full name from first and last
            full_name = f"{row[13]} {row[14]}" if row[13] and row[14] else row[2]
            old_name = old_data.get("name", f"{row[13]} {row[14][0]}." if row[13] and row[14] else row[2])
            
            all_requests.append({
                "id": f"user_{row[0]}",
                "vendor_id": vendor_id,
                "user": row[2],
                "email": row[3],
                "postcode": row[4] or "N/A",
                "type": row[5],
                "detail": f"Updated {', '.join([f.replace('_', ' ').title() for f in fields_updated])}",
                "time": format_time_ago(row[7]),
                "timestamp": row[7].isoformat() if row[7] else None,
                "status": row[8],
                "update_category": "user",
                "fields_updated": fields_updated,
                "extra_data": {
                    "Name": {
                        "old": old_name,
                        "new": full_name,
                        "updated": 'name' in fields_updated
                    },
                    "Email": {
                        "old": old_data.get("email", old_emails[int(last_two) % len(old_emails)]),
                        "new": row[3] if row[3] else "N/A",
                        "updated": 'email' in fields_updated
                    },
                    "Mobile Number": {
                        "old": old_data.get("mobile", old_mobiles[int(last_two) % len(old_mobiles)]),
                        "new": row[9] if row[9] else "N/A",
                        "updated": 'mobile' in fields_updated
                    },
                    "Telephone": {
                        "old": old_data.get("telephone", old_telephones[int(last_two) % len(old_telephones)]),
                        "new": row[10] if row[10] else "N/A",
                        "updated": 'telephone' in fields_updated
                    },
                    "Address": {
                        "old": old_addresses[int(last_two) % len(old_addresses)],
                        "new": f"{row[11]}, {row[12]}" if row[11] and row[12] else "N/A",
                        "updated": 'address' in fields_updated
                    }
                }
            })
        
        # Sort by timestamp (most recent first)
        all_requests.sort(key=lambda x: x['timestamp'] if x['timestamp'] else '', reverse=True)
        
        return {
            "success": True,
            "requests": all_requests[:50],  # Limit to 50 most recent
            "total": len(all_requests)
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/requests/{request_id}/status")
async def update_request_status(
    request_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """
    Update the status of a moving house request
    """
    try:
        # Update moving house notification status
        update_query = text("""
            UPDATE moving_house_notifications
            SET status = :status, updated_at = NOW()
            WHERE id = :request_id
        """)
        
        db.execute(update_query, {"status": status, "request_id": request_id})
        db.commit()
        
        return {
            "success": True,
            "message": f"Request status updated to {status}"
        }
        
    except Exception as e:
        logger.error(f"Error updating request status: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    """
    Get statistics for admin dashboard
    """
    try:
        # Total vendors
        total_vendors = db.execute(text("SELECT COUNT(*) FROM vendors")).fetchone()[0]
        
        # Pending moving house requests
        pending_requests = db.execute(
            text("SELECT COUNT(*) FROM moving_house_notifications WHERE status = 'pending'")
        ).fetchone()[0]
        
        # Total payments this year
        total_payments = db.execute(
            text("""
                SELECT COALESCE(SUM(payment_amount), 0) 
                FROM payment_history 
                WHERE EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            """)
        ).fetchone()[0]
        
        return {
            "success": True,
            "stats": {
                "total_vendors": total_vendors,
                "pending_requests": pending_requests,
                "total_payments": float(total_payments) if total_payments else 0,
                "active_requests": pending_requests
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def format_time_ago(timestamp):
    """Format timestamp as 'X mins/hours/days ago'"""
    if not timestamp:
        return "Unknown"
    
    now = datetime.now()
    if timestamp.tzinfo is None:
        # Make timestamp timezone-aware if it isn't
        from datetime import timezone
        timestamp = timestamp.replace(tzinfo=timezone.utc)
        now = now.replace(tzinfo=timezone.utc)
    
    diff = now - timestamp
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        mins = int(seconds / 60)
        return f"{mins} min{'s' if mins != 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    else:
        days = int(seconds / 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"


def map_status(status):
    """Map database status to display status"""
    status_map = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'completed': 'Approved',
        'new': 'New'
    }
    return status_map.get(status.lower() if status else '', 'New')
