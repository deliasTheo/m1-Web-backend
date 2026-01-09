/**
 * Serveur REST pour l'Audio Sampler Web
 * Sert les presets et les fichiers audio
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync, readdirSync } from 'fs';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Charge automatiquement tous les presets depuis les fichiers JSON
 */
function loadPresetsFromJSON() {
    const presetsPath = path.join(__dirname, 'presets');
    const presets = [];
    
    if (!existsSync(presetsPath)) {
        console.warn('⚠️  Le dossier presets n\'existe pas');
        return presets;
    }
    
    try {
        // Lire tous les fichiers dans le dossier presets
        const files = readdirSync(presetsPath);
        
        // Filtrer uniquement les fichiers .json
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        console.log(`📁 Chargement de ${jsonFiles.length} presets depuis les fichiers JSON...`);
        
        // Charger chaque fichier JSON
        for (const file of jsonFiles) {
            const filePath = path.join(presetsPath, file);
            try {
                const content = readFileSync(filePath, 'utf-8');
                const preset = JSON.parse(content);
                presets.push(preset);
                console.log(`  ✓ ${preset.name} (${preset.samples.length} samples)`);
            } catch (error) {
                console.error(`  ✗ Erreur lors du chargement de ${file}:`, error.message);
            }
        }
        
        console.log(`✅ ${presets.length} presets chargés avec succès\n`);
        
    } catch (error) {
        console.error('Erreur lors de la lecture des presets:', error);
    }
    
    return presets;
}

/**
 * Configuration des presets
 * Chargés automatiquement depuis les fichiers JSON
 */
const presets = loadPresetsFromJSON();

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
app.get('/api/presets', (req, res) => {
    console.log(`Envoi de ${presets.length} presets`);
    res.json(presets);
});

/**
 * Route API : Preset spécifique par nom
 */
app.get('/api/presets/:name', (req, res) => {
    const presetName = req.params.name;
    const preset = presets.find(p => p.name.toLowerCase() === presetName.toLowerCase());
    
    if (preset) {
        res.json(preset);
    } else {
        res.status(404).json({ error: `Preset "${presetName}" non trouvé` });
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
app.listen(PORT, () => {
    console.log('========================================');
    console.log('Audio Sampler Web - Serveur REST');
    console.log('========================================');
    console.log(`Serveur démarré sur: http://localhost:${PORT}`);
    console.log(`API Presets: http://localhost:${PORT}/api/presets`);
    console.log(`Fichiers audio: http://localhost:${PORT}/presets/`);
    console.log('========================================');
    
    // Vérifier que le dossier presets existe
    const presetsPath = path.join(__dirname, 'presets');
    if (!existsSync(presetsPath)) {
        console.warn('⚠️  ATTENTION: Le dossier "presets" n\'existe pas !');
        console.warn('   Créez le dossier et ajoutez vos fichiers audio dedans.');
        console.warn(`   Chemin: ${presetsPath}`);
    } else {
        console.log('✓ Dossier presets trouvé');
    }
    
    console.log('\nAppuyez sur Ctrl+C pour arrêter le serveur');
});

