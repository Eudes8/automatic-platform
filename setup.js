/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const folders = [
  'src/app/(auth)/login',
  'src/app/(auth)/register',
  'src/app/api/projects',
  'src/app/api/contracts/sign',
  'src/app/api/chat',
  'src/app/api/files/upload',
  'src/app/dashboard/projects',
  'src/app/dashboard/chat',
  'src/app/dashboard/contracts',
  'src/app/admin/users',
  'src/app/admin/projects',
  'src/app/onboarding',
  'src/components/ui',
  'src/components/landing',
  'src/components/dashboard',
  'src/components/onboarding',
  'src/components/shared',
  'src/lib',
  'src/hooks',
  'src/types',
  'src/locales/fr',
  'src/locales/en',
  'prisma/migrations',
  'public/assets/images',
  'public/assets/pdfs',
  'scripts',
];

const files = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/middleware.ts',
  'src/lib/prisma.ts',
  'src/lib/supabase.ts',
  'src/lib/utils.ts',
  'src/lib/pdf-generator.ts',
  'prisma/schema.prisma',
  '.env',
  '.env.example',
  'src/components/landing/Hero.tsx',
  'src/components/landing/Features.tsx',
  'src/components/dashboard/Sidebar.tsx',
  'src/components/dashboard/ProjectCard.tsx',
  'src/components/onboarding/OnboardingForm.tsx',
  'src/types/index.ts',
  'src/types/project.ts',
  'scripts/seed-admin.ts',
  'scripts/generate-contract.ts',
  'docker-compose.yml',
  'README.md',
];

function createStructure() {
  console.log('🚀 Démarrage de la création de la structure AUTOMATIC...');
  folders.forEach(folder => {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Créé : ${folder}`);
    }
  });
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '// File initialized by AUTOMATIC\n');
      console.log(`📄 Créé : ${file}`);
    }
  });
  console.log('\n✅ Structure terminée avec succès !');
}

createStructure();