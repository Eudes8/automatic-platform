import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/users";
import { supabase } from "@/lib/supabase";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const projectId = formData.get("projectId") as string;

        if (!file || !projectId) {
            return NextResponse.json({ error: "Missing file or projectId" }, { status: 400 });
        }

        // Verify user has access to this project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { clientId: user.id },
                    { client: { role: "ADMIN" } }
                ]
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
        }

        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from("project-assets")
            .upload(`${projectId}/${fileName}`, file);

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        // Save file reference to database
        const asset = await prisma.asset.create({
            data: {
                projectId: projectId,
                name: file.name,
                url: data.path,
                type: file.type
            }
        });

        return NextResponse.json({ success: true, asset });
    } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}