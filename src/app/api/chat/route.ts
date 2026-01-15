import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage } from "@/lib/actions/messages";
import { getCurrentUser } from "@/lib/actions/users";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, text } = await request.json();

        if (!projectId || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify user has access to this project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { clientId: user.id },
                    { client: { role: "ADMIN" } } // Allow admins
                ]
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
        }

        const message = await sendChatMessage(projectId, text);

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}