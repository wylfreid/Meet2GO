# Meet2Go - Application Mobile de Covoiturage 🚗

Application mobile React Native/Expo pour la plateforme de covoiturage Meet2Go, permettant aux utilisateurs de publier et réserver des trajets.

## 📱 Aperçu du Projet

Meet2Go est une application de covoiturage complète avec :
- **Authentification** : Inscription, connexion, vérification OTP
- **Publication de trajets** : Départ, arrivée, stops intermédiaires, détails véhicule
- **Recherche avancée** : Filtres par prix, date, nombre de places
- **Système de crédits** : Portefeuille virtuel avec transactions
- **Notifications** : Alertes en temps réel
- **Interface moderne** : Thème sombre/clair, navigation intuitive

## 🛠️ Technologies Utilisées

- **React Native** + **Expo** (SDK 53)
- **Expo Router** (navigation basée sur les fichiers)
- **Redux Toolkit** (gestion d'état)
- **NativeWind** (Tailwind CSS pour React Native)
- **Firebase** (Storage pour images)
- **AsyncStorage** (persistance locale)
- **Axios** (requêtes API)

## 📋 Prérequis

- **Node.js** (v16+)
- **npm** ou **yarn**
- **Expo CLI** : `npm install -g @expo/cli`
- **Expo Go** (app mobile pour tester)
- **Android Studio** ou **Xcode** (pour émulateurs)

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd meet2go-mobile
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Firebase
**⚠️ IMPORTANT** : Le projet utilise une configuration Firebase hardcodée dans `services/firebase.ts`.

Si vous voulez utiliser votre propre projet Firebase :
1. Modifier `services/firebase.ts` avec vos propres clés
2. Ou créer un fichier `.env` et modifier le code pour utiliser les variables d'environnement

### 4. Configuration API Backend
**⚠️ IMPORTANT** : Modifier l'URL de l'API dans `services/axios-config.ts` :

```typescript
// Remplacer par l'IP de votre ordinateur
export const API_URL = 'http://VOTRE_IP_LOCALE:3000/api';
```

**Comment trouver votre IP locale :**
- **Windows** : Ouvrir CMD → `ipconfig` → Chercher "Adresse IPv4"
- **Mac/Linux** : Terminal → `ifconfig` ou `ip addr show`
- **Exemple** : `http://192.168.1.100:3000/api`

**Note** : L'IP doit être accessible depuis votre téléphone/émulateur sur le même réseau WiFi.

## 🏃‍♂️ Démarrage

### Développement
```bash
# Démarrer le serveur de développement
npx expo start

# Options disponibles :
# - Appuyer sur 'a' pour Android
# - Appuyer sur 'i' pour iOS
# - Scanner le QR code avec Expo Go
```

### Scripts disponibles
```bash
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur Web
npm run lint       # Vérifier le code
```

## 📁 Structure du Projet

```
meet2go-mobile/
├── app/                    # Pages (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   │   ├── index.tsx      # Accueil
│   │   ├── search.tsx     # Recherche trajets
│   │   ├── publish.tsx    # Publication trajet
│   │   ├── wallet.tsx     # Portefeuille
│   │   └── profile.tsx    # Profil
│   ├── login.tsx          # Connexion
│   ├── register.tsx       # Inscription
│   ├── onboarding.tsx     # Onboarding
│   └── settings/          # Paramètres
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI
│   └── GoogleTextInput.tsx
├── contexts/             # Contextes React
│   ├── AppContext.tsx    # État global app
│   └── OnboardingContext.tsx
├── services/             # Services API
│   ├── api.ts           # Endpoints API
│   ├── axios-config.ts  # Configuration Axios
│   └── firebase.ts      # Firebase Storage
├── store/               # Redux Store
│   ├── index.ts        # Configuration store
│   └── slices/         # Redux slices
│       ├── authSlice.ts
│       ├── ridesSlice.ts
│       └── walletSlice.ts
├── hooks/              # Hooks personnalisés
├── constants/          # Constantes
└── assets/            # Images, fonts
```

## 🔧 Fonctionnalités Principales

### 🔐 Authentification
- **Onboarding** : 3 slides de présentation
- **Inscription** : Email, nom, téléphone + OTP
- **Connexion** : Email/mot de passe
- **Vérification OTP** : Code à 6 chiffres
- **Mot de passe oublié** : Réinitialisation

### 🚗 Gestion des Trajets
- **Publication** : Départ, arrivée, stops, date/heure, prix
- **Recherche** : Filtres avancés, géolocalisation
- **Détails véhicule** : Marque, modèle, couleur, photo
- **Équipements** : Climatisation, WiFi, chargeur
- **Réservations** : Confirmation, annulation

### 💰 Système de Crédits
- **Portefeuille** : Solde en crédits FCFA
- **Transactions** : Historique complet
- **Paiements** : 5 crédits pour publier
- **Remboursements** : Automatiques

### 🎨 Interface
- **Navigation** : 5 onglets principaux
- **Thème** : Sombre/clair
- **Recherche** : Google Places API
- **Notifications** : Badges et alertes
- **Upload** : Photos via Firebase

## 🔄 Flux de Navigation

```
Onboarding → Login/Register → Vérification OTP → Application
```

### Navigation principale
- **Accueil** : Recherche rapide, trajets populaires
- **Recherche** : Filtres avancés, résultats
- **Publication** : Formulaire complet de trajet
- **Portefeuille** : Solde, transactions, ajout crédits
- **Profil** : Informations, paramètres, déconnexion

## 🛡️ Gestion d'État

### Redux Store
```typescript
{
  auth: { user, loading, error },
  rides: { rides, currentRide, userRides },
  wallet: { balance, transactions },
  notifications: { notifications, unreadCount }
}
```

### Persistance
- **AsyncStorage** : Token, données utilisateur, onboarding
- **Redux Persist** : État de l'application
- **Firebase** : Images et fichiers

## 📱 Configuration des Émulateurs

### Android
```bash
# Démarrer l'émulateur Android
npx expo start --android
```

### iOS
```bash
# Démarrer le simulateur iOS
npx expo start --ios
```

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Tests E2E
```bash
npm run test:e2e
```

## 🚀 Déploiement

### Build de production
```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```

### Publication
```bash
npx expo publish
```

## 🔧 Configuration Avancée

### Configuration actuelle
**Firebase** : Configuration hardcodée dans `services/firebase.ts` (lignes 9-16)
**API Backend** : URL à modifier dans `services/axios-config.ts` (ligne 4)

**⚠️ Configuration API obligatoire :**
1. Trouver votre IP locale (voir section Configuration API Backend)
2. Modifier `services/axios-config.ts` avec votre IP
3. S'assurer que le backend tourne sur le port 3000

### Configuration Expo
- **app.json** : Configuration de l'app
- **expo-env.d.ts** : Types TypeScript
- **tailwind.config.js** : Configuration Tailwind

## 🐛 Débogage

### Logs
```bash
# Logs Expo
npx expo logs

# Logs Android
adb logcat

# Logs iOS
xcrun simctl spawn booted log stream
```

### Outils de développement
- **React Native Debugger**
- **Flipper**
- **Expo Dev Tools**

## 📚 Documentation

### Liens utiles
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [NativeWind](https://www.nativewind.dev/)

### API Backend
- Base URL : `http://localhost:3000/api`
- Authentification : Bearer Token
- Documentation : Voir README du backend

## 🤝 Contribution

### Workflow
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request

### Standards
- **ESLint** : Vérification du code
- **Prettier** : Formatage automatique
- **TypeScript** : Typage strict
- **Conventional Commits** : Messages de commit

## 📞 Support

### Contact
- **Email** : support@meet2go.com
- **Documentation** : Voir dossier `/docs`
- **Issues** : GitHub Issues

### FAQ
- **Problèmes d'installation** : Vérifier Node.js et Expo CLI
- **Erreurs de build** : Nettoyer le cache `npx expo start -c`
- **Problèmes de navigation** : Vérifier les routes dans `/app`

## 📄 Licence

MIT License - Voir fichier LICENSE pour plus de détails.

---

**Meet2Go** - Votre plateforme de covoiturage de confiance 🚗✨