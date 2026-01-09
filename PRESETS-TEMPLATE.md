# Template de Structure de Presets

Ce fichier explique comment organiser vos fichiers audio pour le serveur.

## Structure Recommandée

```
server/
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
    │
    ├── 909/
    │   ├── Kick 909.wav
    │   ├── Snare 909.wav
    │   ├── Clap 909.wav
    │   ├── Hihat 909 Closed.wav
    │   ├── Hihat 909 Open.wav
    │   ├── Crash 909.wav
    │   ├── Ride 909.wav
    │   └── Tom 909 High.wav
    │
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

## Conventions de Nommage

### Dossiers

- Utilisez des noms courts et explicites
- Sans espaces (utilisez des tirets ou underscores si nécessaire)
- Minuscules de préférence
- Exemples : `808`, `909`, `acoustic`, `my-kit`

### Fichiers Audio

- **Format recommandé** : WAV (non compressé)
- **Qualité** : 44100 Hz, 16-bit ou 24-bit
- Les espaces dans les noms sont acceptés (encodés automatiquement)
- Exemples : 
  - ✅ `Kick 808X.wav`
  - ✅ `Snare_01.wav`
  - ✅ `hihat-closed.wav`
  - ❌ `kick@special#.wav` (éviter les caractères spéciaux)

## Types de Fichiers Supportés

- **.wav** (recommandé) - Haute qualité, sans compression
- **.mp3** - Compressé, fichiers plus petits
- **.ogg** - Alternative libre
- **.m4a** / **.aac** - Selon le navigateur

## Ajouter un Nouveau Preset

### 1. Créer le Dossier

```bash
cd server/presets
mkdir mon-preset
```

### 2. Ajouter les Fichiers Audio

Copiez vos fichiers WAV dans le dossier :

```bash
cp ~/mes-samples/*.wav server/presets/mon-preset/
```

### 3. Modifier server.js

Ouvrez `server/server.js` et ajoutez votre preset au tableau `presets` :

```javascript
const presets = [
    // ... presets existants ...
    
    {
        name: 'Mon Preset',
        type: 'Drumkit',
        isFactoryPresets: false,
        samples: [
            { url: './mon-preset/Kick.wav', name: 'Kick' },
            { url: './mon-preset/Snare.wav', name: 'Snare' },
            { url: './mon-preset/Hihat.wav', name: 'Hihat' },
            // ... jusqu'à 16 samples maximum recommandé
        ]
    }
];
```

### 4. Redémarrer le Serveur

```bash
npm start
```

Votre nouveau preset apparaît dans le menu déroulant !

## Conseils

### Nombre de Samples

- **Optimal** : 8-16 samples par preset
- **Maximum pratique** : 32 samples (limité par la RAM du navigateur)
- Si vous avez plus de samples, créez plusieurs presets

### Organisation Logique

Pour un drumkit typique :

```
Pads 1-4 (bas) :     Kick, Snare, Clap, Rimshot
Pads 5-8 :           Tom Low, Tom Mid, Tom High, Perc
Pads 9-12 :          Hihat Closed, Hihat Open, Crash, Ride
Pads 13-16 :         FX, Cowbell, etc.
```

### Qualité Audio

- **Sample Rate** : 44100 Hz (standard CD)
- **Bit Depth** : 16-bit (suffisant) ou 24-bit (haute qualité)
- **Mono vs Stéréo** : Les deux fonctionnent (stéréo = fichier plus lourd)
- **Durée** : Gardez les samples courts (< 5 secondes idéalement)

### Droits d'Utilisation

⚠️ **Attention aux droits d'auteur !**

- Utilisez uniquement des samples dont vous avez les droits
- Sources légales :
  - Vos propres enregistrements
  - Packs de samples achetés avec licence
  - Samples libres de droits (Creative Commons, domaine public)
  - Samples sous licence open source

## Sources de Samples Gratuits

### Sites Recommandés

- **99Sounds** - Packs gratuits de qualité
- **Bedroom Producers Blog** - Collection de freebies
- **Splice** - Essai gratuit avec samples
- **Freesound.org** - Samples Creative Commons
- **SampleRadar** (MusicRadar) - Packs gratuits réguliers

### Packs Open Source

- **808 State** - Samples classiques de Roland TR-808
- **909 Day** - Samples de Roland TR-909
- **Linux Audio** - Samples pour Hydrogen Drum Machine

## Troubleshooting

### Les fichiers ne se chargent pas

1. Vérifiez les noms de fichiers dans `server.js` vs réalité
2. Attention à la casse (Kick.wav ≠ kick.wav sur Linux)
3. Vérifiez les logs du serveur pour voir les erreurs 404

### Fichiers trop volumineux

Si les fichiers sont lourds (> 5 MB chacun) :

1. Convertir en MP3 pour réduire la taille
2. Réduire le sample rate à 44100 Hz
3. Convertir stéréo → mono si approprié
4. Couper les silences au début/fin

### Qualité Audio Réduite

Si le son est de mauvaise qualité :

1. Utilisez WAV au lieu de MP3
2. Augmentez le bit depth (24-bit)
3. Vérifiez que les fichiers sources sont de bonne qualité
4. Évitez de re-compresser des MP3

---

## Exemple Complet

Créons un preset "My First Kit" :

### 1. Structure des fichiers

```
server/presets/my-first-kit/
├── kick.wav
├── snare.wav
├── hihat-closed.wav
└── hihat-open.wav
```

### 2. Configuration dans server.js

```javascript
{
    name: 'My First Kit',
    type: 'Drumkit',
    isFactoryPresets: false,
    samples: [
        { url: './my-first-kit/kick.wav', name: 'Kick' },
        { url: './my-first-kit/snare.wav', name: 'Snare' },
        { url: './my-first-kit/hihat-closed.wav', name: 'HH Closed' },
        { url: './my-first-kit/hihat-open.wav', name: 'HH Open' }
    ]
}
```

### 3. Résultat

Le preset "My First Kit (Drumkit) - 4 samples" apparaît dans le menu !

Les 4 samples sont assignés aux pads :
- Pad 1 (bas gauche) : Kick
- Pad 2 : Snare
- Pad 3 : HH Closed
- Pad 4 (bas droite) : HH Open

---

Bon sampling ! 🎵

