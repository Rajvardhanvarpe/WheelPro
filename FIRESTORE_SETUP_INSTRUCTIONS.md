# Firestore Database Setup Instructions

## Step 1: Update Security Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wheelpro-b8407**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the following **TEMPORARY** rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all access for database initialization
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish** to deploy the rules

## Step 2: Run the Database Initialization Script

After updating the rules in the Firebase Console, run:

```powershell
node scripts/initDatabase.js
```

This will create the following collections with sample data:
- **trucks** - Sample truck records
- **alignments** - Sample alignment records

## Step 3: Restore Secure Rules

After the initialization is complete, go back to the Firebase Console and restore the secure rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trucks collection - authenticated users can read/write
    match /trucks/{truckId} {
      allow read, write: if request.auth != null;
    }
    
    // Alignments collection - authenticated users can read/write
    match /alignments/{alignmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish** to deploy the secure rules.

## Alternative: Manual Data Entry

If you prefer not to temporarily open up the security rules, you can manually add data through the Firebase Console:

1. Go to **Firestore Database** → **Data** tab
2. Click **Start collection**
3. Collection ID: `trucks`
4. Add documents with the following fields:
   - truckNumber (string)
   - owner (string)
   - ownerPhone (string)
   - driver (string)
   - currentKM (number)
   - type (string)
   - status (string)
   - nextDueDate (string)
   - lastAlignmentDate (string)
   - createdAt (timestamp)

Repeat for the `alignments` collection.
