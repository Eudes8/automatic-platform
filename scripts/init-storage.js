import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root manually to avoid dependency issues
const envPath = join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const buckets = [
    { name: 'project-assets', public: false },
    { name: 'finance-vault', public: false },
    { name: 'legal-box', public: false },
    { name: 'system-core', public: true },
];

async function setupStorage() {
    console.log('🚀 Initialisation du stockage Supabase...');

    for (const bucket of buckets) {
        process.stdout.write(`Vérification du bucket "${bucket.name}"... `);

        const { data, error } = await supabase.storage.getBucket(bucket.name);

        if (error && error.message.includes('not found')) {
            console.log('Non trouvé. Création...');
            const { error: createError } = await supabase.storage.createBucket(bucket.name, {
                public: bucket.public
            });

            if (createError) {
                console.error(`❌ Erreur lors de la création de "${bucket.name}":`, createError.message);
            } else {
                console.log(`✅ Bucket "${bucket.name}" créé avec succès (Public: ${bucket.public}).`);
            }
        } else if (error) {
            console.error(`❌ Erreur lors de la vérification de "${bucket.name}":`, error.message);
        } else {
            console.log(`✅ Existe déjà.`);
        }
    }

    console.log('\n✨ Configuration du stockage terminée.');
}

setupStorage();
