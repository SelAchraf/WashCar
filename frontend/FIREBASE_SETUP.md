# Firebase Setup Guide

This guide will help you set up Firebase for the WashCar application.

## Prerequisites

1. A Firebase account (create one at https://firebase.google.com/)
2. A Firebase project created in the Firebase Console

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication ⚠️ CRITICAL

**This is required for the app to work!** Without this step, you will get "auth/operation-not-allowed" errors.

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started** (if you haven't set up Authentication yet)
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** authentication:
   - Click on "Email/Password" (or "Email/Password" provider)
   - Toggle the first switch "Enable" to ON (Email/Password provider)
   - **Important**: Make sure "Email link (passwordless sign-in)" is optional - you can leave it OFF
   - Click "Save"
5. Verify it shows "Enabled" status next to Email/Password

## Step 3: Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development) or configure security rules
4. Select a location for your database (choose the closest to your users)
5. Click **Enable**

## Step 4: Configure Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bookings collection - users can only read/write their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Step 5: Create Firestore Index

The app queries bookings by `userId` and orders by `createdAt`. You need to create a composite index:

1. Go to **Firestore Database** > **Indexes**
2. Click **Create Index**
3. Set:
   - Collection ID: `bookings`
   - Fields to index:
     - `userId` (Ascending)
     - `createdAt` (Descending)
4. Click **Create**

Alternatively, Firebase will show you a link in the console when you first run a query that needs this index. You can click that link to create the index automatically.

## Step 6: Get Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the web icon `</>` to add a web app (if you haven't already)
5. Register your app with a nickname (e.g., "WashCar Web")
6. Copy the Firebase configuration object

## Step 7: Update Firebase Configuration in the App

1. Open `frontend/src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 8: Test the Setup

1. Start your app: `npm start`
2. Try creating an account on the login screen
3. Verify that:
   - You can create an account
   - You can log in
   - Your profile is saved in Firestore (check Firebase Console > Firestore Database)
   - Bookings are saved when you create them

## Troubleshooting

### Authentication errors
- Make sure Email/Password authentication is enabled in Firebase Console
- Check that your Firebase config is correct

### Firestore permission errors
- Verify your security rules are set correctly
- Make sure you're logged in when trying to access data

### Index errors
- Create the composite index as described in Step 5
- Wait a few minutes for the index to build

### Query errors
- Check the Firebase Console for error messages
- Verify that the `bookings` collection exists
- Make sure the index is created and ready

## Security Notes

⚠️ **Important**: The security rules provided above are for development. For production:

1. Review and strengthen security rules
2. Add validation for data types
3. Consider adding rate limiting
4. Enable Firebase App Check for additional security
5. Regularly review Firebase usage and costs

## Database Structure

### Users Collection
- Path: `users/{userId}`
- Fields:
  - `name` (string)
  - `email` (string)
  - `phone` (string, optional)
  - `address` (string, optional)
  - `createdAt` (timestamp)

### Bookings Collection
- Path: `bookings/{bookingId}`
- Fields:
  - `userId` (string) - Reference to the user who created the booking
  - `service` (object) - Service details (may include `name` and `price`)
  - `price` (number, optional) - price in DA; may be present either in `service.price` or directly on the booking as `price`
  - `date` (string) - ISO date string (e.g. `2025-11-15T10:32:36.043Z`)
  - `slot` (object) - Time slot details (e.g. `{ id, label }`)
  - `address` (string)
  - `phone` (string)
  - `status` (string) - one of: `En attente`, `Confirmée`, `Annulée`
  - `createdAt` (string) - ISO timestamp

### Services Collection
- Path: `services/{serviceId}`
- Fields:
  - `name` (string)
  - `description` (string)
  - `price` (number)
  - `createdAt` (string)

### Admin role / backend notes
- Admin checks in the backend look for a `role` field on the user's document (e.g. `users/{uid}.role === 'admin'`). To grant a user admin privileges, set that field manually in Firestore for now.
- The backend exposes admin endpoints (under `/api/admin/*`) and verifies the calling user's ID token and role server-side. Admin endpoints are the right way to perform privileged actions (confirm/cancel bookings, manage services) instead of opening broader Firestore rules to clients.

### Booking ID notes
- New bookings use Firestore auto-generated document ids. Older bookings created by the app may include a legacy custom `id` field (e.g. a timestamp string). The backend includes a fallback to locate bookings by that custom `id` when processing admin updates/deletes.

