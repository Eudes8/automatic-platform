import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/users";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messageIds } = await request.json();

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json({ error: "Invalid message IDs" }, { status: 400 });
        }

        // Mark messages as read
        const updated = await prisma.message.updateMany({
            where: {
                id: { in: messageIds }
            },
            data: { read: true }
        });

        return NextResponse.json({ success: true, updated: updated.count });
    } catch (error) {
        console.error("Mark read API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
