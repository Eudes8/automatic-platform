import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
// Liste des mots à traduire (Français -> Anglais)
// Basé sur ton schéma Prisma et tes erreurs
const REPLACEMENTS = {
    "Facture": "Invoice",
    "Utilisateur": "User",
    "Projet": "Project",
    // Tu peux ajouter d'autres corrections ici si besoin
    // "Client": "User", 
};

// Dossiers à ignorer (pour ne pas casser node_modules ou le build)
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build'];

// Extensions de fichiers à scanner
const EXTENSIONS = ['.tsx', '.ts'];

// --- FONCTIONS ---

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            if (EXTENSIONS.includes(path.extname(file))) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function processFiles() {
    console.log("🔍 Recherche des fichiers TypeScript/React...");
    
    // On scanne depuis le dossier actuel
    const files = getAllFiles(process.cwd());
    let modifiedCount = 0;

    files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let fileChanged = false;

        // Sécurité : On ne touche qu'aux fichiers qui importent prisma
        // ou qui semblent utiliser les types.
        // Si tu veux être plus agressif, retire cette condition.
        if (!content.includes('@prisma/client') && !content.includes('types')) {
            // On peut choisir de passer, mais dans le doute, vérifions tout le src
             // return; 
        }

        Object.keys(REPLACEMENTS).forEach(frWord => {
            const enWord = REPLACEMENTS[frWord];
            
            // Regex expliquée :
            // \b = limite de mot (pour ne pas remplacer "Facture" dans "MaFactureGeniale")
            // g = global (plusieurs fois dans le fichier)
            const regex = new RegExp(`\\b${frWord}\\b`, 'g');

            if (regex.test(content)) {
                content = content.replace(regex, enWord);
                fileChanged = true;
                console.log(`   📝 ${path.basename(filePath)} : Remplacement de '${frWord}' -> '${enWord}'`);
            }
        });

        if (fileChanged) {
            fs.writeFileSync(filePath, content, 'utf8');
            modifiedCount++;
        }
    });

    console.log("------------------------------------------------");
    console.log(`✅ Terminé ! ${modifiedCount} fichiers ont été mis à jour.`);
    console.log("👉 Lance 'npx tsc --noEmit' pour vérifier si tout est bon.");
}

// Lancer le script
processFiles();
