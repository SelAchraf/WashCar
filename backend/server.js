const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { admin, db } = require("./firebaseAdmin");

// Helpful startup logs for debugging credential/project issues
try {
  console.log(
    "GOOGLE_APPLICATION_CREDENTIALS=",
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "not set"
  );
  const projectId =
    admin?.app?.()?.options?.projectId ||
    admin?.app?.()?.options?.projectId ||
    "unknown";
  console.log("firebase-admin projectId=", projectId);
} catch (e) {
  // ignore - admin may not be initialized if firebaseAdmin exited earlier
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Middleware to verify Firebase ID Token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match)
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error verifying ID token:", err);
    return res.status(401).json({ error: "Invalid ID token" });
  }
}

// Bookings: create, list, update (user-scoped)
app.get("/api/bookings", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const bookingsRef = db.collection("bookings");
    const snapshot = await bookingsRef
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    const bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

app.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const data = req.body || {};
    // Remove any id field from the request (if present)
    const { id, ...cleanData } = data;
    // Try to attach the user's name to the booking so owner UI can display it without extra lookups
    let clientName = '';
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const p = userDoc.data();
        clientName = p.name || p.email || '';
      }
    } catch (e) {
      console.warn('Could not fetch user profile for booking creation:', e?.message || e);
    }

    const bookingData = {
      ...cleanData,
      userId: uid,
      clientName,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    const ref = await db.collection("bookings").add(bookingData);
    const responseData = { id: ref.id, ...bookingData };
    res.status(201).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.put("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const id = req.params.id;
    const docRef = db.collection("bookings").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists)
      return res.status(404).json({ error: "Booking not found" });
    const docData = docSnap.data();
    if (docData.userId !== uid)
      return res.status(403).json({ error: "Forbidden" });
    await docRef.update(req.body || {});
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// Owner routes (requires user role 'owner')
async function isOwner(req, res, next) {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(403).json({ error: 'Forbidden' });
    const profile = userDoc.data();
    if (profile.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch (err) {
    console.error('isOwner check failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

app.get('/api/owner/bookings', verifyToken, isOwner, async (req, res) => {
  try {
    const uid = req.user.uid;
    // Get all bookings, but we'll filter on the frontend based on service.ownerId
    // OR we can filter here if service is embedded in booking
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
    const allBookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Filter bookings to only show those for this owner's services
    const ownerBookings = allBookings.filter(booking => {
      // Check if the service in the booking belongs to this owner
      if (booking.service && booking.service.ownerId === uid) {
        return true;
      }
      // For backward compatibility with old bookings without ownerId
      // Show all bookings if no ownerId is set (legacy data)
      if (booking.service && !booking.service.ownerId) {
        return true;
      }
      return false;
    });
    
    res.json(ownerBookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

app.put('/api/owner/bookings/:id', verifyToken, isOwner, async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      // Try to find booking by the custom id field
      const query = await db.collection('bookings').where('id', '==', id).get();
      if (!query.empty) {
        // Found it! Use the actual document ID
        const actualDocId = query.docs[0].id;
        const actualDocRef = db.collection('bookings').doc(actualDocId);
        await actualDocRef.update(req.body || {});
        return res.json({ success: true });
      }
      return res.status(404).json({ error: 'Booking not found' });
    }
    await docRef.update(req.body || {});
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

app.delete('/api/owner/bookings/:id', verifyToken, isOwner, async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      // Try to find booking by the custom id field
      const query = await db.collection('bookings').where('id', '==', id).get();
      if (!query.empty) {
        const actualDocId = query.docs[0].id;
        await db.collection('bookings').doc(actualDocId).delete();
        return res.json({ success: true });
      }
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Services management (owner-only)
app.get('/api/owner/services', verifyToken, isOwner, async (req, res) => {
  try {
    const uid = req.user.uid;
    // Owners should only see their own services
    const snapshot = await db.collection('services')
      .where('ownerId', '==', uid)
      .get();
    const services = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by name in memory (to avoid needing composite index)
    services.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// Public services listing (clients read available services)
app.get('/api/services', async (req, res) => {
  try {
    const snapshot = await db.collection('services').get();
    const services = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by name in memory
    services.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(services);
  } catch (err) {
    console.error('Failed to load public services:', err);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// Public owners (lavages) listing - get all owners with their info
app.get('/api/owners', async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'owner').get();
    const owners = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || 'Lavage',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      };
    });
    // Sort by name
    owners.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(owners);
  } catch (err) {
    console.error('Failed to load owners:', err);
    res.status(500).json({ error: 'Failed to load owners' });
  }
});

// Get services for a specific owner
app.get('/api/owners/:ownerId/services', async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const snapshot = await db.collection('services').where('ownerId', '==', ownerId).get();
    const services = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    services.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(services);
  } catch (err) {
    console.error('Failed to load owner services:', err);
    res.status(500).json({ error: 'Failed to load services' });
  }
});


app.post('/api/owner/services', verifyToken, isOwner, async (req, res) => {
  try {
    const uid = req.user.uid;
    const data = req.body || {};
    if (!data.name) return res.status(400).json({ error: 'Name is required' });
    
    // Fetch owner's profile to get their name
    let ownerName = 'Wash Car';
    try {
      const ownerDoc = await db.collection('users').doc(uid).get();
      if (ownerDoc.exists) {
        const ownerProfile = ownerDoc.data();
        ownerName = ownerProfile.name || ownerProfile.email || 'Wash Car';
      }
    } catch (e) {
      console.warn('Could not fetch owner profile for service creation:', e?.message || e);
    }
    
    const serviceData = {
      name: data.name,
      description: data.description || '',
      price: data.price || 0,
      prices: data.prices || { motorcycle: 0, car: 0, truck: 0 },
      timeSlots: data.timeSlots || [],
      ownerId: uid,
      ownerName: ownerName,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('services').add(serviceData);
    res.status(201).json({ id: ref.id, ...serviceData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/owner/services/:id', verifyToken, isOwner, async (req, res) => {
  try {
    const uid = req.user.uid;
    const id = req.params.id;
    const docRef = db.collection('services').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: 'Service not found' });
    
    // Check if this owner owns this service
    const existingService = docSnap.data();
    if (existingService.ownerId && existingService.ownerId !== uid) {
      return res.status(403).json({ error: 'You can only edit your own services' });
    }
    
    await docRef.update(req.body || {});
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/owner/services/:id', verifyToken, isOwner, async (req, res) => {
  try {
    const uid = req.user.uid;
    const id = req.params.id;
    const docRef = db.collection('services').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Check if this owner owns this service
    const existingService = docSnap.data();
    if (existingService.ownerId && existingService.ownerId !== uid) {
      return res.status(403).json({ error: 'You can only delete your own services' });
    }
    
    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete service error:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Users profile endpoints
app.get("/api/users/:uid", verifyToken, async (req, res) => {
  try {
    const uidParam = req.params.uid;
    const currentUid = req.user.uid;
    
    console.log(`Fetching user profile for ${uidParam}, requested by ${currentUid}`);
    
    // Allow users to view their own profile, or allow owners to view any profile
    if (uidParam !== currentUid) {
      // Check if the current user is an owner
      const ownerDoc = await db.collection("users").doc(currentUid).get();
      if (!ownerDoc.exists || ownerDoc.data().role !== "owner") {
        console.log(`Access denied: ${currentUid} is not an owner`);
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    
    const doc = await db.collection("users").doc(uidParam).get();
    if (!doc.exists) {
      console.log(`User profile not found for ${uidParam}`);
      return res.status(404).json({ error: "User profile not found" });
    }
    console.log(`User profile found for ${uidParam}`);
    res.json(doc.data());
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

app.put("/api/users/:uid", verifyToken, async (req, res) => {
  try {
    const uidParam = req.params.uid;
    if (uidParam !== req.user.uid)
      return res.status(403).json({ error: "Forbidden" });
    const data = req.body || {};
    console.log(`Creating/updating user profile for ${uidParam}:`, data);
    await db.collection("users").doc(uidParam).set(data, { merge: true });
    console.log(`User profile saved successfully for ${uidParam}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

app.get("/", (req, res) => res.send("WashCar backend running"));

app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  
  // Find the local network IP
  for (const name of Object.keys(interfaces)) {
    for (const addr of interfaces[name]) {
      if (addr.family === 'IPv4' && !addr.internal) {
        localIp = addr.address;
        break;
      }
    }
  }
  
  console.log(`✓ WashCar backend listening on port ${PORT}`);
  console.log(`✓ Local: http://localhost:${PORT}`);
  console.log(`✓ Network: http://${localIp}:${PORT}`);
  console.log(`\n📱 For Android/iOS devices, use: http://${localIp}:${PORT}`);
});
