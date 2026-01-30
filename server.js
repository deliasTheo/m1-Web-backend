/**
 * Serveur REST pour l'Audio Sampler Web
 * Sert les presets et les fichiers audio
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { MongoClient, ObjectId } from 'mongodb';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configuration MongoDB
const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb+srv://root:root@m1-sampler.llqk3my.mongodb.net/?appName=m1-sampler';
const DB_NAME = 'audio_sampler';
const PRESETS_COLLECTION = 'preset';
const SOUNDS_COLLECTION = 'sound';

let db;
let presetsCollection;
let soundsCollection;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Helpers pour formatter les presets depuis MongoDB
 */
function formatPresetWithSamples(doc) {
    return {
        name: doc.name,
        type: doc.type,
        // L'API historique expose "isFactoryPresets"
        isFactoryPresets: doc.isFactoryPreset ?? doc.isFactoryPresets ?? false,
        samples: (doc.samples || []).map(sample => ({
            name: sample.name,
            url: sample.url
        }))
    };
}

async function getAllPresetsFromDb() {
    console.log(presetsCollection.collectionName);
    const cursor = presetsCollection.aggregate([
        {
            $lookup: {
                from: SOUNDS_COLLECTION,
                localField: '_id',
                foreignField: 'presetId',
                as: 'samples'
            }
        }
    ]);

    const docs = await cursor.toArray();
    console.log(docs);
    return docs.map(formatPresetWithSamples);
}

async function getPresetByNameFromDb(name) {
    const cursor = presetsCollection.aggregate([
        { $match: { name } },
        {
            $lookup: {
                from: SOUNDS_COLLECTION,
                localField: '_id',
                foreignField: 'presetId',
                as: 'samples'
            }
        }
    ]);

    const docs = await cursor.toArray();
    if (!docs.length) {
        return null;
    }

    return formatPresetWithSamples(docs[0]);
}

/**
 * Route principale
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Audio Sampler Web - Serveur REST',
        version: '1.0.0',
        endpoints: {
            presets: '/api/presets',
            files: '/presets/*'
        }
    });
});

/**
 * Route API : Liste des presets
 */
app.get('/api/presets', async (req, res, next) => {
    try {
        const presets = await getAllPresetsFromDb();
        console.log(`Envoi de ${presets.length} presets depuis MongoDB`);
        res.json(presets);
    } catch (error) {
        console.error('Erreur lors de la récupération des presets:', error);
        next(error);
    }
});

/**
 * Route API : Preset spécifique par nom
 */
app.get('/api/presets/:name', async (req, res, next) => {
    const presetName = req.params.name;

    try {
        const preset = await getPresetByNameFromDb(presetName);
        console.log(preset);

        if (preset) {
            res.json(preset);
        } else {
            res.status(404).json({ error: `Preset "${presetName}" non trouvé` });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du preset par nom:', error);
        next(error);
    }
});

/**
 * Route API : Ajouter un nouveau preset
 * POST /api/preset/addPreset
 * Body: { name: string, type: string, isFactoryPreset?: boolean }
 */
app.post('/api/preset/addPreset', async (req, res, next) => {
    try {
        const { name, type, isFactoryPreset } = req.body;

        // Validation des champs requis
        if (!name || !type) {
            return res.status(400).json({ 
                error: 'Les champs "name" et "type" sont requis' 
            });
        }

        // Vérifier l'unicité du nom
        const existingPreset = await presetsCollection.findOne({ name });
        if (existingPreset) {
            return res.status(409).json({ 
                error: `Un preset avec le nom "${name}" existe déjà` 
            });
        }

        // Créer le nouveau preset
        const result = await presetsCollection.insertOne({
            name,
            type,
            isFactoryPreset: isFactoryPreset ?? false
        });

        console.log(`✅ Preset "${name}" ajouté avec succès (ID: ${result.insertedId})`);
        res.status(201).json({ 
            message: `Preset "${name}" créé avec succès`,
            name,
            type,
            isFactoryPreset: isFactoryPreset ?? false
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du preset:', error);
        next(error);
    }
});

/**
 * Route API : Modifier le nom d'un preset
 * PUT /api/preset/:presetName/modifyName
 * Body: { newName: string }
 */
app.put('/api/preset/:presetName/modifyName', async (req, res, next) => {
    try {
        const presetName = req.params.presetName;
        const { newName } = req.body;

        // Validation
        if (!newName) {
            return res.status(400).json({ 
                error: 'Le champ "newName" est requis dans le body' 
            });
        }

        // Vérifier que le preset existe
        const preset = await presetsCollection.findOne({ name: presetName });
        if (!preset) {
            return res.status(404).json({ 
                error: `Preset "${presetName}" non trouvé` 
            });
        }

        // Vérifier l'unicité du nouveau nom (sauf si c'est le même)
        if (newName !== presetName) {
            const existingPreset = await presetsCollection.findOne({ name: newName });
            if (existingPreset) {
                return res.status(409).json({ 
                    error: `Un preset avec le nom "${newName}" existe déjà` 
                });
            }
        }

        // Mettre à jour le nom
        await presetsCollection.updateOne(
            { _id: preset._id },
            { $set: { name: newName } }
        );

        console.log(`✅ Preset "${presetName}" renommé en "${newName}"`);
        res.json({ 
            message: `Preset renommé de "${presetName}" à "${newName}"`,
            oldName: presetName,
            newName
        });
    } catch (error) {
        console.error('Erreur lors de la modification du nom du preset:', error);
        next(error);
    }
});

/**
 * Route API : Modifier le nom d'un son
 * PUT /api/sound/:soundName/modifyName
 * Body: { newName: string, presetName: string }
 * Note: Le presetName est requis pour identifier le son (unicité par preset)
 */
app.put('/api/sound/:soundName/modifyName', async (req, res, next) => {
    try {
        const soundName = req.params.soundName;
        const { newName, presetName } = req.body;

        // Validation
        if (!newName) {
            return res.status(400).json({ 
                error: 'Le champ "newName" est requis dans le body' 
            });
        }

        if (!presetName) {
            return res.status(400).json({ 
                error: 'Le champ "presetName" est requis dans le body pour identifier le son' 
            });
        }

        // Trouver le preset par son nom
        const preset = await presetsCollection.findOne({ name: presetName });
        
        if (!preset) {
            return res.status(404).json({ 
                error: `Preset "${presetName}" non trouvé` 
            });
        }

        // Trouver le son dans ce preset
        const sound = await soundsCollection.findOne({ 
            name: soundName,
            presetId: preset._id
        });

        if (!sound) {
            return res.status(404).json({ 
                error: `Son "${soundName}" non trouvé dans le preset "${presetName}"` 
            });
        }

        // Vérifier l'unicité du nouveau nom dans le même preset (sauf si c'est le même)
        if (newName !== soundName) {
            const existingSound = await soundsCollection.findOne({ 
                name: newName,
                presetId: sound.presetId
            });
            if (existingSound) {
                return res.status(409).json({ 
                    error: `Un son avec le nom "${newName}" existe déjà dans le preset "${preset.name}"` 
                });
            }
        }

        // Mettre à jour le nom
        await soundsCollection.updateOne(
            { _id: sound._id },
            { $set: { name: newName } }
        );

        console.log(`✅ Son "${soundName}" renommé en "${newName}" dans le preset "${preset.name}"`);
        res.json({ 
            message: `Son renommé de "${soundName}" à "${newName}"`,
            oldName: soundName,
            newName,
            presetName: preset.name
        });
    } catch (error) {
        console.error('Erreur lors de la modification du nom du son:', error);
        next(error);
    }
});

/**
 * Route pour servir les fichiers audio statiques
 * Les fichiers doivent être dans le dossier ./presets/
 */
app.use('/presets', express.static(path.join(__dirname, 'presets'), {
    // Options pour supporter les gros fichiers et le streaming
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

/**
 * Route 404
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

/**
 * Gestion des erreurs
 */
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

/**
 * Démarrage du serveur
 */
async function main() {
    console.log('Connexion à MongoDB...');

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('✅ Connecté à MongoDB');

        db = client.db(DB_NAME);
        presetsCollection = db.collection(PRESETS_COLLECTION);
        soundsCollection = db.collection(SOUNDS_COLLECTION);
        
        app.listen(PORT, () => {
            console.log('========================================');
            console.log('Audio Sampler Web - Serveur REST');
            console.log('========================================');
            console.log(`Serveur démarré sur: http://localhost:${PORT}`);
            console.log(`API Presets: http://localhost:${PORT}/api/presets`);
            console.log(`Fichiers audio: http://localhost:${PORT}/presets/`);
            console.log('========================================');

            // Vérifier que le dossier presets existe (pour les fichiers audio)
            const presetsPath = path.join(__dirname, 'presets');
            if (!existsSync(presetsPath)) {
                console.warn('⚠️  ATTENTION: Le dossier "presets" n\'existe pas !');
                console.warn('   Créez le dossier et ajoutez vos fichiers audio dedans.');
                console.warn(`   Chemin: ${presetsPath}`);
            } else {
                console.log('✓ Dossier presets trouvé (fichiers audio)');
            }

            console.log('\nAppuyez sur Ctrl+C pour arrêter le serveur');
        });
    } catch (error) {
        console.error('❌ Erreur lors de la connexion à MongoDB:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Erreur inattendue dans le serveur:', error);
    process.exit(1);
});

