# Bank Details Form Updates - Implementation Guide

## Changes Required:

### 1. Sort Code Edit → Enable Account Number & Account Holder Name
When "Sort Code" is selected for edit, automatically enable "Account Number" and "Account Holder Name" fields for editing.

### 2. Payment Method BACS → Email Mandatory
When Payment Method is "BACS", the Email field must be filled (add validation).

### 3. Add "Faster Payments" to Payment Method Dropdown
✅ COMPLETED - Added "Faster Payments" option to the dropdown

### 4. Account Number Edit → Account Holder Name Mandatory
When "Account Number" is selected for edit, "Account Holder Name" must be filled (add validation).

### 5. P&C Link → Open in Same Window
✅ COMPLETED - Changed from `_blank` to `_self` in PandC.jsx

## Implementation Status:

### Completed:
- ✅ Added "Faster Payments" to payment method dropdown
- ✅ Added validation for BACS → Email required
- ✅ Added validation for Account Number → Account Holder Name required
- ✅ Fixed P&C link to open in same window

### Remaining:
The conditional field enabling logic needs to be added to the form rendering in step 3.

## Code Changes Made:

1. **Payment Method Dropdown** - Added "Faster Payments" option
2. **Validation Logic** - Added checks in submitUpdate function
3. **P&C Link** - Changed `window.open(..., '_blank')` to `window.open(..., '_self')`

## Next Steps:

To complete the conditional field enabling, update the Account Number and Account Holder Name fields in step 3 to check if Sort Code is also selected, and enable them accordingly.
