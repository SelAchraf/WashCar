# Owner Account & Registration Updates

## Changes Summary

### 1. Enhanced Owner Registration (LoginScreen.jsx)

**Changes Made:**
- When "Propriétaire" (Owner) account type is selected during registration:
  - **"Nom complet"** field changes to **"Nom de lavage"** (Wash car name)
  - Added **"Adresse du lavage"** field (Wash car address) - Required for owners
  - Added **"Numéro de téléphone"** field (Phone number) - Required for owners with validation

**Validation:**
- Name field: Required for all users
  - Client: "Veuillez entrer votre nom"
  - Owner: "Veuillez entrer le nom de votre lavage"
- Owner-specific validations:
  - Address: Required
  - Phone: Required and validated with pattern `/^\+?\d[\d\s]{6,}$/`

**New State Variables:**
```javascript
const [address, setAddress] = useState(''); // For owner's wash car address
const [phone, setPhone] = useState('');     // For owner's phone number
```

### 2. Updated Signup Function (AuthContext.jsx)

**Function Signature:**
```javascript
const signUp = async (email, password, name, role = 'client', address = '', phone = '')
```

**Changes:**
- Now accepts `address` and `phone` parameters
- These fields are saved to the user profile in Firestore
- Owner profiles are created with complete wash car information

**User Profile Structure:**
```javascript
{
  name: string,        // Client name or Wash car name
  email: string,
  phone: string,       // Phone number (especially for owners)
  address: string,     // Address (especially for wash car owners)
  role: 'client' | 'owner',
  createdAt: string    // ISO timestamp
}
```

### 3. Added "Mon Compte" Tab to Owner Interface (OwnerScreen.jsx)

**New Tab Added:**
The Owner interface now has 3 tabs:
1. **Réservations** - Bookings management
2. **Services** - Services management
3. **Mon Compte** - Account management (NEW)

**Features of "Mon Compte" Tab:**

#### View Mode:
- Displays wash car information with icons:
  - 🏢 Nom du lavage (Wash car name)
  - ✉️ Email
  - 📍 Adresse (Address)
  - 📞 Téléphone (Phone)
- "Modifier les informations" button to enter edit mode
- "Se déconnecter" (Logout) button at the bottom

#### Edit Mode:
- Editable input fields for:
  - Nom du lavage (with business icon)
  - Adresse (with location icon)
  - Téléphone (with phone icon, phone-pad keyboard)
- "Annuler" button to cancel changes
- "Enregistrer" button to save changes
- Validation: Name is required

**Implementation:**
- New component: `OwnerAccountTab`
- Uses Firebase authentication and backend API
- Updates profile via `PUT /api/users/:uid`
- Includes logout functionality with confirmation dialog

## UI/UX Improvements

### Registration Form:
```
For Owner Account:
┌────────────────────────────────────┐
│ 🏢 Nom de lavage                   │  ← Changed from "Nom complet"
│   [Wash Car Mohamed____________]   │
├────────────────────────────────────┤
│ Type de compte                     │
│ [Client]  [Propriétaire]✓          │
├────────────────────────────────────┤
│ 📍 Adresse du lavage               │  ← NEW
│   [123 Rue de la République____]   │
├────────────────────────────────────┤
│ 📞 Numéro de téléphone             │  ← NEW
│   [0555123456__________________]   │
├────────────────────────────────────┤
│ ✉️ Email                           │
│ 🔒 Mot de passe                    │
└────────────────────────────────────┘
```

### Owner Interface - Mon Compte Tab:
```
┌────────────────────────────────────┐
│           🏢                        │
│   Informations du Lavage           │
├────────────────────────────────────┤
│ 🏢  Nom du lavage                  │
│     Wash Car Mohamed               │
├────────────────────────────────────┤
│ ✉️  Email                          │
│     owner@example.com              │
├────────────────────────────────────┤
│ 📍  Adresse                        │
│     123 Rue de la République       │
├────────────────────────────────────┤
│ 📞  Téléphone                      │
│     0555123456                     │
├────────────────────────────────────┤
│ [✏️ Modifier les informations]     │
├────────────────────────────────────┤
│ [🚪 Se déconnecter]                │
└────────────────────────────────────┘
```

## Files Modified

### Frontend:
1. **`/frontend/src/screens/LoginScreen.jsx`**
   - Added `address` and `phone` state variables
   - Changed placeholder text based on role
   - Added conditional fields for owner registration
   - Added validation for owner-specific fields
   - Updated form reset to include new fields

2. **`/frontend/src/context/AuthContext.jsx`**
   - Updated `signUp` function signature to accept `address` and `phone`
   - Modified user profile creation to include new fields

3. **`/frontend/src/screens/OwnerScreen.jsx`**
   - Added "Mon Compte" tab to tab bar
   - Created new `OwnerAccountTab` component
   - Added profile viewing and editing functionality
   - Added logout functionality
   - Added comprehensive styles for account management UI

## Testing Checklist

### 1. Test Owner Registration
- [ ] Create new owner account
- [ ] Verify "Nom complet" changes to "Nom de lavage"
- [ ] Verify address field appears for owners
- [ ] Verify phone field appears for owners
- [ ] Test validation: empty name
- [ ] Test validation: empty address (owner only)
- [ ] Test validation: empty phone (owner only)
- [ ] Test validation: invalid phone format
- [ ] Verify fields don't appear for client registration

### 2. Test Mon Compte Tab
- [ ] Login as owner
- [ ] Navigate to "Mon Compte" tab
- [ ] Verify all information displays correctly
- [ ] Click "Modifier les informations"
- [ ] Change wash car name
- [ ] Change address
- [ ] Change phone number
- [ ] Click "Enregistrer" and verify success
- [ ] Click "Annuler" and verify changes are discarded
- [ ] Test logout functionality

### 3. Test Client Registration (Unchanged)
- [ ] Create new client account
- [ ] Verify "Nom complet" label is used
- [ ] Verify no address/phone fields appear
- [ ] Verify client can register successfully

## Database Impact

**Updated User Profile Schema:**
```javascript
{
  uid: string,              // Firebase UID
  email: string,
  name: string,             // Client name OR Wash car name
  phone: string,            // Now populated during registration for owners
  address: string,          // Now populated during registration for owners
  role: 'client' | 'owner',
  createdAt: string
}
```

**No migration needed** - Fields already existed in schema, just not populated during registration.

## Benefits

1. **Better Owner Onboarding**: Owners provide complete wash car information during registration
2. **Improved Data Quality**: Address and phone are collected upfront, not left empty
3. **Self-Service**: Owners can update their information without developer intervention
4. **Professional UI**: Clean, modern interface with icons and proper validation
5. **User Experience**: Clear distinction between client and owner registration flows

---

**Status**: ✅ Implemented and Ready for Testing
**Date**: December 2, 2024
