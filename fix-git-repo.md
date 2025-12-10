# Fix Git Repository Issue

## Problem
Your Git repository is initialized in `C:\Users\jalig` (your home directory) instead of your project directory `C:\Users\jalig\Downloads\user-portal`. This is causing Git to track files from your entire user directory including Downloads folder.

## Solution

### Step 1: Check current Git status
```powershell
# In your project directory
cd C:\Users\jalig\Downloads\user-portal
git status
```

### Step 2: Remove Git from parent directory (CAREFUL!)
```powershell
# First, backup any important Git history if needed
# Then remove the .git folder from your user directory

# Navigate to user directory
cd C:\Users\jalig

# Remove the .git folder (this will delete Git history in parent directory)
Remove-Item -Recurse -Force .git

# Also remove .gitignore if it exists there
Remove-Item -Force .gitignore -ErrorAction SilentlyContinue
```

### Step 3: Initialize Git in your project directory
```powershell
# Navigate to your project directory
cd C:\Users\jalig\Downloads\user-portal

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - UKPN Power Portal"
```

### Step 4: Add remote repository (if you have one)
```powershell
# Add your remote repository
git remote add origin <your-repository-url>

# Push to remote
git push -u origin main
# or
git push -u origin master
```

## Alternative: Keep parent Git but exclude Downloads

If you want to keep the Git repository in the parent directory, add this to `C:\Users\jalig\.gitignore`:

```
# Exclude Downloads folder
Downloads/

# Exclude other large folders
Documents/
Pictures/
Videos/
Music/
Desktop/
```

Then run:
```powershell
cd C:\Users\jalig
git rm -r --cached Downloads
git commit -m "Remove Downloads folder from tracking"
```

## Recommended Approach

**Option 1 is recommended** - Remove Git from parent directory and initialize in project directory. This keeps your Git repository clean and only tracks your project files.

## Verify the fix

After fixing, verify:
```powershell
cd C:\Users\jalig\Downloads\user-portal
git rev-parse --show-toplevel
```

This should show: `C:/Users/jalig/Downloads/user-portal`

## Important Notes

⚠️ **Before removing .git from parent directory:**
1. Make sure you don't have important Git history there
2. Backup any important commits
3. Check if other projects depend on that Git repository

✅ **After fixing:**
1. Your Git repository will only track files in `user-portal` directory
2. No more Downloads folder in Git
3. Cleaner Git history
