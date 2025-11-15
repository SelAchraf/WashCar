WashCar backend
================

This backend exposes simple REST endpoints that proxy Firestore operations using the Firebase Admin SDK. It is intentionally small — its job is to host database logic server-side and verify user tokens sent by the client.

Setup
-----

1. Install dependencies

```bash
cd backend
npm install
```

2. Provide Firebase credentials

Either set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to point to a service account JSON, or place `serviceAccountKey.json` in this `backend/` folder.

3. Run

```bash
npm start
```
Endpoints
---------

The server exposes both user-scoped and admin endpoints. All protected endpoints require the client to send a valid Firebase ID token in the `Authorization: Bearer <idToken>` header.

User endpoints

- `GET /api/bookings` - returns bookings for the authenticated user (ordered by `createdAt`).
- `POST /api/bookings` - create a new booking. The server strips any client-supplied `id` and sets `createdAt`; it returns `{ id: <firestoreDocId>, ...booking }`.
- `PUT /api/bookings/:id` - update a booking owned by the authenticated user.

Admin endpoints (require `role: 'admin'` on `users/{uid}`)

- `GET /api/admin/bookings` - list all bookings (ordered by `createdAt`).
- `PUT /api/admin/bookings/:id` - update any booking (e.g. change `status`). For backward compatibility this endpoint will try to find the document by Firestore doc id; if not found it will query bookings where the stored `id` field equals the provided id and operate on the actual Firestore document.
- `DELETE /api/admin/bookings/:id` - delete a booking (same fallback behavior as PUT).
- `GET /api/admin/services` - list services
- `POST /api/admin/services` - create a service
- `PUT /api/admin/services/:id` - update a service
- `DELETE /api/admin/services/:id` - delete a service

- `GET /api/users/:uid` - fetch a user's profile. Admins may fetch any profile; regular users can only fetch their own.
- `PUT /api/users/:uid` - create/update the authenticated user's profile.

Notes
-----

- The server uses `firebase-admin` to verify ID tokens. Clients must send the ID token in the `Authorization` header for protected routes.
- Admin checks are performed by reading the `users/{uid}` document and expecting a `role` field set to `'admin'`.
- Backward compatibility: older bookings might have used a custom `id` field (for example a timestamp string). The admin update/delete endpoints include a fallback query to locate such bookings and operate on the actual Firestore document id.

Run / Deploy
------------

1. Install dependencies

```bash
cd backend
npm install
```

2. Provide Firebase credentials

Either set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON path or place `serviceAccountKey.json` in the `backend/` folder. The server prints helpful startup info about the loaded project id.

3. Start the server

```bash
npm start
```

Security
--------

- The backend performs server-side token verification and role checks so you can keep stricter Firestore rules while still allowing the admin UI to operate through the API.
- In production, remove or reduce verbose console logging (there are helpful debug logs for legacy id mismatches).

If you'd like, I can add `curl` examples showing how to call admin endpoints with an `Authorization` header.


