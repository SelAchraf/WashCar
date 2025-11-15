const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

// Load service account either from GOOGLE_APPLICATION_CREDENTIALS or backend/serviceAccountKey.json
let serviceAccount = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  const localPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(localPath)) {
    serviceAccount = require(localPath);
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // set projectId explicitly when available in service account
    projectId: serviceAccount.project_id || undefined,
  });
  console.log('firebase-admin initialized using service account JSON');
} else {
  // Local environments usually need a service account JSON file.
  // Avoid attempting to reach GCP metadata server (which fails on local machines).
  console.error('\nERROR: No Firebase service account found.');
  console.error('Provide a service account JSON for local development:');
  console.error(" - set GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccountKey.json\n   OR");
  console.error(" - place a file named 'serviceAccountKey.json' in the backend/ folder\n");
  console.error('See backend/README.md and backend/.env.example for details.');
  // Exit early so developer notices and doesn't get confusing metadata lookup errors
  process.exit(1);
}

const db = admin.firestore();

module.exports = { admin, db };
