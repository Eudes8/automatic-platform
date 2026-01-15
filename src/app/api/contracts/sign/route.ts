import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/users";
import prisma from "@/lib/prisma";
import { generateProjectContract } from "@/lib/utils/pdf";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, signatureBase64 } = await request.json();

        if (!projectId || !signatureBase64) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify user owns this project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                clientId: user.id
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
        }

        // Generate PDF with signature
        const pdfBytes = await generateProjectContract(
            project.title,
            user.name || "Client",
            project.budget ? `${project.budget}€` : "Non spécifié",
            signatureBase64,
            project.id
        );

        // Save signature to database
        let contract = await prisma.contract.findFirst({
            where: { projectId: projectId }
        });

        if (contract) {
            // Update existing contract
            contract = await prisma.contract.update({
                where: { id: contract.id },
                data: {
                    signatureBase64: signatureBase64,
                    signedAt: new Date(),
                    status: "SIGNED"
                }
            });
        } else {
            // Create new contract
            contract = await prisma.contract.create({
                data: {
                    projectId: projectId,
                    content: "Contract content here", // You might want to generate proper content
                    signatureBase64: signatureBase64,
                    signedAt: new Date(),
                    status: "SIGNED"
                }
            });
        }

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: {
                contractSigned: true,
                status: "ANALYSIS"
            }
        });

        return NextResponse.json({
            success: true,
            contract,
            pdfUrl: `/api/contracts/${contract.id}/pdf` // Optional: endpoint to download PDF
        });
    } catch (error) {
        console.error("Contract signing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}