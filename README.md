# WashCarApp

Projet mobile Expo React Native: "WashCar - Lavage auto à domicile sur réservation".

## Démarrage rapide

```bash
cd frontend
npm install
npx expo start
```

- iOS: appuyez sur i pour lancer le simulateur
- Android: appuyez sur a pour lancer l'émulateur

## Configuration Firebase

⚠️ **Important**: Avant de lancer l'application, vous devez configurer Firebase.

1. Suivez le guide complet dans `frontend/FIREBASE_SETUP.md`
2. Configurez votre projet Firebase
3. Mettez à jour `frontend/src/config/firebase.js` avec vos identifiants Firebase

### Résumé de la configuration Firebase

1. Créez un projet Firebase sur [Firebase Console](https://console.firebase.google.com/)
2. Activez l'authentification Email/Password
3. Créez une base de données Firestore
4. Configurez les règles de sécurité Firestore
5. Créez un index composite pour les réservations
6. Copiez votre configuration Firebase dans `frontend/src/config/firebase.js`

Voir `frontend/FIREBASE_SETUP.md` pour les instructions détaillées.

## Structure
## Structure
- `frontend/`: Application Expo (iOS/Android) avec Firebase for auth and client-side logic
- `backend/`: Node/Express API (uses `firebase-admin`) that provides server-side helpers, admin endpoints and token verification

## Dépendances clés
- ✅ Panel d'administration (via `backend/`) pour confirmer / annuler réservations et gérer les services
- ✅ Système de statut pour les réservations : `En attente`, `Confirmée`, `Annulée` (affichage couleur)
- ✅ Les réservations stockent maintenant `phone` et `price` (si disponible) côté booking/service

## Fonctionnalités

### Authentification
- ✅ Page de connexion/inscription moderne
- ✅ Authentification Firebase (Email/Password)
- ✅ Gestion de session utilisateur
- ✅ Déconnexion

### Données
- ✅ Stockage des réservations dans Firestore
- ✅ Profils utilisateurs synchronisés avec Firebase
- ✅ Données accessibles sur tous les appareils

## Remarques
- Textes UI en français
- Données stockées dans Firebase (nécessite une connexion internet)
- Sécurité: Les utilisateurs ne peuvent accéder qu'à leurs propres données


