# Serveur REST pour Audio Sampler Web

Ce serveur Node.js/Express sert les presets et les fichiers audio pour l'application Audio Sampler Web.

## Installation

1. Installer les dépendances :
```bash
cd server
npm install
```

## Structure des fichiers audio

Créez un dossier `presets` dans le répertoire `server` avec la structure suivante :

```
server/
├── server.js
├── package.json
└── presets/
    ├── 808/
    │   ├── Kick 808X.wav
    │   ├── Snare 808 1.wav
    │   ├── Snare 808 2.wav
    │   ├── Clap 808.wav
    │   ├── Hihat 808 Closed.wav
    │   ├── Hihat 808 Open.wav
    │   ├── Tom 808 High.wav
    │   ├── Tom 808 Mid.wav
    │   ├── Tom 808 Low.wav
    │   ├── Cymbal 808.wav
    │   ├── Cowbell 808.wav
    │   └── Rimshot 808.wav
    ├── 909/
    │   ├── Kick 909.wav
    │   ├── Snare 909.wav
    │   ├── Clap 909.wav
    │   ├── Hihat 909 Closed.wav
    │   ├── Hihat 909 Open.wav
    │   ├── Crash 909.wav
    │   ├── Ride 909.wav
    │   └── Tom 909 High.wav
    └── acoustic/
        ├── Kick Acoustic.wav
        ├── Snare Acoustic.wav
        ├── Hihat Closed.wav
        ├── Hihat Open.wav
        ├── Tom 1.wav
        ├── Tom 2.wav
        ├── Crash.wav
        └── Ride.wav
```

## Démarrage

Démarrer le serveur :
```bash
npm start
```

Ou en mode développement :
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Endpoints de l'API

### GET /api/presets
Retourne la liste de tous les presets disponibles.

**Réponse :**
```json
[
  {
    "name": "808",
    "type": "Drumkit",
    "isFactoryPresets": true,
    "samples": [
      { "url": "./808/Kick 808X.wav", "name": "Kick" },
      { "url": "./808/Snare 808 1.wav", "name": "Snare 1" }
    ]
  }
]
```

### GET /api/presets/:name
Retourne un preset spécifique par son nom.

**Exemple :** `/api/presets/808`

### GET /presets/*
Sert les fichiers audio statiques.

**Exemple :** `/presets/808/Kick%20808X.wav`

## Configuration

Pour ajouter de nouveaux presets, modifiez le tableau `presets` dans `server.js` :

```javascript
const presets = [
    {
        name: 'Mon Preset',
        type: 'Drumkit',
        isFactoryPresets: false,
        samples: [
            { url: './mon-preset/fichier1.wav', name: 'Sample 1' },
            { url: './mon-preset/fichier2.wav', name: 'Sample 2' }
        ]
    }
];
```

## Notes

- Le serveur utilise CORS pour permettre les requêtes cross-origin
- Les fichiers audio doivent être au format WAV (recommandé) ou tout format supporté par Web Audio API
- Les noms de fichiers avec espaces sont encodés automatiquement par l'application cliente
- Le serveur supporte le caching et l'ETag pour optimiser les performances

## Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js est installé (version 14+)
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Installez les dépendances : `npm install`

### Les fichiers audio ne se chargent pas
- Vérifiez que le dossier `presets` existe
- Vérifiez que les fichiers audio sont bien nommés et placés dans les bons dossiers
- Vérifiez les logs du serveur pour voir les requêtes
- Vérifiez la console du navigateur pour voir les erreurs

### Erreurs CORS
- Le serveur active CORS par défaut
- Si vous changez le port ou l'URL, vérifiez la configuration CORS dans `server.js`

