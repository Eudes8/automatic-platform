"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileToStorage } from "@/lib/storage";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { notifyNewAsset } from "./notifications";

export async function createProjectAsset(formData: FormData) {
    await requireAdmin();
    const projectId = formData.get("projectId") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const urlLink = formData.get("url") as string;
    const file = formData.get("file") as File;

    let finalUrl = urlLink;

    try {
        if (file && file.size > 0) {
            console.log(`Uploading file ${file.name} to storage...`);
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileExt = file.name.split('.').pop();
            const path = `${projectId}/${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;

            // Should verify bucket creation elsewhere or assume it exists. 
            // Users must create bucket 'project-assets' publicly accessible.
            finalUrl = await uploadFileToStorage("project-assets", path, buffer, file.type);
        }

        if (!finalUrl) {
            return { success: false, error: "No URL or File provided" };
        }

        const asset = await prisma.asset.create({
            data: {
                projectId,
                name,
                type,
                url: finalUrl
            }
        });

        // Notify client about new asset
        await notifyNewAsset(projectId, name);

        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath(`/admin/projects/${projectId}`);
        return { success: true, asset };
    } catch (error) {
        console.error("Failed to create asset", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function sendProjectSMS(projectId: string, message: string) {
    await requireAdmin();
    // Simulator
    console.log(`[SMS SIMULATION] To Project ${projectId}: ${message}`);
    // In a real app, you'd call Twilio/Vonage here
    // const project = await prisma.project.findUnique({ where: { id: projectId }, include: { client: true } });
    // if (project?.client?.phone) ... 

    return { success: true, message: "SMS sent (simulated)" };
}

export async function getProjectDetails(projectId: string) {
    await requireAdmin();
    return await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            client: true,
            assets: true,
            contracts: true,
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            requirements: {
                include: {
                    comments: {
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}
