import { createAdminUser } from "@/lib/actions/initAdmin";
import { NextResponse } from "next/server";

export async function GET() {
    await createAdminUser();
    return NextResponse.json({ success: true, message: "Admin initialization check complete." });
}
