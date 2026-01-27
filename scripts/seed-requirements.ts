import { PrismaClient, RequirementStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRequirements() {
    console.log('🌱 Seeding Requirements...');

    try {
        // Get first project
        const project = await prisma.project.findFirst({
            include: { client: true }
        });

        if (!project) {
            console.log('❌ No project found. Create a project first.');
            return;
        }

        console.log(`✅ Found project: ${project.title} (ID: ${project.id})`);

        // Create sample requirements
        const requirements = [
            {
                title: "Système de Parrainage",
                description: "Je souhaite un système où mes utilisateurs peuvent inviter d'autres personnes et gagner des récompenses. L'invité devrait recevoir un bonus de bienvenue également.",
                status: RequirementStatus.SUGGESTED,
                createdBy: project.clientId
            },
            {
                title: "Paiement Mobile Money",
                description: "Support complet pour Orange Money, MTN Mobile Money et Moov Money. Les utilisateurs doivent pouvoir payer directement depuis leur téléphone.",
                status: RequirementStatus.IN_REVIEW,
                createdBy: project.clientId
            },
            {
                title: "Tableau de Bord Analytique",
                description: "Un dashboard avec graphiques pour suivre les ventes, le nombre d'utilisateurs actifs, et les revenus. Export Excel souhaité.",
                status: RequirementStatus.APPROVED,
                createdBy: project.clientId
            },
            {
                title: "Chat en Temps Réel",
                description: "Fonctionnalité de messagerie instantanée entre utilisateurs avec notifications push.",
                status: RequirementStatus.SUGGESTED,
                createdBy: project.clientId
            },
            {
                title: "Mode Sombre (Dark Mode)",
                description: "L'application doit avoir un thème sombre en option pour réduire la fatigue visuelle la nuit.",
                status: RequirementStatus.APPROVED,
                createdBy: project.clientId
            }
        ];

        for (const req of requirements) {
            const created = await prisma.requirement.create({
                data: {
                    ...req,
                    projectId: project.id
                }
            });

            console.log(`  ✅ Created: ${created.title} [${created.status}]`);

            // Add sample comment to 2nd requirement
            if (req.title === "Paiement Mobile Money") {
                await prisma.requirementComment.create({
                    data: {
                        requirementId: created.id,
                        authorId: project.clientId,
                        text: "J'utilise principalement Orange Money, mais mes clients utilisent aussi MTN. Est-ce que Moov est vraiment nécessaire ?"
                    }
                });

                await prisma.requirementComment.create({
                    data: {
                        requirementId: created.id,
                        authorId: project.clientId, // In real scenario would be admin
                        text: "On peut commencer avec Orange et MTN, puis ajouter Moov dans une v2. Ça réduira le coût initial."
                    }
                });

                console.log(`    💬 Added 2 comments`);
            }
        }

        console.log('');
        console.log('✨ Requirements seeded successfully!');
        console.log(`📍 View at: http://localhost:3000/dashboard/projects/${project.id}`);

    } catch (error) {
        console.error('❌ Error seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedRequirements();
