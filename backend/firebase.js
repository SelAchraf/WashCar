// Convenience shim: re-export admin and db from firebaseAdmin.js
// Some developers prefer the shorter name `firebase.js` in backend.
const { admin, db } = require('./firebaseAdmin');

module.exports = { admin, db };