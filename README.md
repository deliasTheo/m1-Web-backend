# m1-web-backend

Serveur REST Node.js/Express pour l’Audio Sampler Web. Sert les métadonnées des presets et des sons depuis MongoDB et les fichiers audio depuis le dossier `presets/`.

## Prérequis

- Node.js 14+
- MongoDB (URI configurable via la variable d’environnement `MONGO_URI`)

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

Ou en mode développement :

```bash
npm run dev
```

Le serveur écoute sur **http://localhost:3000** (port configurable dans `server.js`).

## Structure des fichiers audio

Les fichiers audio sont servis depuis le dossier `presets/` à la racine du projet. Les métadonnées (noms des presets, noms des sons, URLs) sont stockées dans MongoDB ; les URLs pointent vers des chemins sous `/presets/` (ex. `/presets/808/Kick 808X.wav`).

Exemple de structure :

```
m1-web-backend/
├── server.js
├── package.json
└── presets/
    ├── 808/
    │   ├── Kick 808X.wav
    │   └── ...
    └── ...
```

## API

### Presets

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/api/presets` | Liste de tous les presets (avec leurs sons) |
| GET | `/api/presets/:name` | Un preset par nom |
| POST | `/api/preset/addPreset` | Créer un preset (body : `name`, `type`, optionnel `isFactoryPreset`) |
| PUT | `/api/preset/:presetName/modifyName` | Renommer un preset (body : `newName`) |
| DELETE | `/api/preset/:presetName` | Supprimer un preset et tous ses sons |

### Sons

| Méthode | Route | Description |
|--------|--------|-------------|
| PUT | `/api/sound/:soundName/modifyName` | Renommer un son (body : `newName`, `presetName`) |
| DELETE | `/api/sound/:soundName` | Supprimer un son (body : `presetName`) |

**Note :** Il n’existe pas d’endpoint pour ajouter un son à un preset côté backend (addSound non implémenté).

### Fichiers audio

- **GET** `/presets/*` : servir les fichiers audio (ex. `/presets/808/Kick%20808X.wav`).

## Configuration

- **MONGO_URI** : URI de connexion MongoDB (par défaut une valeur de démo dans le code ; en production, utiliser une variable d’environnement).
- **Port** : 3000 par défaut dans `server.js`.

## Fonctionnalités implémentées

- Connexion MongoDB (collections `preset` et `sound`)
- Liste et récupération des presets avec leurs sons
- Création de presets (sans sons côté API)
- Renommage de presets et de sons
- Suppression de presets et de sons
- Service des fichiers audio statiques depuis `presets/`
- CORS activé pour les appels cross-origin

## Ce qui n’est pas fait

- **addSound** : aucun endpoint pour ajouter un son à un preset (création des entrées « son » en base et/ou upload de fichier).
