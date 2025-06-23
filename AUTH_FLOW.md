# Flow d'Authentification - Meet2Go

## Vue d'ensemble

L'application Meet2Go implémente un système d'authentification complet avec onboarding, connexion/inscription, et gestion des sessions.

## Flow de Navigation

### 1. Première Ouverture
```
Onboarding → Login/Register → Application Principale
```

### 2. Ouvertures Suivantes
```
Login/Register → Application Principale (si non connecté)
Application Principale (si déjà connecté)
```

## Pages Créées

### 🔄 Onboarding (`/onboarding`)
- **3 slides** de présentation de l'application
- **Navigation** : swipe horizontal + boutons
- **Action finale** : marque l'onboarding comme terminé et redirige vers `/login`

### 🔐 Connexion (`/login`)
- **Champs** : email, mot de passe
- **Fonctionnalités** : 
  - Affichage/masquage du mot de passe
  - Connexion sociale (Google/Apple) - à implémenter
  - Lien vers mot de passe oublié
  - Lien vers inscription
- **Action** : sauvegarde un token et redirige vers `/(tabs)`

### 📝 Inscription (`/register`)
- **Champs** : prénom, nom, email, téléphone, mot de passe, confirmation
- **Validation** : tous les champs requis, mots de passe identiques, 8+ caractères
- **CGU** : case à cocher obligatoire
- **Action** : sauvegarde un token et redirige vers `/(tabs)`

### 🔑 Mot de Passe Oublié (`/forgot-password`)
- **Champ** : email
- **Action** : envoie un email de réinitialisation (simulation)

### 🚪 Déconnexion
- **Localisation** : page profil
- **Action** : supprime le token et redirige vers `/login`

## Gestion des États

### AsyncStorage Keys
- `onboarding-complete` : boolean (string)
- `auth-token` : string (token d'authentification)

### Logique de Navigation
Le layout principal (`app/_layout.tsx`) vérifie ces états et affiche :
1. **Onboarding** si `onboarding-complete` n'existe pas
2. **Pages d'auth** si onboarding terminé mais pas de token
3. **Application principale** si authentifié

## Composants Créés

### LoadingScreen
- Écran de chargement avec logo et spinner
- Affiché pendant la vérification des états

## Scripts Utiles

### Réinitialisation
```bash
npm run reset-auth
```
Supprime les clés AsyncStorage pour tester le flow complet.

## Personnalisation

### Images d'Onboarding
Remplacez les images dans `app/onboarding.tsx` :
```javascript
image: require('../assets/images/illustration1.png'),
```

### Authentification Réelle
Remplacez les simulations dans `login.tsx` et `register.tsx` par vos appels API.

### Connexion Sociale
Implémentez les fonctions `handleGoogleLogin` et `handleAppleLogin`.

## Sécurité

- Les tokens sont stockés localement (AsyncStorage)
- Validation côté client pour les formulaires
- Gestion d'erreurs pour les opérations AsyncStorage

## Tests

1. **Première ouverture** : `npm run reset-auth` puis relancer l'app
2. **Test de déconnexion** : utiliser le bouton dans le profil
3. **Test de navigation** : vérifier les liens entre les pages 